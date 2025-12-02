"""
FastAPI Application Principal
Endpoints para geração de ebooks, pesquisa, imagens e configuração
"""
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
import json
import os
import traceback
import logging
from datetime import datetime

from config.settings import settings
from services.env_manager import env_manager
from api.backup import router as backup_router
from agents.orchestrator import orchestrator
from services.llm_client import llm_client, TaskType

# Configuração de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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


# ==================== Persistence ====================
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

def load_history() -> List[Dict[str, Any]]:
    """Carrega histórico do arquivo JSON"""
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Erro ao carregar histórico: {e}")
        return []

def save_history(history: List[Dict[str, Any]]):
    """Salva histórico no arquivo JSON"""
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logger.error(f"Erro ao salvar histórico: {e}")

# ==================== Book Persistence (File System) ====================
BOOKS_DIR = os.path.join(DATA_DIR, "books")

if not os.path.exists(BOOKS_DIR):
    os.makedirs(BOOKS_DIR)

def save_book_file(book_data: Dict[str, Any]) -> str:
    """Salva dados do livro em arquivo JSON"""
    book_id = book_data.get("id")
    if not book_id:
        import uuid
        book_id = str(uuid.uuid4())
        book_data["id"] = book_id
    
    file_path = os.path.join(BOOKS_DIR, f"{book_id}.json")
    try:
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(book_data, f, ensure_ascii=False, indent=2)
        return book_id
    except Exception as e:
        logger.error(f"Erro ao salvar livro {book_id}: {e}")
        raise e

def load_book_file(book_id: str) -> Optional[Dict[str, Any]]:
    """Carrega dados do livro do arquivo JSON"""
    file_path = os.path.join(BOOKS_DIR, f"{book_id}.json")
    if not os.path.exists(file_path):
        return None
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Erro ao carregar livro {book_id}: {e}")
        return None

