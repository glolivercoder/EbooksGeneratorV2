"""
FastAPI Application Principal
Endpoints para geração de ebooks, pesquisa, imagens e configuração
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn

from config.settings import settings
from services.env_manager import env_manager
from api.backup import router as backup_router

app = FastAPI(
    title="Ebook Generator API",
    description="API para geração de ebooks técnicos de alta qualidade com RAG e agentes inteligentes",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restringir em produção
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== Models ====================

class EbookConfig(BaseModel):
    """Configuração para geração de ebook"""
    topic: str
    target_audience: str
    num_chapters: int
    depth_level: int  # 1-5
    language: str = "pt-BR"
    citation_style: str = "ABNT"


class ChapterConfig(BaseModel):
    """Configuração para geração de capítulo individual"""
    chapter_number: int
    chapter_title: str
    topic: str
    context: Optional[str] = None


class PromptRequest(BaseModel):
    """Request para otimização de prompt"""
    user_prompt: str


class OutlineRequest(BaseModel):
    """Request para geração de outline"""
    prompt: str
    target_audience: str = "profissionais"


class FullBookRequest(BaseModel):
    """Request para geração completa"""
    outline: Dict[str, Any]
    book_id: Optional[str] = None


class OutlineUpdate(BaseModel):
    """Update para outline"""
    chapters: List[Dict[str, Any]]


class APIKeyUpdate(BaseModel):
    """Atualização de chaves API"""
    key_name: str
    key_value: str


class ConnectionTest(BaseModel):
    """Resultado de teste de conexão"""
    service: str
    status: str
    message: Optional[str] = None


# ==================== Health Check ====================

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.env
    }


# ==================== Configuration Endpoints ====================

@app.get("/api/config/keys")
async def get_api_keys():
    """Retorna as chaves de API atualmente carregadas nas settings"""
    return {
        "openrouter_api_key": settings.openrouter_api_key or "",
        "openai_api_key": settings.openai_api_key or "",
        "gemini_api_key": settings.gemini_api_key or "",
        "pixabay_api_key": settings.pixabay_api_key or "",
    }


@app.post("/api/config/test-connection", response_model=List[ConnectionTest])
async def test_all_connections():
    """Testa conexão com todas as APIs configuradas"""
    from services.llm_client import llm_client
    
    results = []
    
    # Test LLMs (OpenRouter + Gemini)
    try:
        llm_test = await llm_client.test_connection()
        
        if llm_test.get("openrouter"):
            results.append(ConnectionTest(
                service="OpenRouter",
                status="connected",
                message="Conexão OK - LLMs disponíveis"
            ))
        else:
            results.append(ConnectionTest(
                service="OpenRouter",
                status="not_configured",
                message="Chave API não configurada ou inválida"
            ))
        
        if llm_test.get("openai"):
            results.append(ConnectionTest(
                service="OpenAI",
                status="connected",
                message="Conexão OK - GPT models disponíveis"
            ))
        else:
            results.append(ConnectionTest(
                service="OpenAI",
                status="not_configured",
                message="Chave API não configurada ou inválida"
            ))
        
        if llm_test.get("gemini"):
            results.append(ConnectionTest(
                service="Gemini",
                status="connected",
                message="Conexão OK"
            ))
        else:
            results.append(ConnectionTest(
                service="Gemini",
                status="not_configured",
                message="Chave API não configurada ou inválida"
            ))
    except Exception as e:
        results.append(ConnectionTest(
            service="LLMs",
            status="error",
            message=f"Erro: {str(e)}"
        ))
    
    # Test Pixabay
    pixabay_test = settings.test_pixabay_connection()
    results.append(ConnectionTest(
        service="Pixabay",
        status=pixabay_test["status"],
        message="Configurado" if pixabay_test["status"] == "connected" else "Chave API não configurada"
    ))
    
    return results


@app.put("/api/config/update-keys")
async def update_api_keys(updates: List[APIKeyUpdate]):
    """
    Atualiza chaves API no arquivo .env
    Cria backup automático antes de modificar
    """
    results = {}
    
    for update in updates:
        success = env_manager.update_key(
            key=update.key_name.upper(),
            value=update.key_value
        )
        results[update.key_name] = "updated" if success else "failed"
    
    # Recarregar settings
    from importlib import reload
    from config import settings as settings_module
    reload(settings_module)
    
    return {
        "status": "completed",
        "results": results
    }


# ==================== Generation Endpoints ====================

@app.post("/api/generate/ebook")
async def generate_ebook(config: EbookConfig, background_tasks: BackgroundTasks):
    """
    Gera ebook completo com múltiplos capítulos
    Processo assíncrono com streaming de progresso
    """
    # TODO: Implementar geração completa
    return {
        "status": "started",
        "message": "Geração de ebook iniciada",
        "task_id": "ebook_123",  # Placeholder
        "config": config.model_dump()
    }


@app.post("/api/generate/chapter")
async def generate_chapter(config: ChapterConfig):
    """
    Gera um capítulo individual usando orquestrador
    """
    from agents.orchestrator import orchestrator
    
    try:
        result = await orchestrator.generate_chapter(
            book_id=f"book_{config.chapter_number}",  # TODO: ID real do livro
            chapter_number=config.chapter_number,
            chapter_title=config.chapter_title,
            topic=config.topic,
            target_audience=config.context or "estudantes de graduação"
        )
        
        return {
            "status": "success",
            "chapter": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/prompt/optimize")
async def optimize_prompt(request: PromptRequest):
    """
    Otimiza o prompt do usuário usando LLM
    """
    from agents.orchestrator import orchestrator
    return await orchestrator.optimize_prompt(request.user_prompt)


@app.post("/api/book/generate-outline")
async def generate_outline(request: OutlineRequest):
    """
    Gera o escopo completo do livro (outline)
    """
    from agents.orchestrator import orchestrator
    return await orchestrator.generate_book_outline(
        prompt=request.prompt,
        target_audience=request.target_audience
    )


@app.post("/api/book/generate-full")
async def generate_full_book(request: FullBookRequest, background_tasks: BackgroundTasks):
    """
    Inicia a geração completa do livro em background
    """
    from agents.orchestrator import orchestrator
    import uuid
    
    book_id = request.book_id or str(uuid.uuid4())
    
    # Executar em background para não bloquear
    background_tasks.add_task(
        orchestrator.generate_full_book,
        outline=request.outline,
        book_id=book_id
    )
    
    return {
        "status": "started",
        "book_id": book_id,
        "message": "Geração iniciada em background"
    }


@app.get("/api/book/status/{book_id}")
async def get_book_status(book_id: str):
    """
    Retorna status da geração do livro
    """
    from agents.orchestrator import orchestrator
    return orchestrator.get_book_status(book_id)


@app.get("/api/book/{book_id}")
async def get_book(book_id: str):
    """
    Retorna livro completo gerado
    """
    from agents.orchestrator import orchestrator
    return orchestrator.get_book(book_id)


@app.post("/api/research/deep")
async def deep_research(query: str, academic_only: bool = True):
    """
    Executa pesquisa profunda sobre um tema
    Retorna fontes verificadas e síntese
    """
    from agents.deep_research import research_agent
    
    try:
        results = await research_agent.research(
            query=query,
            academic_only=academic_only,
            max_results=10,
            min_year=2020
        )
        
        return {
            "status": "completed",
            "query": query,
            "sources_count": results["sources_count"],
            "sources": results["sources"],
            "synthesis": results["synthesis"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Image Endpoints ====================

@app.post("/api/images/generate")
async def generate_image(prompt: str, model: Optional[str] = None):
    """
    Gera imagem via OpenRouter
    """
    # TODO: Implementar geração de imagem
    return {
        "status": "pending",
        "prompt": prompt,
        "model": model or settings.image_model
    }


@app.get("/api/images/pixabay")
async def search_pixabay_images(query: str, per_page: int = 10):
    """
    Busca imagens no Pixabay
    """
    # TODO: Implementar busca no Pixabay
    return {
        "query": query,
        "results": [],
        "total": 0
    }


# ==================== Dynamic Agent Endpoints ====================

@app.post("/api/agents/create")
async def create_agent_dynamically(spec: Dict[str, Any]):
    """
    Cria um agente especializado dinamicamente
    Instala bibliotecas necessárias
    """
    # TODO: Implementar criação dinâmica de agentes
    return {
        "status": "created",
        "agent_name": spec.get("name", "unknown"),
        "message": "Implementação pendente"
    }


# ==================== Main ====================

# Incluir routers
app.include_router(backup_router)

# ==================== OpenRouter Models Endpoint ====================

@app.get("/api/openrouter/models")
async def get_openrouter_models(use_webpage: bool = False):
    """
    Retorna modelos disponíveis da OpenRouter
    Pode usar API direta ou webpage + OpenAI para extração
    """
    try:
        from services.openrouter_models import openrouter_models_agent
        
        models = await openrouter_models_agent.get_available_models(use_webpage=use_webpage)
        
        return {
            "status": "success",
            "count": len(models),
            "models": models
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "models": []
        }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=settings.env == "development"
    )
