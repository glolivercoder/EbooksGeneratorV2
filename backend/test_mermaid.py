"""
Teste rápido do Mermaid Agent
"""
import asyncio
import sys
sys.path.append('f:/Projetos2025BKP/EbooksGeneratorV2/backend')

from agents.mermaid_agent import mermaid_agent

async def test():
    try:
        print("Testando Mermaid Agent...")
        result = await mermaid_agent.generate_diagram(
            description="Processo simples A -> B -> C",
            diagram_type="auto"
        )
        print("✅ Sucesso!")
        print(f"Código: {result['mermaid_code'][:100]}...")
        print(f"Custo: ${result['cost']:.4f}")
        print(f"Modelo: {result['model']}")
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