def list_book_files() -> List[Dict[str, Any]]:
    """Lista todos os livros salvos (resumo)"""
    books = []
    if not os.path.exists(BOOKS_DIR):
        return []
        
    for filename in os.listdir(BOOKS_DIR):
        if filename.endswith(".json"):
            try:
                file_path = os.path.join(BOOKS_DIR, filename)
                with open(file_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    # Retornar apenas metadados essenciais para a lista
                    books.append({
                        "id": data.get("id"),
                        "title": data.get("title"),
                        "description": data.get("description"),
                        "created_at": data.get("created_at"),
                        "last_modified": data.get("last_modified"),
                        "last_saved": data.get("last_saved"),
                        "status": data.get("status"),
                        "total_chapters": data.get("total_chapters", 0)
                    })
            except Exception as e:
                logger.error(f"Erro ao ler arquivo {filename}: {e}")
                continue
    
    # Ordenar por data de modificação (mais recente primeiro)
    books.sort(key=lambda x: x.get("last_modified", ""), reverse=True)
    return books

def delete_book_file(book_id: str) -> bool:
    """Remove arquivo do livro"""
    file_path = os.path.join(BOOKS_DIR, f"{book_id}.json")
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
            return True
        except Exception as e:
            logger.error(f"Erro ao deletar livro {book_id}: {e}")
            return False
    return False

# ==================== Library Endpoints ====================

@app.get("/api/library/books")
async def list_library_books():
    """Lista todos os livros salvos na biblioteca"""
    try:
        books = list_book_files()
        return {
            "status": "success",
            "count": len(books),
            "books": books
        }
    except Exception as e:
        logger.error(f"Erro ao listar livros: {e}")
        return {"status": "error", "error": str(e)}

@app.post("/api/library/books")
async def save_book_to_library(book_data: Dict[str, Any]):
    """Salva um livro na biblioteca"""
    try:
        book_id = save_book_file(book_data)
        return {
            "status": "success",
            "book_id": book_id,
            "message": "Livro salvo com sucesso"
        }
    except Exception as e:
        logger.error(f"Erro ao salvar livro: {e}")
        return {"status": "error", "error": str(e)}

@app.get("/api/library/books/{book_id}")
async def get_library_book(book_id: str):
    """Carrega um livro completo da biblioteca"""
    try:
        book = load_book_file(book_id)
        if not book:
            raise HTTPException(status_code=404, detail="Livro não encontrado")
        
        return {
            "status": "success",
            "book": book
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erro ao carregar livro: {e}")
        return {"status": "error", "error": str(e)}

@app.delete("/api/library/books/{book_id}")
async def delete_library_book(book_id: str):
    """Remove um livro da biblioteca"""
    try:
        success = delete_book_file(book_id)
        if not success:
            raise HTTPException(status_code=404, detail="Livro não encontrado ou erro ao deletar")
            
        return {
            "status": "success",
            "message": "Livro removido com sucesso"
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Erro ao deletar livro: {e}")
        return {"status": "error", "error": str(e)}

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


class TopicRequest(BaseModel):
    """Request para geração de tópico"""
    chapter_number: int
    chapter_title: str
    book_topic: str
    topic_title: str
    writing_tone: str = "didatico"
    previous_content: str = ""

class FullBookRequest(BaseModel):
    """Request para geração completa"""
    outline: Dict[str, Any]
    book_id: Optional[str] = None
    skip_research: bool = False
    writing_tone: str = "didatico"


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


@app.post("/api/book/generate-chapter")
async def generate_chapter(request: ChapterConfig):
    """Gera um capítulo específico baseado no outline"""
    try:
        result = await orchestrator.generate_chapter(
            book_id=f"book_{request.chapter_number}",  # TODO: ID real do livro
            chapter_number=request.chapter_number,
            chapter_title=request.chapter_title,
            topic=request.topic,
            target_audience=request.context or "estudantes de graduação"
        )
        
        return {
            "status": "success",
            "chapter": result
        }
    except Exception as e:
        logger.error(f"Erro ao gerar capítulo: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/prompt/optimize")
async def optimize_prompt(request: PromptRequest):
    """
    Otimiza o prompt do usuário usando LLM
    """
    return await orchestrator.optimize_prompt(request.user_prompt)


@app.post("/api/book/generate-outline")
async def generate_outline(request: OutlineRequest):
    """
    Gera o escopo completo do livro (outline)
    """
    return await orchestrator.generate_book_outline(
        prompt=request.prompt,
        target_audience=request.target_audience
    )


@app.post("/api/book/generate-full")
async def generate_full_book(request: FullBookRequest, background_tasks: BackgroundTasks):
    """
    Inicia a geração completa do livro em background
    """
    import uuid
    
    book_id = request.book_id or str(uuid.uuid4())
    
    # Executar em background para não bloquear
    background_tasks.add_task(
        orchestrator.generate_full_book,
        outline=request.outline,
        book_id=book_id,
        skip_research=request.skip_research,
        writing_tone=request.writing_tone
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
    return orchestrator.get_book_status(book_id)


@app.get("/api/book/{book_id}")
async def get_book(book_id: str):
    """
    Retorna livro completo gerado
    """
    return orchestrator.get_book(book_id)


@app.post("/api/chapter/generate-topic")
async def generate_topic(request: TopicRequest):
    """
    Gera conteúdo para um tópico específico do capítulo
    """
    try:
        logger.info(f"Gerando tópico: {request.topic_title} (Capítulo {request.chapter_number})")
        
        # Obter instruções de tom de escrita
        from config.reliable_sources import get_writing_tone_instructions
        tone_instructions = get_writing_tone_instructions(request.writing_tone)
        
        # Construir prompt para o tópico
        prompt = f"""
Você está escrevendo o {request.topic_title} do Capítulo {request.chapter_number}: "{request.chapter_title}" 
do livro sobre "{request.book_topic}".

TOM DE ESCRITA: {request.writing_tone}
{tone_instructions}

CONTEÚDO ANTERIOR DO CAPÍTULO:
{request.previous_content if request.previous_content else "Este é o primeiro tópico do capítulo."}

REGRAS:
1. Gere aproximadamente 300-500 palavras para este tópico
2. Mantenha coerência com o conteúdo anterior
3. Use o tom de escrita especificado consistentemente
4. Seja informativo e prático
5. Não use marcadores como ## ou ### - escreva o conteúdo diretamente
6. Inclua exemplos quando apropriado

Tópico a gerar: {request.topic_title}
"""

        # Gerar conteúdo
        result = await llm_client.generate(
            prompt=prompt,
            task_type=TaskType.GENERATION,
            max_tokens=1000,
            temperature=0.7
        )
        
        content = result.get("content", "")
        word_count = len(content.split())
        
        logger.info(f"Tópico gerado com sucesso: {word_count} palavras")
        
        return {
            "status": "success",
            "content": content,
            "word_count": word_count,
            "topic_title": request.topic_title
        }
        
    except Exception as e:
        logger.error(f"Erro ao gerar tópico: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Erro ao gerar tópico: {str(e)}")


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
        logger.error(f"Erro na pesquisa: {e}")
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
        logger.error(f"Erro ao buscar modelos: {e}")
        return {
            "status": "error",
            "error": str(e),
            "models": []
        }

# ==================== Outline History Endpoints ====================

@app.post("/api/outline/history")
async def save_outline_history(outline_data: Dict[str, Any]):
    """Salva um outline no histórico"""
    try:
        outline_id = f"outline_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        history_item = {
            "id": outline_id,
            "title": outline_data.get("title", "Sem título"),
            "description": outline_data.get("description", ""),
            "total_chapters": outline_data.get("total_chapters", 0),
            "created_at": outline_data.get("created_at", datetime.utcnow().isoformat()),
            "optimized_prompt": outline_data.get("optimized_prompt", ""),
            "chapters": outline_data.get("chapters", [])
        }
        
        # Carregar, adicionar e salvar
        histories = load_history()
        histories.append(history_item)
        save_history(histories)
        
        return {
            "status": "success",
            "outline_id": outline_id,
            "message": "Outline salvo com sucesso"
        }
    except Exception as e:
        logger.error(f"Erro ao salvar outline: {e}")
        return {
            "status": "error",
            "error": str(e)
        }

@app.get("/api/outline/history")
async def get_outline_history():
    """Retorna todos os outlines salvos no histórico"""
    try:
        histories = load_history()
        return {
            "status": "success",
            "histories": histories
        }
    except Exception as e:
        logger.error(f"Erro ao buscar outlines: {e}")
        return {
            "status": "error",
            "error": str(e),
            "histories": []
        }

@app.delete("/api/outline/history/{outline_id}")
async def delete_outline_history(outline_id: str):
    """Exclui um outline do histórico"""
    try:
        histories = load_history()
        new_histories = [h for h in histories if h["id"] != outline_id]
        save_history(new_histories)
        
        return {"status": "success", "message": "Outline excluído com sucesso"}
    except Exception as e:
        logger.error(f"Erro ao excluir outline: {e}")
        return {"status": "error", "error": str(e)}

@app.get("/api/books/active")
async def get_active_books():
    """Lista todos os livros em geração ativa"""
    try:
        active_books = orchestrator.active_books
        return {
            "status": "success",
            "active_books": active_books,
            "total_active": len(active_books)
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/api/logs")
async def get_logs():
    """Retorna logs da aplicação"""
    try:
        import logging
        import sys
        from io import StringIO
        
        # Capturar logs recentes
        log_stream = StringIO()
        handler = logging.StreamHandler(log_stream)
        handler.setLevel(logging.INFO)
        
        # Adicionar handler temporário ao logger root
        root_logger = logging.getLogger()
        root_logger.addHandler(handler)
        
        # Obter logs existentes
        logs = []
        for handler in root_logger.handlers:
            if hasattr(handler, 'stream') and handler.stream != sys.stderr:
                try:
                    handler.stream.seek(0)
                    content = handler.stream.read()
                    if content:
                        logs.append(content)
                except:
                    pass
        
        # Remover handler temporário
        root_logger.removeHandler(handler)
        
        return {
            "status": "success",
            "logs": "\n".join(logs)[-5000:],  # Últimos 5000 caracteres
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "logs": "No logs available"
        }

@app.get("/api/book/{book_id}/status")
async def get_book_generation_status(book_id: str):
    """Verifica status da geração do livro"""
    try:

        status = orchestrator.get_book_status(book_id)
        
        if status.get("status") == "not_found":
            # Se não encontrado no orchestrator, pode ser um mock antigo ou erro
            return {
                "status": "error",
                "error": "Livro não encontrado ou geração não iniciada",
                "book_id": book_id
            }
            
        progress = status.get("progress", {})
        current_chapter = progress.get("current_chapter", 0)
        total_chapters = progress.get("total_chapters", 0)
        
        # Calcular porcentagem
        percent = 0
        if total_chapters > 0:
            percent = int((current_chapter / total_chapters) * 100)
            
        return {
            "status": status.get("status", "unknown"),
            "book_id": book_id,
            "progress": percent,
            "current_chapter": current_chapter,
            "total_chapters": total_chapters,
            "message": f"Gerando capítulo {current_chapter} de {total_chapters}..." if status.get("status") == "generating" else "Geração concluída",
            "logs": []
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }

@app.post("/api/research/validate-source")
async def validate_research_source(request: Dict[str, Any]):
    """Valida uma URL como fonte de pesquisa"""
    try:
        url = request.get("url")
        if not url:
            return {"status": "error", "error": "URL não fornecida"}
        
        # Validar formato da URL
        from urllib.parse import urlparse
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return {"status": "error", "error": "URL inválida"}
        
        # TODO: Implementar validação real da página
        return {
            "status": "success",
            "title": parsed.netloc,
            "credibility": 0.7,
            "type": "web",
            "url": url
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.post("/api/research/topic")
async def research_topic(request: Dict[str, Any]):
    """Pesquisa um tópico específico"""
    try:
        topic = request.get("topic")
        chapter_number = request.get("chapter_number")
        book_id = request.get("book_id")
        
        if not topic:
            return {"status": "error", "error": "Tópico não fornecido"}
        
        # TODO: Implementar pesquisa real com o agente
        return {
            "status": "success",
            "topic": topic,
            "summary": f"Pesquisa sobre {topic} realizada com sucesso. Conteúdo detalhado disponível para geração do capítulo.",
            "sources": [
                {
                    "url": "https://example.com/source1",
                    "title": "Fonte Acadêmica 1",
                    "type": "academic",
                    "credibility": 0.9
                },
                {
                    "url": "https://example.com/source2", 
                    "title": "Font Web 2",
                    "type": "web",
                    "credibility": 0.7
                }
            ],
            "verified": True
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/api/book/{book_id}/chapter/{chapter_number}/research-sources")
async def get_chapter_research_sources(book_id: str, chapter_number: int):
    """Retorna fontes de pesquisa de um capítulo"""
    try:
        # TODO: Implementar busca real das fontes
        return {
            "status": "success",
            "book_id": book_id,
            "chapter_number": chapter_number,
            "sources": [
                {
                    "url": "https://arxiv.org/example",
                    "title": "Paper Acadêmico sobre o tema",
                    "type": "academic",
                    "credibility": 0.9,
                    "last_accessed": datetime.utcnow().isoformat()
                }
            ]
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}

@app.get("/api/outline/export/{outline_id}")
async def export_outline(outline_id: str):
    """Exporta um outline como JSON"""
    try:
        histories = load_history()
        outline = next((h for h in histories if h["id"] == outline_id), None)
        
        if not outline:
            return {"status": "error", "error": "Outline não encontrado"}
        
        export_data = {
            "id": outline_id,
            "exported_at": datetime.utcnow().isoformat(),
            "outline": outline
        }
        
        return JSONResponse(
            content=export_data,
            media_type="application/json",
            headers={
                "Content-Disposition": f"attachment; filename=outline_{outline_id}.json"
            }
        )
    except Exception as e:
        return {"status": "error", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=settings.env == "development"
    )
