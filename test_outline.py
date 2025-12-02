#!/usr/bin/env python3
"""
Script para adicionar outline de teste ao histórico
"""
import requests
import json
from datetime import datetime

# Outline de exemplo para Notebook LM
outline_data = {
    "title": "Aprendendo usando a Tecnologia do Notebook LM",
    "description": "Crie um ebook conciso com 3 capítulos sobre Notebook LM",
    "total_chapters": 3,
    "optimized_prompt": "Aprendendo usando a Tecnologia do Notebook LM - Crie um ebook conciso com 3 capítulos, cada um com aproximadamente 2 páginas. Foque em introdução prática, recursos principais e exemplos de uso do Notebook LM.",
    "chapters": [
        {
            "number": 1,
            "title": "Introdução ao Notebook LM",
            "description": "Visão geral da tecnologia Notebook LM e seus conceitos fundamentais",
            "key_topics": ["Setup inicial", "Instalação", "Conceitos básicos"],
            "estimated_pages": 2
        },
        {
            "number": 2,
            "title": "Recursos Principais",
            "description": "Funcionalidades essenciais e capacidades do Notebook LM",
            "key_topics": ["Ferramentas principais", "API", "Integração"],
            "estimated_pages": 2
        },
        {
            "number": 3,
            "title": "Exemplos Práticos",
            "description": "Casos de uso reais e implementações práticas",
            "key_topics": ["Exemplos práticos", "Casos de uso", "Melhores práticas"],
            "estimated_pages": 2
        }
    ],
    "created_at": datetime.utcnow().isoformat()
}

try:
    # Adicionar ao histórico
    response = requests.post(
        "http://localhost:8000/api/outline/history",
        json=outline_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        result = response.json()
        print(f"✅ Outline adicionado com sucesso! ID: {result.get('id', 'N/A')}")
        print(f"📚 Título: {outline_data['title']}")
        print(f"📖 Capítulos: {outline_data['total_chapters']}")
    else:
        print(f"❌ Erro ao adicionar outline: {response.status_code}")
        print(f"Resposta: {response.text}")
        
    # Verificar histórico
    print("\n📋 Verificando histórico...")
    history_response = requests.get("http://localhost:8000/api/outline/history")
    
    if history_response.status_code == 200:
        history = history_response.json()
        print(f"📊 Total de outlines no histórico: {len(history.get('histories', []))}")
        
        for item in history.get('histories', []):
            print(f"  - {item['title']} ({item['total_chapters']} capítulos)")
    
except Exception as e:
    print(f"❌ Erro: {e}")
