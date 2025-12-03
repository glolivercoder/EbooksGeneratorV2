"""
Template Agent - Gerenciador inteligente de criação de templates
Usa OpenAI (imagens + HTML/CSS) + OpenRouter (texto) com otimização de custos
"""
from typing import Dict, Any, List, Optional
import logging
import json
import openai
from config.settings import settings
from services.llm_client import llm_client, TaskType

logger = logging.getLogger(__name__)

# Tabela de preços por 1M tokens (aproximados, atualizar conforme necessário)
MODEL_PRICING = {
    # OpenAI
    "gpt-4o": {"input": 2.50, "output": 10.00},
    "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    "gpt-4-turbo": {"input": 10.00, "output": 30.00},
    "gpt-3.5-turbo": {"input": 0.50, "output": 1.50},
    "dall-e-3": {"per_image": 0.04},  # 1024x1024 standard
    "dall-e-2": {"per_image": 0.02},  # 1024x1024
    
    # OpenRouter (via anthropic)
    "anthrop ic/claude-3.5-sonnet": {"input": 3.00, "output": 15.00},
    "anthropic/claude-3-haiku": {"input": 0.25, "output": 1.25},
    "anthropic/claude-3-opus": {"input": 15.00, "output": 75.00},
    
    # OpenRouter (via google)
    "google/gemini-pro-1.5": {"input": 0.00, "output": 0.00},  # Free tier
    "google/gemini-flash-1.5": {"input": 0.00, "output": 0.00},  # Free tier
    
    # OpenRouter (via meta)
    "meta-llama/llama-3.1-8b-instruct": {"input": 0.05, "output": 0.08},
    "meta-llama/llama-3.1-70b-instruct": {"input": 0.35, "output": 0.40},
}


