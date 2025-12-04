"""
Cliente unificado para LLMs com suporte a OpenRouter e Gemini
Inclui sistema de fallback, timeout e seleção inteligente de modelos
"""
from typing import Optional, Dict, Any, List
import httpx
import asyncio
from enum import Enum
import time
import google.generativeai as genai
import logging
import traceback
from config.settings import settings

# Configuração de Logs
logger = logging.getLogger(__name__)

class TaskType(Enum):
    """Tipos de tarefas para seleção de modelo"""
    RESEARCH = "research"  # Pesquisa rápida
    ANALYSIS = "analysis"  # Análise profunda e reasoning
    GENERATION = "generation"  # Geração de conteúdo longo
    IMAGE = "image"  # Geração de imagens


class LLMClient:
    """
    Cliente unificado para múltiplos LLMs
    Gerencia OpenRouter e Gemini com fallback automático
    """
    
    def __init__(self):
        self.openrouter_base = settings.openrouter_base_url
        self.openrouter_key = settings.openrouter_api_key
        self.openai_base = settings.openai_base_url
        self.openai_key = settings.openai_api_key
        self.gemini_key = settings.gemini_api_key
        self.timeout = settings.model_timeout
        
        # Configurar Gemini
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
        
        # Mapeamento de modelos por tipo de tarefa
        self.model_map = {
            TaskType.RESEARCH: [
                "anthropic/claude-3-haiku",
                "google/gemini-flash-1.5",
                "meta-llama/llama-3.1-8b-instruct"
            ],
            TaskType.ANALYSIS: [
                "anthropic/claude-3.5-sonnet",
                "google/gemini-flash-1.5",
                "openai/gpt-4o"
            ],
            TaskType.GENERATION: [
                "google/gemini-flash-1.5",
                "anthropic/claude-3.5-sonnet",
                "openai/gpt-4-turbo"
            ],
            TaskType.IMAGE: [
                "black-forest-labs/flux-schnell",
                "stability-ai/stable-diffusion-xl"
            ]
        }
        
        # Cache de performance
        self.performance_cache: Dict[str, float] = {}
    
    async def generate(
        self,
        prompt: str,
        task_type: TaskType = TaskType.GENERATION,
        model: Optional[str] = None,
        max_tokens: int = 4000,
        temperature: float = 0.7
    ) -> Dict[str, Any]:
        """
        Gera resposta usando LLM apropriado com fallback
        """
        logger.info(f"Iniciando geração - Task: {task_type}, Model: {model}")
        logger.info(f"OpenRouter Key: {'✓' if self.openrouter_key else '✗'}")
        logger.info(f"OpenAI Key: {'✓' if self.openai_key else '✗'}")
        logger.info(f"Gemini Key: {'✓' if self.gemini_key else '✗'}")
        logger.info(f"Timeout: {self.timeout}s")
        
        # Selecionar modelo se não especificado
        if model is None:
            model = self._select_best_model(task_type)
        
        logger.info(f"Modelo selecionado: {model}")
        
        # Tentar Gemini primeiro se for modelo Google
        if "gemini" in model.lower() and self.gemini_key:
            try:
                result = await self._generate_gemini(prompt, max_tokens, temperature)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"Gemini failed: {e}, falling back to other providers")
        
        # Tentar OpenAI se for modelo OpenAI
        if "gpt" in model.lower() or "openai" in model.lower() and self.openai_key:
            try:
                result = await self._generate_openai(prompt, model, max_tokens, temperature)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"OpenAI failed: {e}, falling back to OpenRouter")
        
        # Usar OpenRouter (com fallback automático)
        models_to_try = self.model_map.get(task_type, [model])
        last_error = None
        
        for attempt_model in models_to_try:
            try:
                result = await self._generate_openrouter(
                    prompt=prompt,
                    model=attempt_model,
                    max_tokens=max_tokens,
                    temperature=temperature
                )
                
                # Atualizar cache de performance
                self._update_performance_cache(attempt_model, success=True)
                
                return result
                
            except asyncio.TimeoutError:
                logger.warning(f"Timeout com {attempt_model}, tentando próximo modelo...")
                self._update_performance_cache(attempt_model, success=False)
                last_error = "Timeout"
                continue
                
            except Exception as e:
                logger.error(f"Erro com {attempt_model}: {e}")
                last_error = str(e)
                continue
        
        # Todos os modelos falharam
        logger.error(f"Todos os modelos falharam. Último erro: {last_error}")
        raise Exception(f"Todos os modelos falharam. Último erro: {last_error}")
    
    async def _generate_openrouter(
        self,
        prompt: str,
        model: str,
        max_tokens: int,
        temperature: float
    ) -> Dict[str, Any]:
        """Gera resposta via OpenRouter com timeout"""
        
        headers = {
            "Authorization": f"Bearer {self.openrouter_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",  # Opcional
            "X-Title": "Ebook Generator"  # Opcional
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.openrouter_base}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"OpenRouter Error: {response.status_code} - {response.text}")
                response.raise_for_status()
            
            data = response.json()
            
            return {
                "content": data["choices"][0]["message"]["content"],
                "model": model,
                "provider": "openrouter",
                "tokens": data.get("usage", {}),
                "cost": data.get("usage", {}).get("total_cost", 0)
            }
    
    async def _generate_gemini(
        self,
        prompt: str,
        max_tokens: int,
        temperature: float
    ) -> Optional[Dict[str, Any]]:
        """Gera resposta via Gemini SDK"""
        
        try:
            model = genai.GenerativeModel('gemini-1.5-pro')
            
            # Configurar geração
            generation_config = {
                "max_output_tokens": max_tokens,
                "temperature": temperature,
            }
            
            # Gerar com timeout
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    model.generate_content,
                    prompt,
                    generation_config=generation_config
                ),
                timeout=self.timeout
            )
            
            return {
                "content": response.text,
                "model": "gemini-1.5-pro",
                "provider": "google",
                "tokens": {
                    "prompt_tokens": response.usage_metadata.prompt_token_count if hasattr(response, 'usage_metadata') else 0,
                    "completion_tokens": response.usage_metadata.candidates_token_count if hasattr(response, 'usage_metadata') else 0
                }
            }
            
        except asyncio.TimeoutError:
            raise
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            logger.error(traceback.format_exc())
            return None
    
    async def _generate_openai(
        self,
        prompt: str,
        model: str,
        max_tokens: int,
        temperature: float
    ) -> Dict[str, Any]:
        """Gera resposta via OpenAI com timeout"""
        
        headers = {
            "Authorization": f"Bearer {self.openai_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.openai_base}/chat/completions",
                    headers=headers,
                    json=data
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "content": result["choices"][0]["message"]["content"],
                        "model": model,
                        "provider": "openai",
                        "tokens": {
                            "prompt_tokens": result["usage"]["prompt_tokens"],
                            "completion_tokens": result["usage"]["completion_tokens"]
                        }
                    }
                else:
                    raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")
                    
        except asyncio.TimeoutError:
            raise
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            return None
    
    def _select_best_model(self, task_type: TaskType) -> str:
        """Seleciona melhor modelo baseado em performance histórica"""
        
        candidates = self.model_map.get(task_type, [])
        if not candidates:
            return "anthropic/claude-3-haiku"  # Fallback padrão
        
        # Se não tem histórico, retorna primeiro da lista
        if not self.performance_cache:
            return candidates[0]
        
        # Seleciona baseado em performance
        best_model = candidates[0]
        best_score = self.performance_cache.get(best_model, 1.0)
        
        for model in candidates[1:]:
            score = self.performance_cache.get(model, 1.0)
            if score > best_score:
                best_score = score
                best_model = model
        
        return best_model
    
    def _update_performance_cache(self, model: str, success: bool):
        """Atualiza cache de performance do modelo"""
        
        if model not in self.performance_cache:
            self.performance_cache[model] = 1.0
        
        # Atualizar score (média móvel simples)
        current = self.performance_cache[model]
        if success:
            self.performance_cache[model] = current * 0.9 + 0.1  # Aumenta score
        else:
            self.performance_cache[model] = current * 0.9  # Diminui score
    
    async def test_connection(self) -> Dict[str, Any]:
        """Testa conexão com todos os providers"""
        
        results = {
            "openrouter": False,
            "openai": False,
            "gemini": False,
            "errors": []
        }
        
        # Testar OpenRouter
        if self.openrouter_key:
            try:
                result = await self._generate_openrouter(
                    prompt="Hello",
                    model="anthropic/claude-3-haiku",
                    max_tokens=10,
                    temperature=0.7
                )
                results["openrouter"] = True
            except Exception as e:
                results["errors"].append(f"OpenRouter: {str(e)}")
        
        # Testar OpenAI
        if self.openai_key:
            try:
                result = await self._generate_openai(
                    prompt="Hello",
                    model="gpt-3.5-turbo",
                    max_tokens=10,
                    temperature=0.7
                )
                if result:
                    results["openai"] = True
            except Exception as e:
                results["errors"].append(f"OpenAI: {str(e)}")
        
        # Testar Gemini
        if self.gemini_key:
            try:
                result = await self._generate_gemini(
                    prompt="Hello",
                    max_tokens=10,
                    temperature=0.7
                )
                if result:
                    results["gemini"] = True
            except Exception as e:
                results["errors"].append(f"Gemini: {str(e)}")
        
        return results


# Instância global
llm_client = LLMClient()
