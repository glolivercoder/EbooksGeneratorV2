"""
Fontes Confiáveis por Tema
Configuração de fontes verificadas para evitar alucinações e referências falsas
"""

RELIABLE_SOURCES = {
    "financas": {
        "name": "Finanças",
        "sources": [
            {
                "name": "InfoMoney",
                "url": "https://www.infomoney.com.br/",
                "description": "Portal financeiro com notícias e análises do Brasil",
                "type": "news",
                "reliability": "high",
                "language": "pt-BR"
            },
            {
                "name": "Valor Econômico",
                "url": "https://valor.globo.com/",
                "description": "Notícias econômicas e negócios no Brasil",
                "type": "news",
                "reliability": "high",
                "language": "pt-BR"
            },
            {
                "name": "Bloomberg",
                "url": "https://www.bloomberg.com/",
                "description": "Notícias e análises econômicas globais",
                "type": "news",
                "reliability": "high",
                "language": "en"
            },
            {
                "name": "CVM",
                "url": "https://www.gov.br/cvm/pt-br",
                "description": "Comissão de Valores Mobiliários - reguladora brasileira",
                "type": "official",
                "reliability": "very_high",
                "language": "pt-BR"
            },
            {
                "name": "Banco Central",
                "url": "https://www.bcb.gov.br/",
                "description": "Banco Central do Brasil - dados e regulamentações",
                "type": "official",
                "reliability": "very_high",
                "language": "pt-BR"
            }
        ]
    },
    
    "economia": {
        "name": "Economia",
        "sources": [
            {
                "name": "Valor Econômico",
                "url": "https://valor.globo.com/",
                "description": "Notícias econômicas e negócios no Brasil",
                "type": "news",
                "reliability": "high",
                "language": "pt-BR"
            },
            {
                "name": "Bloomberg",
                "url": "https://www.bloomberg.com/",
                "description": "Notícias e análises econômicas globais",
                "type": "news",
                "reliability": "high",
                "language": "en"
            },
            {
                "name": "IBGE",
                "url": "https://www.ibge.gov.br/",
                "description": "Instituto Brasileiro de Geografia e Estatística - dados oficiais",
                "type": "official",
                "reliability": "very_high",
                "language": "pt-BR"
            },
            {
                "name": "IPEA",
                "url": "https://www.ipea.gov.br/",
                "description": "Instituto de Pesquisa Econômica Aplicada",
                "type": "research",
                "reliability": "high",
                "language": "pt-BR"
            }
        ]
    },
    
    "tecnologia": {
        "name": "Tecnologia",
        "sources": [
            {
                "name": "The Verge",
                "url": "https://www.theverge.com/",
                "description": "Notícias e análises de tecnologia e gadgets",
                "type": "news",
                "reliability": "high",
                "language": "en"
            },
            {
                "name": "TechCrunch",
                "url": "https://techcrunch.com/",
                "description": "Notícias sobre startups e tecnologia",
                "type": "news",
                "reliability": "high",
                "language": "en"
            },
            {
                "name": "MIT Technology Review",
                "url": "https://www.technologyreview.com/",
                "description": "Análises tecnológicas do MIT",
                "type": "academic",
                "reliability": "very_high",
                "language": "en"
            },
            {
                "name": "IEEE Spectrum",
                "url": "https://spectrum.ieee.org/",
                "description": "Revista técnica da IEEE",
                "type": "academic",
                "reliability": "very_high",
                "language": "en"
            }
        ]
    },
    
    "saude": {
        "name": "Saúde",
        "sources": [
            {
                "name": "MedlinePlus",
                "url": "https://www.medlineplus.gov/dietandnutrition.html",
                "description": "Informações médicas confiáveis sobre saúde e nutrição",
                "type": "medical",
                "reliability": "very_high",
                "language": "en"
            },
            {
                "name": "CDC",
                "url": "https://www.cdc.gov/",
                "description": "Centro de Controle e Prevenção de Doenças (EUA)",
                "type": "official",
                "reliability": "very_high",
                "language": "en"
            },
            {
                "name": "Ministério da Saúde Brasil",
                "url": "https://www.gov.br/saude/pt-br",
                "description": "Ministério da Saúde do Brasil",
                "type": "official",
                "reliability": "very_high",
                "language": "pt-BR"
            },
            {
                "name": "WHO",
                "url": "https://www.who.int/",
                "description": "Organização Mundial da Saúde",
                "type": "official",
                "reliability": "very_high",
                "language": "en"
            }
        ]
    },
    
    "nutricao": {
        "name": "Nutrição",
        "sources": [
            {
                "name": "Bodybuilding.com",
                "url": "https://www.bodybuilding.com/",
                "description": "Artigos, planos e suplementos para performance atlética",
                "type": "sports",
                "reliability": "medium",
                "language": "en"
            },
            {
                "name": "MedlinePlus Nutrition",
                "url": "https://www.medlineplus.gov/nutrition.html",
                "description": "Informações nutricionais da National Library of Medicine",
                "type": "medical",
                "reliability": "very_high",
                "language": "en"
            },
            {
                "name": "Harvard Nutrition Source",
                "url": "https://www.hsph.harvard.edu/nutritionsource/",
                "description": "Fonte de nutrição da Harvard School of Public Health",
                "type": "academic",
                "reliability": "very_high",
                "language": "en"
            }
        ]
    },
    
    "noticias": {
        "name": "Notícias",
        "sources": [
            {
                "name": "BBC News",
                "url": "https://www.bbc.com/news",
                "description": "Cobertura global de notícias confiáveis",
                "type": "news",
                "reliability": "high",
                "language": "en"
            },
            {
                "name": "G1",
                "url": "https://g1.globo.com/",
                "description": "Portal mais acessado de notícias do Brasil",
                "type": "news",
                "reliability": "medium",
                "language": "pt-BR"
            },
            {
                "name": "Reuters",
                "url": "https://www.reuters.com/",
                "description": "Agência de notícias global",
                "type": "news",
                "reliability": "high",
                "language": "en"
            },
            {
                "name": "Associated Press",
                "url": "https://apnews.com/",
                "description": "Agência de notícias dos EUA",
                "type": "news",
                "reliability": "high",
                "language": "en"
            }
        ]
    },
    
    "sexualidade": {
        "name": "Sexualidade",
        "sources": [
            {
                "name": "Planned Parenthood",
                "url": "https://www.plannedparenthood.org/",
                "description": "Informações, educação e saúde sexual",
                "type": "health",
                "reliability": "high",
                "language": "en"
            },
            {
                "name": "CDC Sexual Health",
                "url": "https://www.cdc.gov/sexualhealth/index.html",
                "description": "CDC - Centro de Controle e Prevenção de Doenças, saúde sexual",
                "type": "official",
                "reliability": "very_high",
                "language": "en"
            },
            {
                "name": "WHO Sexual Health",
                "url": "https://www.who.int/health-topics/sexual-health",
                "description": "Diretrizes da OMS sobre saúde sexual",
                "type": "official",
                "reliability": "very_high",
                "language": "en"
            }
        ]
    },
    
    "academico": {
        "name": "Pesquisa Acadêmica",
        "sources": [
            {
                "name": "Google Scholar",
                "url": "https://scholar.google.com/",
                "description": "Pesquisa acadêmica multidisciplinar",
                "type": "academic",
                "reliability": "very_high",
                "language": "multilingual"
            },
            {
                "name": "Nature",
                "url": "https://www.nature.com/",
                "description": "Publicações científicas top, multidisciplinares",
                "type": "academic",
                "reliability": "very_high",
                "language": "en"
            },
            {
                "name": "Science",
                "url": "https://www.science.org/",
                "description": "Revista científica da AAAS",
                "type": "academic",
                "reliability": "very_high",
                "language": "en"
            },
            {
                "name": "SciELO",
                "url": "https://www.scielo.org/",
                "description": "Biblioteca científica online América Latina",
                "type": "academic",
                "reliability": "very_high",
                "language": "multilingual"
            }
        ]
    }
}

