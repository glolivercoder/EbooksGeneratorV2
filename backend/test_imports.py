"""
Script de teste rápido do backend
Testa se o servidor consegue iniciar
"""
import sys
import os

# Adicionar diretório backend ao path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

print("=" * 50)
print("Testando imports do backend...")
print("=" * 50)

try:
    from config.settings import settings
    print("✓ config.settings importado com sucesso")
    print(f"  - Backend Port: {settings.backend_port}")
    print(f"  - Environment: {settings.env}")
except Exception as e:
    print(f"✗ Erro ao importar config.settings: {e}")
    sys.exit(1)

try:
    from services.env_manager import env_manager
    print("✓ services.env_manager importado com sucesso")
except Exception as e:
    print(f"✗ Erro ao importar services.env_manager: {e}")
    sys.exit(1)

try:
    from rag.graph_rag import GraphRAG
    print("✓ rag.graph_rag importado com sucesso")
except Exception as e:
    print(f"✗ Erro ao importar rag.graph_rag: {e}")
    sys.exit(1)

try:
    from main import app
    print("✓ main.app importado com sucesso")
    print(f"  - App title: {app.title}")
except Exception as e:
    print(f"✗ Erro ao importar main.app: {e}")
    sys.exit(1)

print("\n" + "=" * 50)
print("✓ Todos os imports OK!")
print("=" * 50)
print("\nPode iniciar o servidor com:")
print("  python -m uvicorn main:app --reload")
