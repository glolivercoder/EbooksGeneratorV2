#!/usr/bin/env python3
"""
Teste do agente de pesquisa
"""
import asyncio
import sys
import os

# Adicionar backend ao path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

async def test_research_agent():
    try:
        print("🔍 Testando agente de pesquisa...")
        
        # Importar agente
        from agents.deep_research import research_agent
        
        print("✅ Agente importado com sucesso!")
        print(f"📋 Fontes configuradas: {research_agent.sources_priority}")
        
        # Testar pesquisa simples
        print("\n🔬 Executando pesquisa de teste...")
        results = await research_agent.research(
            query="Notebook LM Google",
            academic_only=True,
            max_results=3
        )
        
        print(f"📊 Resultados: {type(results)}")
        if isinstance(results, dict):
            print(f"📄 Chaves: {list(results.keys())}")
            if 'synthesis' in results:
                print(f"📝 Síntese: {results['synthesis'][:100]}...")
            if 'sources_count' in results:
                print(f"🔢 Fontes encontradas: {results['sources_count']}")
        else:
            print(f"❌ Resultado inesperado: {results}")
            
    except Exception as e:
        print(f"❌ Erro ao testar agente: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_research_agent())
