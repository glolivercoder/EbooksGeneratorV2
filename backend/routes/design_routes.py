"""
Design API Routes
Endpoints para análise de design e geração de capas
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from agents.design_agent import get_design_agent

router = APIRouter(prefix="/api/design", tags=["design"])


class DesignAnalyzeRequest(BaseModel):
    content: str


class DesignAnalyzeResponse(BaseModel):
    topic: str
    tone: str
    target_audience: str
    suggested_style: str
    color_palette: list
    typography: Dict[str, Any]
    mood: str


class GenerateCoverRequest(BaseModel):
    title: str
    subtitle: Optional[str] = ""
    analysis: Optional[Dict[str, Any]] = None
    content: Optional[str] = None


class GenerateCoverResponse(BaseModel):
    html: str
    css: str
    suggestions: list


class ValidateContrastRequest(BaseModel):
    foreground: str
    background: str


class ValidateContrastResponse(BaseModel):
    contrast_ratio: float
    wcag_aa: bool
    wcag_aaa: bool


@router.post("/analyze", response_model=DesignAnalyzeResponse)
async def analyze_content(request: DesignAnalyzeRequest):
    """
    Analisa conteúdo do editor e sugere design visual
    
    Args:
        content: HTML content do editor
        
    Returns:
        Análise de design com paleta de cores, tipografia, etc.
    """
    try:
        agent = get_design_agent()
        analysis = await agent.analyze_content(request.content)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-cover", response_model=GenerateCoverResponse)
async def generate_cover(request: GenerateCoverRequest):
    """
    Gera design de capa profissional
    
    Args:
        title: Título do ebook
        subtitle: Subtítulo (opcional)
        analysis: Análise prévia (opcional, se não fornecida será gerada)
        content: Conteúdo para análise (se analysis não fornecida)
        
    Returns:
        HTML e CSS da capa gerada
    """
    try:
        agent = get_design_agent()
        
        # Se não tem análise, gera uma
        if not request.analysis and request.content:
            analysis = await agent.analyze_content(request.content)
        elif request.analysis:
            analysis = request.analysis
        else:
            # Usa análise padrão
            analysis = {
                "topic": "geral",
                "tone": "professional",
                "suggested_style": "modern",
                "color_palette": [
                    {"hex": "#667eea", "name": "Primary"},
                    {"hex": "#764ba2", "name": "Secondary"}
                ],
                "typography": {
                    "heading": "Inter",
                    "subheading": "Lato"
                }
            }
        
        cover = await agent.generate_cover_design(
            analysis=analysis,
            title=request.title,
            subtitle=request.subtitle or ""
        )
        
        return cover
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/validate-contrast", response_model=ValidateContrastResponse)
async def validate_contrast(request: ValidateContrastRequest):
    """
    Valida contraste de cores (WCAG)
    
    Args:
        foreground: Cor do texto (hex)
        background: Cor do fundo (hex)
        
    Returns:
        Razão de contraste e conformidade WCAG
    """
    try:
        agent = get_design_agent()
        ratio = agent.validate_contrast(request.foreground, request.background)
        
        return {
            "contrast_ratio": round(ratio, 2),
            "wcag_aa": ratio >= 4.5,   # AA para texto normal
            "wcag_aaa": ratio >= 7.0   # AAA para texto normal
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/color-schemes")
async def get_color_schemes():
    """
    Retorna esquemas de cores pré-definidos
    
    Returns:
        Lista de esquemas de cores
    """
    return {
        "schemes": [
            {
                "id": "modern-purple",
                "name": "Modern Purple",
                "colors": {
                    "primary": "#667eea",
                    "secondary": "#764ba2",
                    "accent": "#f093fb",
                    "background": "#ffffff",
                    "text": "#2d3748"
                },
                "category": "tech"
            },
            {
                "id": "tech-blue",
                "name": "Tech Blue",
                "colors": {
                    "primary": "#0099ff",
                    "secondary": "#00d4ff",
                    "accent": "#e94560",
                    "background": "#1a1a2e",
                    "text": "#ffffff"
                },
                "category": "tech"
            },
            {
                "id": "earthy-warm",
                "name": "Earthy Warm",
                "colors": {
                    "primary": "#8b7355",
                    "secondary": "#c19a6b",
                    "accent": "#d4a574",
                    "background": "#f4e8c1",
                    "text": "#2c2416"
                },
                "category": "classic"
            },
            {
                "id": "minimal-mono",
                "name": "Minimal Monochrome",
                "colors": {
                    "primary": "#000000",
                    "secondary": "#333333",
                    "accent": "#666666",
                    "background": "#ffffff",
                    "text": "#000000"
                },
                "category": "minimal"
            }
        ]
    }


@router.get("/fonts")
async def get_fonts():
    """
    Retorna biblioteca de fontes curadas
    
    Returns:
        Fontes organizadas por categoria
    """
    return {
        "fonts": {
            "serif": [
                {"name": "Playfair Display", "use": "Elegante, editorial"},
                {"name": "Merriweather", "use": "Legível, clássico"},
                {"name": "Lora", "use": "Moderno, versátil"},
                {"name": "Crimson Text", "use": "Literário"}
            ],
            "sans_serif": [
                {"name": "Inter", "use": "Tech, moderno"},
                {"name": "Lato", "use": "Corporativo"},
                {"name": "Open Sans", "use": "Universal"},
                {"name": "Montserrat", "use": "Bold, impactante"}
            ],
            "display": [
                {"name": "Bebas Neue", "use": "Títulos impactantes"},
                {"name": "Oswald", "use": "Condensado"},
                {"name": "Righteous", "use": "Criativo"}
            ],
            "monospace": [
                {"name": "Fira Code", "use": "Código com ligaduras"},
                {"name": "JetBrains Mono", "use": "Código moderno"},
                {"name": "Courier New", "use": "Clássico"}
            ]
        }
    }


@router.get("/templates")
async def get_templates(category: Optional[str] = None):
    """
    Retorna lista de templates disponíveis
    
    Args:
        category: Filtra por categoria (technical, magazines, childrens, fashion, entrepreneurship)
        
    Returns:
        Lista de templates
    """
    from templates.templates import get_templates_by_category
    return {"templates": get_templates_by_category(category)}

