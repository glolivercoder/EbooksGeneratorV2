import asyncio
import os
import sys

# Adicionar diretório atual ao path para importar módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.llm_client import llm_client, TaskType

async def test_generation():
    print("Iniciando teste de geração...")
    
    try:
        # Teste simples
        prompt = "Escreva uma frase curta sobre programação."
        print(f"Prompt: {prompt}")
        
        # Forçar Gemini
        print("Testando Gemini direto...")
        result = await llm_client.generate(
            prompt=prompt,
            task_type=TaskType.GENERATION,
            model="google/gemini-pro-1.5",
            max_tokens=100
        )
        
        print("\nSucesso!")
        print(f"Conteúdo: {result.get('content')}")
        print(f"Provider: {result.get('provider')}")
        print(f"Model: {result.get('model')}")
        
    except Exception as e:
        print(f"\nErro no teste: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_generation())
