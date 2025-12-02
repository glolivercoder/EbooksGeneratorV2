import json
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter(prefix="/api/backup", tags=["backup"])

# Simulação de armazenamento (em projeto real, usar DB)
DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DATA_DIR.mkdir(exist_ok=True)

PROMPTS_FILE = DATA_DIR / "prompts.json"
OUTLINES_FILE = DATA_DIR / "outlines.json"
BOOKS_FILE = DATA_DIR / "books.json"
AGENT_CONFIG_FILE = DATA_DIR / "agent_config.json"

def load_json(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text("utf-8"))
    return {}

def save_json(path: Path, data: dict):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), "utf-8")

def collect_backup_data() -> dict:
    prompts = load_json(PROMPTS_FILE)
    outlines = load_json(OUTLINES_FILE)
    books = load_json(BOOKS_FILE)
    agent_config = load_json(AGENT_CONFIG_FILE)

    return {
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "version": "1.0",
        "prompts": prompts,
        "outlines": outlines,
        "books": books,
        "agent_config": agent_config,
    }

def restore_backup_data(data: dict):
    prompts = data.get("prompts", {})
    outlines = data.get("outlines", {})
    books = data.get("books", {})
    agent_config = data.get("agent_config", {})

    save_json(PROMPTS_FILE, prompts)
    save_json(OUTLINES_FILE, outlines)
    save_json(BOOKS_FILE, books)
    save_json(AGENT_CONFIG_FILE, agent_config)

@router.get("/export")
def export_backup():
    try:
        backup_data = collect_backup_data()
        filename = f"ebook-generator-backup-{datetime.now().strftime('%Y-%m-%d')}.json"
        temp_path = DATA_DIR / filename
        save_json(temp_path, backup_data)
        return FileResponse(temp_path, filename=filename, media_type="application/json")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao exportar backup: {e}")

class ImportPayload(BaseModel):
    prompts: dict = {}
    outlines: dict = {}
    books: dict = {}
    agent_config: dict = {}

@router.post("/import")
def import_backup(payload: ImportPayload):
    try:
        restore_backup_data(payload.dict())
        return {"status": "ok", "message": "Backup importado com sucesso."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao importar backup: {e}")
