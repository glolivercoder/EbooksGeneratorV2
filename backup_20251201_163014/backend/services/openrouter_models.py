"""
Agente para buscar modelos disponíveis da OpenRouter
Usa OpenAI para extrair informações da página de modelos
"""
import httpx
import asyncio
from typing import List, Dict, Any, Optional
from config.settings import settings
import json
import re

class OpenRouterModelsAgent:
    """Agente para buscar e processar modelos da OpenRouter"""
    
    def __init__(self):
        self.openrouter_base = settings.openrouter_base_url
        self.openrouter_key = settings.openrouter_api_key
        self.openai_key = settings.openai_api_key
    
    async def fetch_models_from_api(self) -> List[Dict[str, Any]]:
        """Busca modelos diretamente da API da OpenRouter"""
        if not self.openrouter_key:
            raise ValueError("OpenRouter API key não configurada")
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(
                    f"{self.openrouter_base}/models",
                    headers={
                        "HTTP-Referer": "https://localhost:5173",
                        "X-Title": "Ebook Generator V2",
                        "Authorization": f"Bearer {self.openrouter_key}"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", [])
                else:
                    raise Exception(f"Erro na API: {response.status_code}")
                    
        except Exception as e:
            print(f"Erro ao buscar modelos da API OpenRouter: {e}")
            return []
    
    async def fetch_models_from_webpage(self) -> Optional[str]:
        """Busca conteúdo da página de modelos da OpenRouter"""
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get("https://openrouter.ai/models?fmt=table")
                if response.status_code == 200:
                    return response.text
                else:
                    print(f"Erro ao acessar página: {response.status_code}")
                    return None
        except Exception as e:
            print(f"Erro ao buscar página: {e}")
            return None
    
    async def extract_models_with_openai(self, html_content: str) -> List[Dict[str, Any]]:
        """Usa OpenAI para extrair informações dos modelos do HTML"""
        if not self.openai_key:
            raise ValueError("OpenAI API key não configurada")
        
        prompt = f"""
        Analise este HTML da página de modelos da OpenRouter e extraia informações sobre os modelos disponíveis.
        
        Retorne APENAS um JSON válido com a seguinte estrutura:
        {{
            "models": [
                {{
                    "id": "string",
                    "name": "string", 
                    "company": "string",
                    "type": "text|image|audio|multimodal",
                    "pricing": "free|paid|freemium",
                    "description": "string",
                    "context_length": number
                }}
            ]
        }}
        
        HTML:
        {html_content[:10000]}
        """
        
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.openai_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [{"role": "user", "content": prompt}],
                        "max_tokens": 4000,
                        "temperature": 0.1
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"]
                    
                    # Extrair JSON do conteúdo
                    if "```json" in content:
                        json_str = content.split("```json")[1].split("```")[0].strip()
                    else:
                        # Tentar encontrar JSON no conteúdo
                        start = content.find("{")
                        end = content.rfind("}") + 1
                        if start != -1 and end > start:
                            json_str = content[start:end]
                        else:
                            raise Exception("JSON não encontrado na resposta")
                    
                    data = json.loads(json_str)
                    return data.get("models", [])
                    
                else:
                    raise Exception(f"Erro na API OpenAI: {response.status_code}")
                    
        except Exception as e:
            print(f"Erro ao extrair modelos com OpenAI: {e}")
            return []
    
    def normalize_model_data(self, models: List[Dict]) -> List[Dict[str, Any]]:
        """Normaliza os dados dos modelos para formato padrão"""
        normalized = []
        
        for model in models:
            normalized_model = {
                "id": model.get("id", ""),
                "name": model.get("name", model.get("id", "")),
                "company": model.get("company", "Unknown"),
                "type": self._normalize_type(model.get("type", "text")),
                "pricing": self._normalize_pricing(model.get("pricing", "paid")),
                "description": model.get("description", ""),
                "context_length": model.get("context_length", 0)
            }
            
            # Preencher campos ausentes com base no ID
            if not normalized_model["company"] and "/" in normalized_model["id"]:
                provider_parts = normalized_model["id"].split("/")
                if len(provider_parts) >= 2:
                    normalized_model["company"] = provider_parts[0].replace("-", " ").title()
            
            normalized.append(normalized_model)
        
        return normalized
    
    def _normalize_type(self, model_type: str) -> str:
        """Normaliza o tipo do modelo"""
        type_lower = model_type.lower()
        if "image" in type_lower or "flux" in type_lower or "stable" in type_lower:
            return "image"
        elif "audio" in type_lower or "whisper" in type_lower or "tts" in type_lower:
            return "audio"
        elif "multimodal" in type_lower or "vision" in type_lower or "gpt-4o" in type_lower:
            return "multimodal"
        else:
            return "text"
    
    def _normalize_pricing(self, pricing: str) -> str:
        """Normaliza o tipo de preço"""
        pricing_lower = pricing.lower()
        if "free" in pricing_lower:
            return "free"
        elif "paid" in pricing_lower or "$" in pricing:
            return "paid"
        else:
            return "freemium"
    
    async def get_available_models(self, use_webpage: bool = False) -> List[Dict[str, Any]]:
        """
        Obtém modelos disponíveis da OpenRouter
        
        Args:
            use_webpage: Se True, usa webpage + OpenAI. Se False, usa API direta.
        
        Returns:
            Lista de modelos normalizados
        """
        if use_webpage:
            # Método 1: Webpage + OpenAI
            html_content = await self.fetch_models_from_webpage()
            if html_content:
                models = await self.extract_models_with_openai(html_content)
                if models:
                    return self.normalize_model_data(models)
        
        # Método 2: API direta (fallback ou primário)
        api_models = await self.fetch_models_from_api()
        if api_models:
            # Converter formato da API para nosso formato
            normalized = []
            for model in api_models:
                normalized.append({
                    "id": model.get("id", ""),
                    "name": model.get("name", ""),
                    "company": self._extract_company_from_id(model.get("id", "")),
                    "type": self._determine_type_from_name(model.get("name", "")),
                    "pricing": "free" if model.get("pricing", {}).get("prompt", 0) == 0 else "paid",
                    "description": model.get("description", ""),
                    "context_length": model.get("context_length", 0)
                })
            return normalized
        
        return []
    
    def _extract_company_from_id(self, model_id: str) -> str:
        """Extrai nome da empresa do ID do modelo"""
        if "/" in model_id:
            parts = model_id.split("/")
            if len(parts) >= 2:
                company = parts[0].replace("-", " ").title()
                return company
        return "Unknown"
    
    def _determine_type_from_name(self, name: str) -> str:
        """Determina tipo do modelo baseado no nome"""
        name_lower = name.lower()
        if "image" in name_lower or "flux" in name_lower or "stable" in name_lower or "dall" in name_lower:
            return "image"
        elif "whisper" in name_lower or "tts" in name_lower or "speech" in name_lower:
            return "audio"
        elif "vision" in name_lower or "multimodal" in name_lower or "gpt-4o" in name_lower:
            return "multimodal"
        else:
            return "text"

# Instância global
openrouter_models_agent = OpenRouterModelsAgent()