# Mapeamento de temas para palavras-chave
THEME_KEYWORDS = {
    "financas": ["finanças", "dinheiro", "investimentos", "ações", "tesouro", "renda", "câmbio", "banco", "carteira"],
    "economia": ["economia", "pib", "inflação", "juros", "desemprego", "setor", "mercado", "comércio", "exportação"],
    "tecnologia": ["tecnologia", "software", "hardware", "ia", "inteligência artificial", "programação", "computador", "digital"],
    "saude": ["saúde", "medicina", "hospital", "doença", "tratamento", "médico", "remédio", "farmácia"],
    "nutricao": ["nutrição", "dieta", "alimentação", "vitaminas", "suplementos", "emagrecer", "peso", "academia"],
    "noticias": ["notícia", "jornal", "reportagem", "matéria", "cobertura", "fato", "acontecimento"],
    "sexualidade": ["sexo", "sexualidade", "relação", "íntimo", "prazer", "contracepção", "dst", "prevenção"],
    "academico": ["pesquisa", "estudo", "científico", "acadêmico", "tese", "artigo", "análise", "método"]
}

# Tons de escrita disponíveis
WRITING_TONES = {
    "didatico": {
        "name": "Didático",
        "description": "Claro, estruturado, com explicações passo a passo",
        "characteristics": [
            "Linguagem acessível e educativa",
            "Explicações detalhadas",
            "Exemplos práticos",
            "Estrutura lógica progressiva",
            "Objetivo de ensinar"
        ]
    },
    "academico": {
        "name": "Acadêmico",
        "description": "Formal, rigoroso, com citações e referências",
        "characteristics": [
            "Linguagem formal e técnica",
            "Citações e referências",
            "Argumentação baseada em evidências",
            "Estrutura metodológica",
            "Objetividade científica"
        ]
    },
    "descontraido": {
        "name": "Descontraído",
        "description": "Informal, próximo, com linguagem casual",
        "characteristics": [
            "Linguagem informal e coloquial",
            "Tom conversacional",
            "Histórias pessoais",
            "Humor leve",
            "Conexão emocional"
        ]
    },
    "jornalistico": {
        "name": "Jornalístico",
        "description": "Informativo, objetivo, com os 5Ws + H",
        "characteristics": [
            "Linguagem clara e direta",
            "Fatos e dados",
            "Entrevistas e declarações",
            "Estrutura piramidal",
            "Objetividade informativa"
        ]
    }
}

def detect_theme_from_prompt(prompt: str) -> str:
    """
    Detecta o tema principal do prompt baseado em palavras-chave
    """
    prompt_lower = prompt.lower()
    
    # Contar palavras-chave por tema
    theme_scores = {}
    for theme, keywords in THEME_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in prompt_lower)
        if score > 0:
            theme_scores[theme] = score
    
    # Retornar tema com maior score ou padrão
    if theme_scores:
        return max(theme_scores, key=theme_scores.get)
    
    return "academico"  # Padrão para conteúdo acadêmico

def get_reliable_sources(theme: str) -> list:
    """
    Retorna fontes confiáveis para um tema específico
    """
    return RELIABLE_SOURCES.get(theme, RELIABLE_SOURCES["academico"])["sources"]

def get_writing_tone_instructions(tone: str) -> str:
    """
    Retorna instruções específicas para o tom de escrita
    """
    tone_config = WRITING_TONES.get(tone, WRITING_TONES["didatico"])
    
    instructions = f"""
Escreva no tom {tone_config['name'].lower()}: {tone_config['description']}

Características importantes:
{chr(10).join(f"- {char}" for char in tone_config['characteristics'])}

Mantenha este tom consistentemente em todo o conteúdo do livro.
"""
    
    return instructions
