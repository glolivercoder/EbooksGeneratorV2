from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Literal, Optional, List, Dict
import openai
from config.settings import settings

router = APIRouter()

class TemplateGenerateRequest(BaseModel):
    type: Literal['book', 'magazine', 'presentation', 'custom'] = 'book'
    pages: int = 5
    theme: str = 'modern'
    description: Optional[str] = None

class NodeData(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict

class EdgeData(BaseModel):
    id: str
    source: str
    target: str

class TemplateGenerateResponse(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]

@router.post("/templates/generate", response_model=TemplateGenerateResponse)
async def generate_template(request: TemplateGenerateRequest):
    """
    Generate a template structure using Template Agent with cost tracking
    """
    import logging
    logger = logging.getLogger(__name__)
    
    if not settings.openai_api_key and not settings.openrouter_api_key:
        logger.error("No AI API keys configured")
        raise HTTPException(status_code=500, detail="AI API keys not configured. Check OpenAI_API_KEY or OPENROUTER_API_KEY in .env")
    
    try:
        from agents.template_agent import template_agent
        
        logger.info(f"Generating template: type={request.type}, pages={request.pages}, theme={request.theme}")
        
        # Usar Template Agent (otimiza custos automaticamente)
        result = await template_agent.create_template(
            template_type=request.type,
            pages=request.pages,
            theme=request.theme,
            description=request.description,
            use_images=False  # TODO: adicionar parâmetro no request
        )
        
        logger.info(f"Template generated successfully. Cost: ${result['cost']:.4f}, Models: {result['models_used']}")
        
        # Adicionar metadados de custo aos nodes
        for node in result["nodes"]:
            if "metadata" not in node:
                node["metadata"] = {}
            node["metadata"]["generation_cost"] = result["cost"]
            node["metadata"]["models_used"] = result["models_used"]
        
        return TemplateGenerateResponse(
            nodes=result["nodes"],
            edges=result["edges"]
        )
        
    except ImportError as e:
        logger.error(f"Template Agent not found: {e}")
        raise HTTPException(status_code=500, detail="Template Agent module not installed")
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}")
        raise HTTPException(status_code=500, detail="AI generated invalid JSON. Try again.")
    except openai.AuthenticationError as e:
        logger.error(f"OpenAI Authentication Error: {e}")
        raise HTTPException(status_code=500, detail="Invalid OpenAI API key. Check your .env file.")
    except openai.RateLimitError as e:
        logger.error(f"OpenAI Rate Limit Error: {e}")
        raise HTTPException(status_code=429, detail="OpenAI rate limit exceeded. Please try again later.")
    except Exception as e:
        logger.error(f"Error generating template: {type(e).__name__}: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(status_code=500, detail=f"Failed to generate template: {type(e).__name__}: {str(e)}")


@router.get("/templates/stats")
async def get_template_stats():
    """
    Get usage statistics and costs for template generation
    """
    try:
        from agents.template_agent import template_agent
        
        stats = template_agent.get_usage_stats()
        
        return {
            "status": "success",
            "stats": stats
        }
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return {
            "status": "error",
            "error": str(e)
        }
