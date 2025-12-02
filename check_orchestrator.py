#!/usr/bin/env python3
"""
Verificação do orchestrator e agentes
"""
import asyncio
import sys
import os

# Adicionar backend ao path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

async def check_orchestrator():
    try:
        print("🎯 Verificando orchestrator...")
        
        # Importar orchestrator
        from agents.orchestrator import orchestrator
        
        print("✅ Orchestrator importado com sucesso!")
        print(f"📚 Livros ativos: {len(orchestrator.active_books)}")
        
        # Verificar agentes
        print(f"🤖 RAG Systems: {len(orchestrator.rag_systems)}")
        
        # Verificar se o agente de pesquisa está acessível
        from agents.deep_research import research_agent
        print("✅ Agente de pesquisa acessível!")
        
        # Listar livros ativos
        if orchestrator.active_books:
            print("\n📖 Livros em geração:")
            for book_id, status in orchestrator.active_books.items():
                print(f"  - {book_id}: {status}")
        else:
            print("\n📭 Nenhum livro em geração no momento")
            
        print("\n🔄 Workflow nodes disponíveis:")
        print(f"  - Nós: {list(orchestrator.graph.nodes)}")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(check_orchestrator())