class TemplateAgent:
    """
    Agente inteligente para criação de templates
    - Gera HTML/CSS via LLM text
    - Gera imagens via DALL-E ou Flux
    - Calcula custos em tempo real
    - Otimiza escolha de modelo
    """
    
    def __init__(self):
        self.openai_client = openai.OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self.total_cost = 0.0
        self.usage_history: List[Dict] = []
        
    async def create_template(
        self,
        template_type: str,
        pages: int,
        theme: str,
        description: Optional[str] = None,
        use_images: bool = False
    ) -> Dict[str, Any]:
        """
        Cria template completo com IA
        
        Args:
            template_type: 'book', 'magazine', 'presentation'
            pages: Número de páginas
            theme: 'modern', 'minimal', 'elegant', etc.
            description: Descrição adicional
            use_images: Se deve gerar imagens
        
        Returns:
            {
                "nodes": [...],
                "edges": [...],
                "cost": 0.05,
                "models_used": {...}
            }
        """
        logger.info(f"TemplateAgent: Criando {template_type} com {pages} páginas, tema: {theme}")
        
        result = {
            "nodes": [],
            "edges": [],
            "cost": 0.0,
            "models_used": {}
        }
        
        try:
            # ETAPA 1: Gerar estrutura JSON (modelo mais barato)
            structure_result = await self._generate_structure(
                template_type, pages, theme, description
            )
            
            result["nodes"] = structure_result["nodes"]
            result["edges"] = structure_result["edges"]
            result["cost"] += structure_result["cost"]
            result["models_used"]["structure"] = structure_result["model"]
            
            # ETAPA 2: Gerar imagens se solicitado
            if use_images:
                images_result = await self._generate_images(
                    result["nodes"], theme
                )
                
                # Atualizar nodes com imagens
                for node_id, image_url in images_result["images"].items():
                    for node in result["nodes"]:
                        if node["id"] == node_id:
                            node["data"]["src"] = image_url
                            break
                
                result["cost"] += images_result["cost"]
                result["models_used"]["images"] = images_result["model"]
            
            # ETAPA 3: Gerar HTML/CSS refinado (opcional, modelo médio)
            if template_type in ["magazine", "presentation"]:
                html_result = await self._generate_html_css(
                    result["nodes"], theme
                )
                
                # Atualizar nodes com HTML
                for node_id, html in html_result["html"].items():
                    for node in result["nodes"]:
                        if node["id"] == node_id:
                            node["data"]["content"] = html
                            break
                
                result["cost"] += html_result["cost"]
                result["models_used"]["html"] = html_result["model"]
            
            # Registrar no histórico
            self._record_usage(result)
            
            logger.info(f"Template criado com sucesso. Custo total: ${result['cost']:.4f}")
            return result
            
        except Exception as e:
            logger.error(f"Erro ao criar template: {e}")
            raise
    
    async def _generate_structure(
        self,
        template_type: str,
        pages: int,
        theme: str,
        description: Optional[str]
    ) -> Dict[str, Any]:
        """Gera estrutura JSON do template (usa modelo mais barato)"""
        
        # Escolher modelo mais barato para JSON
        model = self._select_cheapest_model(task="json_generation")
        
        prompt = f"""Gere um template de {template_type} com {pages} páginas no estilo {theme}.

Retorne APENAS um JSON válido com esta estrutura:
{{
  "nodes": [
    {{
      "id": "page-1",
      "type": "page",
      "position": {{ "x": 250, "y": 0 }},
      "data": {{ "label": "Capa", "content": "Título elegante" }}
    }},
    {{
      "id": "chapter-1",
      "type": "chapter",
      "position": {{ "x": 100, "y": 150 }},
      "data": {{ "title": "Capítulo 1", "content": "Introdução cativante" }}
    }}
  ],
  "edges": [
    {{ "id": "e1-2", "source": "page-1", "target": "chapter-1" }}
  ]
}}

Tipos disponíveis: page, chapter, image, textBlock, layout
{f"Descrição: {description}" if description else ""}

Seja criativo e profissional!"""

        # Gerar via LLM Client (usa fallback automático)
        response = await llm_client.generate(
            prompt=prompt,
            task_type=TaskType.GENERATION,
            model=model,
            max_tokens=2000,
            temperature=0.7
        )
        
        content = response["content"]
        
        # Parse JSON
        template_data = json.loads(content)
        
        # Calcular custo
        cost = self._calculate_cost(
            model=response["model"],
            input_tokens=response["tokens"].get("prompt_tokens", 500),
            output_tokens=response["tokens"].get("completion_tokens", 1500)
        )
        
        return {
            "nodes": template_data.get("nodes", []),
            "edges": template_data.get("edges", []),
            "cost": cost,
            "model": response["model"]
        }
    
    async def _generate_images(
        self,
        nodes: List[Dict],
        theme: str
    ) -> Dict[str, Any]:
        """Gera imagens para image nodes (usa DALL-E ou Flux)"""
        
        if not self.openai_client:
            logger.warning("OpenAI not configured, skipping image generation")
            return {"images": {}, "cost": 0.0, "model": "none"}
        
        images = {}
        total_cost = 0.0
        
        # Filtrar nodes de imagem
        image_nodes = [n for n in nodes if n["type"] == "image"]
        
        for node in image_nodes:
            try:
                # Gerar prompt para imagem baseado no contexto
                image_prompt = f"Professional {theme} style illustration for {node['data'].get('alt', 'book cover')}"
                
                # Gerar imagem via DALL-E
                response = self.openai_client.images.generate(
                    model="dall-e-2",  # Mais barato
                    prompt=image_prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1
                )
                
                images[node["id"]] = response.data[0].url
                
                # Custo fixo por imagem
                total_cost += MODEL_PRICING["dall-e-2"]["per_image"]
                
                logger.info(f"Imagem gerada para {node['id']}: {image_prompt}")
                
            except Exception as e:
                logger.error(f"Erro ao gerar imagem para {node['id']}: {e}")
                continue
        
        return {
            "images": images,
            "cost": total_cost,
            "model": "dall-e-2"
        }
    
    async def _generate_html_css(
        self,
        nodes: List[Dict],
        theme: str
    ) -> Dict[str, Any]:
        """Gera HTML/CSS refinado para nodes (usa modelo médio)"""
        
        # Modelo médio (equilíbrio custo/qualidade)
        model = "gpt-4o-mini"
        
        html_map = {}
        total_cost = 0.0
        
        # Gerar HTML para pages e chapters
        for node in nodes:
            if node["type"] in ["page", "chapter"]:
                prompt = f"""Gere HTML elegante e moderno para {node['type']} com tema {theme}.

Título: {node['data'].get('title') or node['data'].get('label', '')}
Conteúdo base: {node['data'].get('content', '')}

Retorne APENAS HTML sem tags <html>, <head> ou <body>.
Use classes CSS inline ou estilos modernos.
Seja profissional e bonito!"""

                response = await llm_client.generate(
                    prompt=prompt,
                    task_type=TaskType.GENERATION,
                    model=model,
                    max_tokens=500,
                    temperature=0.8
                )
                
                html_map[node["id"]] = response["content"]
                
                cost = self._calculate_cost(
                    model=response["model"],
                    input_tokens=response["tokens"].get("prompt_tokens", 100),
                    output_tokens=response["tokens"].get("completion_tokens", 300)
                )
                
                total_cost += cost
        
        return {
            "html": html_map,
            "cost": total_cost,
            "model": model
        }
    
    def _select_cheapest_model(self, task: str) -> str:
        """Seleciona modelo mais barato adequado para a tarefa"""
        
        if task == "json_generation":
            # Para JSON, modelos pequenos funcionam bem
            return "google/gemini-flash-1.5"  # Grátis!
        
        elif task == "html_generation":
            # HTML precisa criatividade, mas não reasoning
            return "gpt-4o-mini"  # Barato e bom
        
        elif task == "complex_reasoning":
            # Análise profunda
            return "anthropic/claude-3-haiku"  # Melhor custo/benefício
        
        return "google/gemini-flash-1.5"  # Default mais barato
    
    def _calculate_cost(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """Calcula custo em dólares"""
        
        # Normalizar nome do modelo
        model_key = model.replace("::free", "").strip()
        
        if model_key not in MODEL_PRICING:
            logger.warning(f"Pricing not found for {model_key}, assuming free")
            return 0.0
        
        pricing = MODEL_PRICING[model_key]
        
        # Calcular (preço é por 1M tokens)
        input_cost = (input_tokens / 1_000_000) * pricing.get("input", 0)
        output_cost = (output_tokens / 1_000_000) * pricing.get("output", 0)
        
        return input_cost + output_cost
    
    def _record_usage(self, result: Dict[str, Any]):
        """Registra uso no histórico"""
        
        usage = {
            "timestamp": "now",  # TODO: usar datetime
            "cost": result["cost"],
            "models": result["models_used"],
            "nodes_created": len(result["nodes"])
        }
        
        self.usage_history.append(usage)
        self.total_cost += result["cost"]
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """Retorna estatísticas de uso e custos"""
        
        return {
            "total_cost": self.total_cost,
            "total_requests": len(self.usage_history),
            "average_cost_per_request": self.total_cost / len(self.usage_history) if self.usage_history else 0,
            "history": self.usage_history[-10:]  # Últimos 10
        }


# Instância global
template_agent = TemplateAgent()
