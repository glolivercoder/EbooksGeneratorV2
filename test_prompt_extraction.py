#!/usr/bin/env python3
"""
Teste de extração de especificações do prompt
"""
import re

def test_prompt_extraction():
    test_prompts = [
        "1 capítulo 1 página",
        "1 capitulo 1 pagina", 
        "1 capítulo com 1 página",
        "crie 1 capítulo e 1 página",
        "um capítulo uma página",
        "3 capítulos 2 páginas cada",
        "2 capítulos com 5 páginas cada"
    ]
    
    for prompt in test_prompts:
        print(f"\n📝 Prompt: '{prompt}'")
        
        # Extrair número de capítulos
        chapters_match = re.search(r'(\d+)\s*cap[íi]tulos?', prompt.lower())
        user_chapters = int(chapters_match.group(1)) if chapters_match else None
        print(f"   - Capítulos detectados: {user_chapters}")
        
        # Extrair número de páginas
        pages_match = re.search(r'(\d+)\s*p[áa]ginas?', prompt.lower())
        user_pages = int(pages_match.group(1)) if pages_match else None
        print(f"   - Páginas detectadas: {user_pages}")
        
        # Extrair páginas por capítulo
        pages_per_chapter_match = re.search(r'(\d+)\s*p[áa]ginas?\s*(?:por\s*cap[íi]tulo|cada)', prompt.lower())
        pages_per_chapter = int(pages_per_chapter_match.group(1)) if pages_per_chapter_match else None
        print(f"   - Páginas por capítulo: {pages_per_chapter}")

if __name__ == "__main__":
    test_prompt_extraction()
