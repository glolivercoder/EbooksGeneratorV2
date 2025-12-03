from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.mermaid_agent import mermaid_agent
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class DiagramGenerateRequest(BaseModel):
    description: str
    diagram_type: str = "auto"


class DiagramGenerateResponse(BaseModel):
    mermaid_code: str
    diagram_type_used: str
    cost: float
    model: str


@router.post("/diagrams/generate", response_model=DiagramGenerateResponse)
async def generate_diagram(request: DiagramGenerateRequest):
    """
    Gera código Mermaid via IA
    
    Examples:
        description: "Processo de vendas com qualificação, proposta e fechamento"
        diagram_type: "auto" | "flowchart" | "sequence" | "gantt" | etc.
    """
    try:
        logger.info(f"Diagram generation request: {request.description[:50]}...")
        
        result = await mermaid_agent.generate_diagram(
            description=request.description,
            diagram_type=request.diagram_type
        )
        
        return DiagramGenerateResponse(
            mermaid_code=result["mermaid_code"],
            diagram_type_used=result["type_used"],
            cost=result["cost"],
            model=result["model"]
        )
        
    except Exception as e:
        logger.error(f"Error generating diagram: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate diagram: {str(e)}"
        )


@router.get("/diagrams/stats")
async def get_diagram_stats():
    """Retorna estatísticas de uso do Mermaid Agent"""
    try:
        stats = mermaid_agent.get_stats()
        
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
