#!/usr/bin/env python3
"""
Teste do endpoint generate-outline
"""
import asyncio
import sys
import os
import json

# Adicionar backend ao path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

async def test_outline_endpoint():
    try:
        print("🔍 Testando endpoint generate-outline...")
        
        # Importar diretamente a função
        from agents.orchestrator import orchestrator
        
        print("✅ Orchestrator importado!")
        
        # Testar geração de outline
        result = await orchestrator.generate_book_outline(
            prompt="Crie um ebook sobre inteligência artificial",
            target_audience="estudantes"
        )
        
        print(f"📊 Tipo do resultado: {type(result)}")
        print(f"📋 Chaves: {list(result.keys()) if isinstance(result, dict) else 'Não é dict'}")
        
        if isinstance(result, dict):
            print(f"📝 Status: {result.get('status', 'N/A')}")
            if 'outline' in result:
                outline = result['outline']
                print(f"📚 Título: {outline.get('book_title', 'N/A')}")
                print(f"📖 Capítulos: {len(outline.get('chapters', []))}")
        
        print("✅ Teste concluído com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_outline_endpoint())
