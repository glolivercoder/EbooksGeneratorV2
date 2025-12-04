"""
Design Agent - IA que atua como designer gráfico profissional

Especialista em:
- Tipografia moderna
- Teoria das cores
- Layout editorial
- Design de capas
"""

from typing import Dict, List, Any
import json
from config.settings import settings

DESIGNER_SYSTEM_PROMPT = """
Você é um designer gráfico sênior especializado em editoração de livros e revistas.

EXPERTISE:
- Tipografia: hierarquia, legibilidade, kerning
- Cores: teoria das cores, harmonia, acessibilidade
- Layout: grid systems, whitespace, flow
- Tendências: design moderno 2024/2025

ESTILOS QUE VOCÊ DOMINA:
- Minimalismo escandinavo
- Design editorial clássico
- Tech/futurista
- Corporativo elegante
- Artístico/criativo

FERRAMENTAS:
- HTML5 + CSS3 moderno (Flexbox, Grid)
- Google Fonts
- Gradientes CSS
- SVG para elementos gráficos

TAREFA:
Analise o conteúdo fornecido e forneça recomendações de design visual.
Retorne sempre JSON estruturado conforme o formato solicitado.
"""


class DesignAgent:
    """Design Agent usando LLM para análise e geração de designs"""
    
    def __init__(self):
        self.system_prompt = DESIGNER_SYSTEM_PROMPT
    
    async def analyze_content(self, content: str) -> Dict[str, Any]:
        """
        Analisa conteúdo do editor para determinar estilo
        
        Args:
            content: HTML content do editor
            
        Returns:
            {
                "topic": str,
                "tone": str,
                "target_audience": str,
                "suggested_style": str,
                "color_palette": List[str],
                "typography": Dict
            }
        """
        from services.llm_client import llm_client, TaskType
        
        prompt = f"""
Analise o seguinte conteúdo de ebook e sugira um design visual apropriado.

CONTEÚDO:
{content[:2000]}  # Limita a 2000 caracteres para não sobrecarregar

Retorne um JSON com:
{{
    "topic": "tema principal do conteúdo",
    "tone": "tom (professional, creative, casual, academic, etc.)",
    "target_audience": "público-alvo",
    "suggested_style": "estilo visual sugerido (modern-tech, classic-editorial, minimalist, etc.)",
    "color_palette": [
        {{"hex": "#667eea", "name": "Primary", "usage": "títulos e destaques"}},
        {{"hex": "#764ba2", "name": "Secondary", "usage": "subtítulos"}},
        {{"hex": "#f093fb", "name": "Accent", "usage": "elementos de destaque"}},
        {{"hex": "#ffffff", "name": "Background", "usage": "fundo"}},
        {{"hex": "#2d3748", "name": "Text", "usage": "texto principal"}}
    ],
    "typography": {{
        "heading": "nome da fonte para títulos (ex: Inter, Playfair Display)",
        "subheading": "nome da fonte para subtítulos",
        "body": "nome da fonte para corpo de texto",
        "reasoning": "justificativa das escolhas"
    }},
    "mood": "descrição do mood visual (ex: confiante e inovador, clássico e elegante)"
}}

Retorne APENAS o JSON, sem comentários adicionais.
"""
        
        try:
            # Concatenar system prompt pois llm_client não suporta arg separado
            full_prompt = f"{self.system_prompt}\n\n{prompt}"
            
            response_dict = await llm_client.generate(
                prompt=full_prompt,
                task_type=TaskType.ANALYSIS,
                model=settings.generation_model
            )
            
            # Parse JSON response
            response = response_dict["content"]
            # Limpar markdown code blocks se houver
            response = response.replace("```json", "").replace("```", "").strip()
            
            analysis = json.loads(response)
            return analysis
            
        except Exception as e:
            # Fallback para análise padrão
            return {
                "topic": "geral",
                "tone": "professional",
                "target_audience": "geral",
                "suggested_style": "modern-minimal",
                "color_palette": [
                    {"hex": "#667eea", "name": "Primary", "usage": "títulos"},
                    {"hex": "#764ba2", "name": "Secondary", "usage": "subtítulos"},
                    {"hex": "#f093fb", "name": "Accent", "usage": "destaques"},
                    {"hex": "#ffffff", "name": "Background", "usage": "fundo"},
                    {"hex": "#2d3748", "name": "Text", "usage": "texto"}
                ],
                "typography": {
                    "heading": "Inter",
                    "subheading": "Lato",
                    "body": "Open Sans",
                    "reasoning": "Fontes modernas e legíveis"
                },
                "mood": "profissional e moderno"
            }
    
    async def generate_cover_design(self, analysis: Dict[str, Any], title: str, subtitle: str = "") -> Dict[str, Any]:
        """
        Gera design de capa profissional baseado na análise
        
        Args:
            analysis: Resultado do analyze_content
            title: Título do ebook
            subtitle: Subtítulo (opcional)
            
        Returns:
            {
                "html": str,
                "css": str,
                "suggestions": List[str]
            }
        """
        from services.llm_client import llm_client, TaskType
        
        colors = analysis.get("color_palette", [])
        typography = analysis.get("typography", {})
        style = analysis.get("suggested_style", "modern")
        
        primary_color = colors[0]["hex"] if colors else "#667eea"
        secondary_color = colors[1]["hex"] if len(colors) > 1 else "#764ba2"
        
        prompt = f"""
Crie um design de capa HTML/CSS para um ebook com:

TÍTULO: {title}
SUBTÍTULO: {subtitle}
ESTILO: {style}
COR PRINCIPAL: {primary_color}
COR SECUNDÁRIA: {secondary_color}
FONTE TÍTULO: {typography.get('heading', 'Inter')}

Gere HTML e CSS inline para uma capa elegante e profissional.
A capa deve ter 800x1000px.

Retorne JSON:
{{
    "html": "código HTML completo da capa",
    "css": "estilos CSS",
    "suggestions": ["dica 1", "dica 2", "dica 3"]
}}

Use gradientes, tipografia hierárquica e whitespace generoso.
Retorne APENAS o JSON.
"""
        
        try:
            full_prompt = f"{self.system_prompt}\n\n{prompt}"
            
            response_dict = await llm_client.generate(
                prompt=full_prompt,
                task_type=TaskType.GENERATION,
                model=settings.generation_model
            )
            
            response = response_dict["content"]
            response = response.replace("```json", "").replace("```", "").strip()
            
            cover_design = json.loads(response)
            return cover_design
            
        except Exception as e:
            # Fallback design - criar HTML do subtitle fora da f-string
            heading_font = typography.get('heading', 'Inter')
            
            # Criar elemento subtitle separadamente para evitar escape issues
            if subtitle:
                subtitle_element = f'<h2 style="font-family: \'Lato\', sans-serif; font-size: 32px; font-weight: 300; color: rgba(255,255,255,0.9); margin-top: 20px; text-align: center;">{subtitle}</h2>'
            else:
                subtitle_element = ''
            
            html_template = f"""<div style="width: 800px; height: 1000px; background: linear-gradient(135deg, {primary_color}, {secondary_color}); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 60px; position: relative;">
    <h1 style="font-family: '{heading_font}', sans-serif; font-size: 72px; font-weight: 800; color: white; text-align: center; margin: 0;">{title}</h1>
    {subtitle_element}
    <div style="width: 100px; height: 4px; background: white; margin-top: 40px; border-radius: 2px;"></div>
</div>"""
            
            return {
                "html": html_template,
                "css": "",
                "suggestions": [
                    "Adicione uma imagem de fundo relevante",
                    "Considere usar um padrão geométrico sutil",
                    "Experimente diferentes combinações de cores"
                ]
            }
    
    def validate_contrast(self, fg_color: str, bg_color: str) -> float:
        """
        Valida contraste de cores (WCAG)
        
        Args:
            fg_color: Cor do texto (hex)
            bg_color: Cor do fundo (hex)
            
        Returns:
            Razão de contraste (mínimo 4.5:1 para texto normal)
        """
        def hex_to_rgb(hex_color):
            hex_color = hex_color.lstrip('#')
            return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
        
        def relative_luminance(rgb):
            r, g, b = [x / 255.0 for x in rgb]
            r = r / 12.92 if r <= 0.03928 else ((r + 0.055) / 1.055) ** 2.4
            g = g / 12.92 if g <= 0.03928 else ((g + 0.055) / 1.055) ** 2.4
            b = b / 12.92 if b <= 0.03928 else ((b + 0.055) / 1.055) ** 2.4
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
        
        fg_rgb = hex_to_rgb(fg_color)
        bg_rgb = hex_to_rgb(bg_color)
        
        l1 = relative_luminance(fg_rgb)
        l2 = relative_luminance(bg_rgb)
        
        lighter = max(l1, l2)
        darker = min(l1, l2)
        
        contrast_ratio = (lighter + 0.05) / (darker + 0.05)
        return contrast_ratio


# Singleton instance
_design_agent = None

def get_design_agent() -> DesignAgent:
    """Get or create DesignAgent instance"""
    global _design_agent
    if _design_agent is None:
        _design_agent = DesignAgent()
    return _design_agent
