"""
Prompts melhorados para geração de ebooks técnicos
"""

ENHANCED_EBOOK_PROMPT = """
Você é um especialista PhD em {topic}, escrevendo um ebook técnico de qualidade editorial para {target_audience}.

=== CONTEXTO DO LIVRO (CAPÍTULOS ANTERIORES) ===
{previous_chapters_summary}

=== INSIGHTS DO MENTAL GRAPH ===
Conceitos já abordados: {covered_concepts}
Pré-requisitos estabelecidos: {prerequisites}
Tendência narrativa: {narrative_flow}
Lacunas a preencher: {knowledge_gaps}

=== CONTEXTO RECUPERADO (RAG) ===
{rag_context}

=== PESQUISA CIENTÍFICA RECENTE (VERIFICADA) ===
{research_results}
[Todas as fontes são rastreáveis e verificadas. Use-as com confiança.]

DIRETRIZES DE ESCRITA:
1. Tom: Técnico-formal com humanização. Use voz ativa quando possível.
2. Estrutura: Pirâmide invertida - conceito principal primeiro, detalhes depois.
3. Profundidade: Nível {depth_level} (1=introdutório, 5=avançado/pesquisa)
4. Exemplos: Mínimo {min_examples} exemplos práticos por seção.
5. Citações: Use formato {citation_style}. SEMPRE cite fontes de {research_results}.
6. Comprimento: Aproximadamente {target_words} palavras.
7. **Coerência**: Conecte com capítulos anteriores quando relevante.
8. **Factualidade**: Use APENAS informações de {rag_context} e {research_results}. NÃO invente dados.

CAPÍTULO {chapter_number}: {chapter_title}

Estruture em:
## 1. Introdução e Contexto
- Motivação e relevância
- **Conexão com capítulo anterior**: {previous_chapter_title}
- Objetivos de aprendizagem
- Pré-requisitos

## 2. Fundamentação Teórica
- Conceitos-chave com definições precisas [com citações]
- Equações/algoritmos quando aplicável
- Diagramas conceituais (descreva para geração posterior)

## 3. Estado da Arte
- Últimos avanços (2023-2024) [use {research_results}]
- Comparação de abordagens
- Tendências e direções futuras

## 4. Aplicações Práticas
- Casos de uso reais
- Exemplos de código/implementação
- Exercícios propostos

## 5. Análise Crítica
- Limitações e desafios
- Trade-offs
- Considerações éticas/sociais (se aplicável)

## 6. Resumo e Próximos Passos
- Síntese dos pontos-chave
- **Preparação para próximo capítulo**: {next_chapter_title}
- Leituras recomendadas [da pesquisa]

GRÁFICOS NECESSÁRIOS: {requested_charts}

Gere o conteúdo agora, garantindo:
✓ Todas afirmações têm fonte rastreável
✓ Não contradiz capítulos anteriores
✓ Fluxo narrativo coerente com {narrative_flow}
✓ Conceitos de {covered_concepts} são referenciados quando relevante
"""


def build_chapter_prompt(
    topic: str,
    target_audience: str,
    chapter_number: int,
    chapter_title: str,
    rag_context: str = "",
    research_results: str = "",
    previous_chapters_summary: str = "",
    covered_concepts: list = None,
    prerequisites: list = None,
    narrative_flow: str = "linear",
    knowledge_gaps: list = None,
    previous_chapter_title: str = "",
    next_chapter_title: str = "",
    depth_level: int = 3,
    min_examples: int = 2,
    target_words: int = 3000,
    citation_style: str = "ABNT",
    requested_charts: list = None,
    writing_tone_instructions: str = ""
) -> str:
    """Constrói prompt completo para geração de capítulo"""
    
    # Incluir instruções de tom de escrita se fornecidas
    enhanced_prompt = ENHANCED_EBOOK_PROMPT
    if writing_tone_instructions:
        enhanced_prompt = writing_tone_instructions + "\n\n" + ENHANCED_EBOOK_PROMPT
    
    return enhanced_prompt.format(
        topic=topic,
        target_audience=target_audience,
        previous_chapters_summary=previous_chapters_summary,
        covered_concepts=", ".join(covered_concepts or []),
        prerequisites=", ".join(prerequisites or []),
        narrative_flow=narrative_flow,
        knowledge_gaps=", ".join(knowledge_gaps or []),
        rag_context=rag_context,
        research_results=research_results,
        chapter_number=chapter_number,
        chapter_title=chapter_title,
        previous_chapter_title=previous_chapter_title,
        next_chapter_title=next_chapter_title,
        depth_level=depth_level,
        min_examples=min_examples,
        target_words=target_words,
        citation_style=citation_style,
        requested_charts=", ".join(requested_charts or ["Nenhum"])
    )
