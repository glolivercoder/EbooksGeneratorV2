DESPlano de Implementação: Aba DESIGN (Conceito Correto)
Data: 2025-12-03
Status: 🔄 Replanning - Conceito Corrigido

❌ Erro Conceitual Anterior
O que estava sendo feito (ERRADO):
React Flow criando organogramas/diagramas
Nodes com texto simples
Sem design visual real
Sem HTML/CSS estilizado
Sem tipografia moderna
Sem cores/imagens adequadas
Resultado: Templates "estruturais" sem apelo visual

✅ Conceito Correto: IA como Designer Gráfico
O que deve ser feito:
┌─────────────────────────────────────────────┐
│  EDITOR (TipTap)                            │
│  "Design Thinking: O Guia Definitivo"      │
│  - Conteúdo sobre inovação                 │
│  - Tom: Profissional/Moderno                │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  IA DESIGNER AGENT                          │
│  - Analisa contexto do texto                │
│  - Identifica tema (tech, negócios, etc.)   │
│  - Define paleta de cores moderna           │
│  - Escolhe tipografia adequada              │
│  - Seleciona imagens/assets                 │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  DESIGN TAB (Fabric.js)                     │
│  ┌───────────────────────────────────────┐  │
│  │ 🎨 Capa com gradiente moderno         │  │
│  │ Typography: Inter, 48pt, Bold         │  │
│  │ Cor: #667eea → #764ba2               │  │
│  │ Imagem de fundo: Abstract tech        │  │
│  └───────────────────────────────────────┘  │
│  ┌───────────────────────────────────────┐  │
│  │ 📄 Páginas internas                   │  │
│  │ Headers coloridos, margens elegantes  │  │
│  │ Fontes hierárquicas (H1, H2, body)    │  │
│  └───────────────────────────────────────┘  │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  APLICAR AO EDITOR                          │
│  - HTML + CSS inline gerado                 │
│  - Imagens embedded (base64 ou URLs)        │
│  - Estilos importados para TipTap           │
└─────────────────────────────────────────────┘
🎨 Aba DESIGN: Arquitetura
Stack Tecnológica
// Design Tab
{
  "canvas": "Fabric.js",
  "ai": "OpenAI GPT-4o (multimodal)",
  "imageGen": "DALL-E 3",
  "typography": "Google Fonts API",
  "colorPalettes": "Coolors API / IA generated",
  "export": "@react-pdf/renderer ou HTML direto"
}
Componentes Principais
frontend/src/components/Design/
├── DesignCanvas.tsx          // Canvas Fabric.js principal
├── DesignToolbar.tsx         // Ferramentas (texto, imagem, formas)
├── DesignSidebar.tsx         // Paletas de cores, fontes
├── AIDesignPanel.tsx         // Controles IA
├── LayersPanel.tsx           // Gerenciamento de camadas
├── TemplateGallery.tsx       // Templates pré-definidos
└── utils/
    ├── fabricHelpers.ts      // Utilities Fabric.js
    ├── designToHTML.ts       // Converter design → HTML
    └── styleExtractor.ts     // Extrair estilos do text
🤖 Design Agent: IA como Designer Profissional
Responsabilidades
# backend/agents/design_agent.py
class DesignAgent:
    """
    IA que atua como designer gráfico profissional
    Especialista em:
    - Tipografia moderna
    - Teoria das cores
    - Layout editorial
    - Design de capas
    """
    
    async def analyze_content(self, editor_html: str):
        """
        Analisa conteúdo do editor para determinar estilo
        
        Returns:
        {
            "topic": "tecnologia",
            "tone": "professional",
            "target_audience": "desenvolvedores",
            "suggested_style": "modern-tech",
            "color_palette": ["#667eea", "#764ba2", ...],
            "typography": {
                "heading": "Inter",
                "body": "Lato",
                "accent": "Playfair Display"
            }
        }
        """
        
    async def generate_cover_design(self, analysis: dict):
        """
        Gera design de capa profissional
        
        Returns:
        {
            "html": "<div class='cover'>...</div>",
            "css": "...",
            "background_image": "data:image/png;base64,...",
            "fabric_objects": [...]  // Para edição
        }
        """
        
    async def generate_page_template(self, page_type: str):
        """
        Gera template de página (introdução, capítulo, etc.)
        
        Returns:
        {
            "html": "...",
            "css": "...",
            "layout": "two-column" | "single" | "magazine"
        }
        """
Prompt Engineering para IA Designer
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
Analise o conteúdo fornecido e crie um design visual COMPLETO com:
1. Paleta de cores (mínimo 5 cores)
2. Tipografia (heading, body, accent)
3. Layout de capa (HTML + CSS)
4. Templates de páginas internas
5. Elementos gráficos (bordas, separadores, etc.)
Retorne JSON estruturado.
"""
📐 Interface da Aba DESIGN
Layout Visual
┌────────────────────────────────────────────────────────────┐
│  DESIGN TAB                                  [☰ Menu] [×]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌─────────────┐  ┌──────────────────────────────────┐    │
│  │  SIDEBAR    │  │     CANVAS (Fabric.js)           │    │
│  │             │  │                                  │    │
│  │ 🎨 Cores    │  │  ┌──────────────────────────┐   │    │
│  │ • #667eea   │  │  │  CAPA                    │   │    │
│  │ • #764ba2   │  │  │                          │   │    │
│  │ • #f093fb   │  │  │  Design Thinking         │   │    │
│  │             │  │  │  O Guia Definitivo       │   │    │
│  │ 🔤 Fontes   │  │  │                          │   │    │
│  │ • Inter     │  │  │  [Imagem de fundo]       │   │    │
│  │ • Lato      │  │  └──────────────────────────┘   │    │
│  │             │  │                                  │    │
│  │ 🖼️ Imagens  │  │  ┌──────────────────────────┐   │    │
│  │ [Galeria]   │  │  │  Página Interna          │   │    │
│  │             │  │  │  Header colorido         │   │    │
│  │ 🤖 IA       │  │  │  Texto formatado         │   │    │
│  │ [Analisar]  │  │  └──────────────────────────┘   │    │
│  │ [Gerar]     │  │                                  │    │
│  └─────────────┘  └──────────────────────────────────┘    │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │  TOOLBAR                                           │   │
│  │  [Texto] [Imagem] [Forma] [Linha] [Gradiente]     │   │
│  │  [Camadas] [Alinhar] [Zoom] [Exportar]            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  [💾 Salvar Design] [📄 Aplicar ao Editor] [🔄 Reset]     │
└────────────────────────────────────────────────────────────┘
## 📄 Configurações de Layout

A aba Design permite configuração completa do layout das páginas do ebook:

### Tamanho da Página
```typescript
interface PageSize {
  preset: 'A4' | 'Letter' | 'A5' | 'Custom'
  width: number  // mm
  height: number // mm
  orientation: 'portrait' | 'landscape'
}

const PAGE_PRESETS = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  A5: { width: 148, height: 210 },
  '6x9': { width: 152.4, height: 228.6 }, // Padrão Amazon KDP
}
```

**Interface:**
```tsx
<div className="page-size-selector">
  <h3>📐 Tamanho da Página</h3>
  <div className="presets">
    <button>A4 (210x297mm)</button>
    <button>Letter (8.5x11")</button>
    <button>A5 (148x210mm)</button>
    <button>6x9" (KDP)</button>
    <button>Custom</button>
  </div>
  
  <div className="orientation">
    <label>
      <input type="radio" name="orient" value="portrait" />
      📱 Retrato
    </label>
    <label>
      <input type="radio" name="orient" value="landscape" />
      🖥️ Paisagem
    </label>
  </div>
</div>
```

### Margens
```typescript
interface Margins {
  top: number
  right: number
  bottom: number
  left: number
  unit: 'mm' | 'in' | 'px'
  gutter?: number // Margem extra para encadernação
  mirror?: boolean // Margens espelhadas (ímpares/pares)
}

const MARGIN_PRESETS = {
  narrow: { top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 },
  normal: { top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
  wide: { top: 38.1, right: 38.1, bottom: 38.1, left: 38.1 },
  mirrored: { top: 25.4, right: 19.1, bottom: 25.4, left: 31.8, mirror: true }
}
```

**Interface:**
```tsx
<div className="margins-config">
  <h3>📏 Margens</h3>
  
  <div className="presets">
    <button>Estreitas</button>
    <button>Normais</button>
    <button>Largas</button>
    <button>Espelhadas</button>
  </div>
  
  <div className="custom-margins">
    <input type="number" placeholder="Superior" />
    <input type="number" placeholder="Direita" />
    <input type="number" placeholder="Inferior" />
    <input type="number" placeholder="Esquerda" />
  </div>
  
  <label>
    <input type="checkbox" />
    Adicionar margem de encadernação (gutter)
  </label>
</div>
```

## 🔤 Configurações de Tipografia

Sistema completo de tipografia hierárquica:

### Fontes Principais
```typescript
interface TypographyConfig {
  primary: FontConfig      // Títulos principais
  secondary: FontConfig    // Subtítulos
  body: FontConfig        // Corpo de texto
  accent: FontConfig      // Destaques
  monospace: FontConfig   // Código
}

interface FontConfig {
  family: string
  weights: number[]
  fallback: string[]
  googleFont: boolean
}
```

**Banco de Fontes Curadas:**
```typescript
const FONT_LIBRARY = {
  serif: [
    { name: 'Playfair Display', use: 'Elegante, editorial' },
    { name: 'Merriweather', use: 'Legível, clássico' },
    { name: 'Lora', use: 'Moderno, versátil' },
    { name: 'Crimson Text', use: 'Literário' }
  ],
  sansSerif: [
    { name: 'Inter', use: 'Tech, moderno' },
    { name: 'Lato', use: 'Corporativo' },
    { name: 'Open Sans', use: 'Universal' },
    { name: 'Montserrat', use: 'Bold, impactante' }
  ],
  display: [
    { name: 'Bebas Neue', use: 'Títulos impactantes' },
    { name: 'Oswald', use: 'Condensado' },
    { name: 'Righteous', use: 'Criativo' }
  ],
  monospace: [
    { name: 'Fira Code', use: 'Código com ligaduras' },
    { name: 'JetBrains Mono', use: 'Código moderno' }
  ]
}
```

### Tamanhos e Hierarquia
```typescript
interface TypographyScale {
  h1: { size: number, lineHeight: number, weight: number }
  h2: { size: number, lineHeight: number, weight: number }
  h3: { size: number, lineHeight: number, weight: number }
  h4: { size: number, lineHeight: number, weight: number }
  body: { size: number, lineHeight: number, weight: number }
  small: { size: number, lineHeight: number, weight: number }
  caption: { size: number, lineHeight: number, weight: number }
}

const TYPOGRAPHY_SCALES = {
  traditional: {
    h1: { size: 36, lineHeight: 1.2, weight: 700 },
    h2: { size: 28, lineHeight: 1.3, weight: 600 },
    h3: { size: 22, lineHeight: 1.4, weight: 600 },
    body: { size: 12, lineHeight: 1.6, weight: 400 }
  },
  modern: {
    h1: { size: 48, lineHeight: 1.1, weight: 800 },
    h2: { size: 32, lineHeight: 1.2, weight: 700 },
    h3: { size: 24, lineHeight: 1.3, weight: 600 },
    body: { size: 14, lineHeight: 1.7, weight: 400 }
  },
  compact: {
    h1: { size: 32, lineHeight: 1.2, weight: 700 },
    h2: { size: 24, lineHeight: 1.3, weight: 600 },
    body: { size: 11, lineHeight: 1.5, weight: 400 }
  }
}
```

**Interface:**
```tsx
<div className="typography-panel">
  <h3>🔤 Tipografia</h3>
  
  {/* Font Selector */}
  <div className="font-selector">
    <label>Título Principal</label>
    <select>
      <optgroup label="Serif">
        <option>Playfair Display</option>
        <option>Merriweather</option>
      </optgroup>
      <optgroup label="Sans-Serif">
        <option>Inter</option>
        <option>Lato</option>
      </optgroup>
    </select>
    
    <div className="font-preview">
      <h1 style={{ fontFamily: selectedFont }}>Design Thinking</h1>
    </div>
  </div>
  
  {/* Scale Preset */}
  <div className="scale-selector">
    <button>Tradicional</button>
    <button>Moderno</button>
    <button>Compacto</button>
  </div>
  
  {/* Fine Tuning */}
  <div className="typography-controls">
    <div>
      <label>H1 - Título Principal</label>
      <input type="range" min="24" max="72" /> <span>48pt</span>
      <input type="range" min="100" max="900" step="100" /> <span>700</span>
    </div>
    <div>
      <label>Corpo de Texto</label>
      <input type="range" min="10" max="18" /> <span>12pt</span>
      <input type="range" min="1.2" max="2.0" step="0.1" /> <span>1.6</span>
    </div>
  </div>
  
  {/* Advanced */}
  <details>
    <summary>⚙️ Configurações Avançadas</summary>
    <label>Letter Spacing: <input type="range" min="-50" max="50" /></label>
    <label>Word Spacing: <input type="range" min="0" max="20" /></label>
    <label>Kerning: <input type="checkbox" checked /> Ativado</label>
  </details>
</div>
```

## 🎨 Cores e Tema

Sistema inteligente de paleta de cores:

### Esquema de Cores
```typescript
interface ColorScheme {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: {
    primary: string
    secondary: string
    disabled: string
  }
  semantic: {
    success: string
    warning: string
    error: string
    info: string
  }
}

const COLOR_SCHEMES = {
  modernPurple: {
    name: 'Modern Purple',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#ffffff',
    surface: '#f5f7fa',
    text: {
      primary: '#2d3748',
      secondary: '#718096',
      disabled: '#cbd5e0'
    }
  },
  techBlue: {
    name: 'Tech Blue',
    primary: '#0099ff',
    secondary: '#00d4ff',
    accent: '#e94560',
    background: '#1a1a2e',
    surface: '#16213e',
    text: {
      primary: '#ffffff',
      secondary: '#a0aec0',
      disabled: '#4a5568'
    }
  },
  earthyWarm: {
    name: 'Earthy Warm',
    primary: '#8b7355',
    secondary: '#c19a6b',
    accent: '#d4a574',
    background: '#f4e8c1',
    surface: '#ffffff',
    text: {
      primary: '#2c2416',
      secondary: '#5a4a3a'
    }
  }
}
```

### Geração Inteligente de Cores
```python
# backend/agents/color_agent.py
class ColorAgent:
    """Gera paletas baseadas no conteúdo"""
    
    async def generate_palette(self, content_analysis: dict):
        """
        Analisa tema e gera paleta harmônica
        
        Input: {"topic": "tecnologia", "tone": "professional"}
        Output: {
            "primary": "#667eea",
            "harmony": "complementary",
            "wcag_compliant": true,
            "mood": "confiante, inovador"
        }
        """
        
    def validate_contrast(self, fg: str, bg: str) -> float:
        """Garante WCAG AAA (contraste mínimo 7:1)"""
```

**Interface:**
```tsx
<div className="color-panel">
  <h3>🎨 Cores e Tema</h3>
  
  {/* AI Generation */}
  <button className="ai-generate">
    🤖 Gerar Paleta pela IA
  </button>
  
  {/* Preset Schemes */}
  <div className="color-schemes">
    {COLOR_SCHEMES.map(scheme => (
      <div className="scheme-card">
        <div className="palette-preview">
          <span style={{ background: scheme.primary }} />
          <span style={{ background: scheme.secondary }} />
          <span style={{ background: scheme.accent }} />
        </div>
        <span>{scheme.name}</span>
      </div>
    ))}
  </div>
  
  {/* Custom Editor */}
  <div className="color-editor">
    <div className="color-input">
      <label>Cor Principal</label>
      <input type="color" value="#667eea" />
      <input type="text" value="#667eea" />
    </div>
    
    <div className="harmony-generator">
      <button>Complementar</button>
      <button>Análogo</button>
      <button>Triádico</button>
      <button>Tetrádico</button>
    </div>
  </div>
  
  {/* Gradient Builder */}
  <div className="gradient-builder">
    <h4>Gradientes</h4>
    <div className="gradient-preview" style={{
      background: 'linear-gradient(135deg, #667eea, #764ba2)'
    }} />
    <button>Editar Gradiente</button>
  </div>
  
  {/* Accessibility Check */}
  <div className="a11y-check">
    <span>Contraste WCAG: </span>
    <span className="badge-success">AAA (8.2:1)</span>
  </div>
</div>
```

## 🖼️ Elementos Visuais

Componentes de layout e ornamentação:

### Cabeçalhos e Rodapés
```typescript
interface HeaderFooterConfig {
  enabled: boolean
  type: 'simple' | 'decorative' | 'minimal'
  content: {
    left?: string   // e.g., "${chapterTitle}"
    center?: string // e.g., "${pageNumber}"
    right?: string  // e.g., "${authorName}"
  }
  style: {
    height: number
    fontSize: number
    separator?: 'line' | 'dots' | 'ornament' | 'none'
  }
  firstPage?: 'hide' | 'different'
}
```

**Templates de Header/Footer:**
```tsx
const HEADER_TEMPLATES = [
  {
    name: 'Clássico',
    preview: '───────── 12 ─────────',
    config: {
      center: '${pageNumber}',
      separator: 'line'
    }
  },
  {
    name: 'Editorial',
    preview: 'Capítulo 1 · · · 12',
    config: {
      left: '${chapterTitle}',
      right: '${pageNumber}',
      separator: 'dots'
    }
  },
  {
    name: 'Moderno',
    preview: 'Design Thinking        |        12',
    config: {
      left: '${bookTitle}',
      right: '${pageNumber}',
      separator: 'none'
    }
  }
]
```

### Numeração de Páginas
```typescript
interface PageNumbering {
  enabled: boolean
  position: 'top-left' | 'top-center' | 'top-right' | 
            'bottom-left' | 'bottom-center' | 'bottom-right'
  format: 'numeric' | 'roman' | 'alphabetic'
  startAt: number
  prefix?: string
  suffix?: string
  style: {
    fontSize: number
    fontFamily: string
    color: string
    decoration?: 'circle' | 'square' | 'ornament' | 'none'
  }
}
```

### Índice Automático
```typescript
interface TOCConfig {
  enabled: boolean
  title: string
  levels: number[] // [1, 2, 3] = H1, H2, H3
  style: 'dotted' | 'clean' | 'modern' | 'classic'
  pageBreakAfter: boolean
  includePageNumbers: boolean
}
```

**Geração Automática:**
```tsx
const generateTOC = (editorContent: string) => {
  const headings = extractHeadings(editorContent)
  
  return (
    <div className="table-of-contents">
      <h1>Índice</h1>
      {headings.map((h, idx) => (
        <div className={`toc-item level-${h.level}`}>
          <span className="title">{h.text}</span>
          <span className="dots"></span>
          <span className="page">{h.pageNumber}</span>
        </div>
      ))}
    </div>
  )
}
```

### Capa do Ebook
```typescript
interface CoverConfig {
  layout: 'centered' | 'split' | 'asymmetric' | 'fullbleed'
  background: {
    type: 'color' | 'gradient' | 'image' | 'pattern'
    value: string
  }
  elements: CoverElement[]
  overlay?: {
    color: string
    opacity: number
  }
}

interface CoverElement {
  type: 'title' | 'subtitle' | 'author' | 'image' | 'decoration'
  content: string
  position: { x: number, y: number }
  style: CSSProperties
}
```

**Templates de Capa:**
```tsx
const COVER_TEMPLATES = [
  {
    name: 'Gradiente Moderno',
    thumbnail: '/covers/modern-gradient.png',
    config: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      title: { size: 72, weight: 800, color: 'white', position: 'center' },
      decoration: 'geometric-pattern'
    }
  },
  {
    name: 'Imagem de Fundo',
    thumbnail: '/covers/image-bg.png',
    config: {
      background: 'image',
      overlay: { color: '#000', opacity: 0.5 },
      title: { size: 64, weight: 700, color: 'white', position: 'bottom' }
    }
  },
  {
    name: 'Minimalista',
    thumbnail: '/covers/minimal.png',
    config: {
      background: '#ffffff',
      title: { size: 48, weight: 300, color: '#333', position: 'top' },
      decoration: 'line-accent'
    }
  }
]
```

## 🎭 Templates e Temas Pré-definidos

Sistema completo de templates prontos:

### Categorias de Templates
```typescript
interface TemplateCategory {
  id: string
  name: string
  description: string
  templates: Template[]
}

const TEMPLATE_CATEGORIES = [
  {
    id: 'tech',
    name: 'Tecnologia',
    description: 'Para livros sobre programação, IA, startups',
    templates: [
      'Modern Tech', 'Cyberpunk', 'Developer Guide', 'SaaS Clean'
    ]
  },
  {
    id: 'business',
    name: 'Negócios',
    description: 'Corporativo, liderança, empreendedorismo',
    templates: [
      'Corporate Blue', 'Executive', 'Startup', 'Finance Pro'
    ]
  },
  {
    id: 'creative',
    name: 'Criativo',
    description: 'Arte, design, fotografia',
    templates: [
      'Artist Portfolio', 'Magazine Style', 'Photo Book', 'Bohemian'
    ]
  },
  {
    id: 'academic',
    name: 'Acadêmico',
    description: 'Teses, papers, livros técnicos',
    templates: [
      'Thesis Classic', 'Research Paper', 'Textbook', 'Journal'
    ]
  },
  {
    id: 'fiction',
    name: 'Ficção',
    description: 'Romances, contos, poesia',
    templates: [
      'Novel Classic', 'Mystery Dark', 'Romance Light', 'Poetry Minimal'
    ]
  }
]
```

### Template Completo
```typescript
interface Template {
  id: string
  name: string
  category: string
  thumbnail: string
  preview: string // URL para preview interativo
  
  // Design System
  layout: PageLayoutConfig
  typography: TypographyConfig
  colors: ColorScheme
  
  // Components
  cover: CoverConfig
  header: HeaderFooterConfig
  footer: HeaderFooterConfig
  toc: TOCConfig
  
  // Assets
  decorations: DecorationAsset[]
  patterns: PatternAsset[]
}
```

**Exemplo: Template "Modern Tech"**
```typescript
const MODERN_TECH_TEMPLATE: Template = {
  id: 'modern-tech',
  name: 'Modern Tech',
  category: 'tech',
  
  layout: {
    pageSize: 'A4',
    margins: { top: 20, right: 20, bottom: 20, left: 20 }
  },
  
  typography: {
    primary: { family: 'Inter', weights: [700, 800] },
    body: { family: 'Lato', weights: [400, 600] },
    monospace: { family: 'Fira Code', weights: [400] }
  },
  
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    background: '#ffffff',
    codeBlock: '#1a1a2e'
  },
  
  cover: {
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    title: {
      size: 72,
      weight: 800,
      color: 'white',
      fontFamily: 'Inter'
    },
    decoration: 'circuit-pattern-overlay'
  },
  
  header: {
    enabled: true,
    left: '${chapterTitle}',
    right: '${pageNumber}',
    separator: 'line',
    color: '#667eea'
  }
}
```

### Sistema de Personalização
```tsx
<div className="template-customizer">
  <h3>Personalizar Template</h3>
  
  {/* Base Template */}
  <div className="base-template">
    <img src={selectedTemplate.thumbnail} />
    <h4>{selectedTemplate.name}</h4>
  </div>
  
  {/* Customization Tabs */}
  <div className="tabs">
    <button>🎨 Cores</button>
    <button>🔤 Fontes</button>
    <button>📐 Layout</button>
    <button>🖼️ Capa</button>
  </div>
  
  {/* Quick Tweaks */}
  <div className="quick-tweaks">
    <label>
      Esquema de cores:
      <select>
        <option>Original</option>
        <option>Azul Profissional</option>
        <option>Verde Natureza</option>
        <option>Roxo Criativo</option>
      </select>
    </label>
    
    <label>
      Tamanho da fonte:
      <input type="range" min="0.8" max="1.2" step="0.1" />
    </label>
    
    <label>
      <input type="checkbox" />
      Modo escuro
    </label>
  </div>
  
  {/* Preview Live */}
  <div className="live-preview">
    <iframe src={`/preview/${selectedTemplate.id}?custom=${customizations}`} />
  </div>
  
  <button className="btn-primary">Aplicar Template</button>
</div>
```

### Galeria de Templates
```tsx
<div className="template-gallery">
  <div className="filters">
    <button>Todos</button>
    <button>Tecnologia</button>
    <button>Negócios</button>
    <button>Criativo</button>
    <button>Acadêmico</button>
  </div>
  
  <div className="search">
    <input placeholder="Buscar templates..." />
  </div>
  
  <div className="grid">
    {templates.map(template => (
      <div className="template-card">
        <img src={template.thumbnail} />
        <h4>{template.name}</h4>
        <p>{template.description}</p>
        <div className="actions">
          <button>👁️ Preview</button>
          <button>✨ Usar</button>
          <button>⭐ Favoritar</button>
        </div>
      </div>
    ))}
  </div>
</div>
```

🔄 Fluxo de Trabalho
1. Usuário Escreve no Editor
Editor TipTap:
┌─────────────────────────────────┐
│ # Design Thinking               │
│ ## Uma jornada pela inovação    │
│                                 │
│ Fundamentos essenciais...       │
│ Casos práticos e exemplos...    │
└─────────────────────────────────┘
2. Vai para Aba DESIGN
// User clicks "Design" tab
setActiveTab('design')
// Auto-fetch content from editor
const editorContent = editor.getHTML()
// Send to AI Designer
const analysis = await fetch('/api/design/analyze', {
  method: 'POST',
  body: JSON.stringify({ content: editorContent })
})
3. IA Designer Analisa
Backend:

@router.post("/design/analyze")
async def analyze_content(request: DesignAnalyzeRequest):
    # Extrair tema, tom, audiência
    analysis = await design_agent.analyze_content(request.content)
    
    return {
        "topic": "design thinking",
        "tone": "professional-creative",
        "audience": "designers, inovadores",
        "suggested_palette": [
            {"hex": "#667eea", "name": "Primary Purple"},
            {"hex": "#764ba2", "name": "Deep Purple"},
            {"hex": "#f093fb", "name": "Accent Pink"},
            {"hex": "#f5f7fa", "name": "Light Gray"},
            {"hex": "#2d3748", "name": "Dark Text"}
        ],
        "typography": {
            "heading": "Inter",
            "subheading": "Lato",
            "body": "Open Sans",
            "accent": "Playfair Display"
        },
        "style": "modern-gradient"
    }
4. Gera Design Visual
IA cria HTML/CSS:

<!-- Cover Design -->
<div class="elegant-cover" style="
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 800px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
">
  <!-- Background pattern -->
  <svg class="bg-pattern" style="
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.1;
  ">
    <!-- Geometric pattern -->
  </svg>
  
  <!-- Title -->
  <h1 style="
    font-family: 'Inter', sans-serif;
    font-size: 72px;
    font-weight: 800;
    color: white;
    text-align: center;
    margin: 0;
    letter-spacing: -2px;
    text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  ">
    Design Thinking
  </h1>
  
  <!-- Subtitle -->
  <h2 style="
    font-family: 'Lato', sans-serif;
    font-size: 32px;
    font-weight: 300;
    color: rgba(255,255,255,0.9);
    margin-top: 20px;
    text-align: center;
  ">
    O Guia Definitivo
  </h2>
  
  <!-- Decorative element -->
  <div style="
    width: 100px;
    height: 4px;
    background: white;
    margin-top: 40px;
    border-radius: 2px;
  "></div>
</div>
5. Fabric.js para Edição Visual
Frontend renderiza no canvas:

// DesignCanvas.tsx
import { fabric } from 'fabric'
const applyDesignToCanvas = (designData: DesignResponse) => {
  const canvas = new fabric.Canvas('design-canvas')
  
  // Add background gradient
  const gradient = new fabric.Gradient({
    type: 'linear',
    coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
    colorStops: [
      { offset: 0, color: '#667eea' },
      { offset: 1, color: '#764ba2' }
    ]
  })
  
  canvas.setBackgroundColor(gradient, canvas.renderAll.bind(canvas))
  
  // Add text elements
  const title = new fabric.Text('Design Thinking', {
    left: canvas.width / 2,
    top: 300,
    fontSize: 72,
    fontFamily: 'Inter',
    fontWeight: '800',
    fill: 'white',
    textAlign: 'center',
    shadow: new fabric.Shadow({
      color: 'rgba(0,0,0,0.3)',
      blur: 20
    })
  })
  
  canvas.add(title)
  canvas.centerObject(title)
  
  // Add subtitle, decorations, etc.
  // ...
}
6. Usuário Edita Visualmente
Arrasta elementos
Muda cores
Ajusta tipografia
Adiciona imagens
Ajusta layout
7. Aplica ao Editor
const handleApplyToEditor = () => {
  // 1. Export canvas to HTML/CSS
  const html = convertFabricToHTML(canvas)
  const css = extractCSS(canvas)
  
  // 2. Send to editor
  editor.commands.setContent(html)
  
  // 3. Switch to editor tab
  setActiveTab('editor')
  
  toast.success('Design aplicado com sucesso!')
}
🎨 Exemplos de Templates Gerados pela IA
Template 1: Tech/Futurista
Análise IA:

{
  "topic": "inteligência artificial",
  "palette": ["#00d4ff", "#0099ff", "#1a1a2e", "#16213e", "#e94560"],
  "typography": {
    "heading": "Orbitron",
    "body": "Roboto"
  },
  "style": "futuristic-tech",
  "elements": ["circuit patterns", "glowing effects", "sharp angles"]
}
CSS Gerado:

.tech-cover {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  font-family: 'Orbitron', sans-serif;
  color: #00d4ff;
  position: relative;
}
.tech-cover::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('data:image/svg+xml,...'); /* Circuit pattern */
  opacity: 0.1;
}
.tech-title {
  font-size: 64px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 0 0 20px #00d4ff;
}
Template 2: Editorial Clássico
Análise IA:

{
  "topic": "literatura clássica",
  "palette": ["#2c2416", "#8b7355", "#f4e8c1", "#c19a6b", "#ffffff"],
  "typography": {
    "heading": "Playfair Display",
    "body": "Lora"
  },
  "style": "classic-editorial",
  "elements": ["ornaments", "serif fonts", "wide margins"]
}
Template 3: Minimalista Escandinavo
Análise IA:

{
  "topic": "design de interiores",
  "palette": ["#ffffff", "#f7f7f7", "#333333", "#e0e0e0", "#4a90e2"],
  "typography": {
    "heading": "Helvetica Neue",
    "body": "Arial"
  },
  "style": "minimalist-scandinavian",
  "elements": ["whitespace", "clean lines", "subtle accents"]
}
📊 Comparação: React Flow vs Fabric.js
Aspecto	React Flow (Anterior ❌)	Fabric.js (Novo ✅)
Propósito	Diagramas, fluxogramas	Design visual canvas
Output	JSON nodes/edges	HTML/CSS/Imagens
Interação	Conectar nodes	Drag, resize, rotate
Tipografia	Limitada	Completa (Google Fonts)
Cores	Básicas	Gradientes, paletas
Imagens	Ícones simples	Full images, filters
Export	JSON	HTML, PNG, PDF
Edição	Estrutural	Visual WYSIWYG
🚀 Roadmap de Implementação
Fase 1: Setup Fabric.js (2-3 dias)
 Instalar fabric e @types/fabric
 Criar componente DesignCanvas.tsx
 Setup básico do canvas
 Toolbar com ferramentas básicas
 Sidebar com paletas de cores
Fase 2: Design Agent Backend (3-4 dias)
 Criar agents/design_agent.py
 Implementar análise de conteúdo
 Gerar paletas de cores
 Sugerir tipografia
 Criar templates HTML/CSS
Fase 3: Integração IA ↔ Fabric.js (3-4 dias)
 Endpoint /api/design/analyze
 Endpoint /api/design/generate-cover
 Endpoint /api/design/generate-page
 Converter HTML da IA → Fabric objects
 Preview em tempo real
Fase 4: Galeria de Templates (2-3 dias)
 Templates pré-definidos (10+)
 Categorias (Tech, Business, Creative, etc.)
 Sistema de favoritos
 Preview thumbnails
Fase 5: Export & Aplicação (2 dias)
 Fabric → HTML/CSS
 Embed images (base64)
 Aplicar ao TipTap Editor
 PDF export via @react-pdf/renderer
Fase 6: Polish & UX (2 dias)
 Undo/Redo
 Atalhos de teclado
 Zoom/Pan canvas
 Snap to grid
 Layers management
Total: ~15-20 dias

📝 Decisões Técnicas
Fabric.js vs Konva.js
Escolha: Fabric.js ✅

Motivo:

Mais maduro (10+ anos)
API mais intuitiva para canvas design
Melhor para editoração (vs animações)
Export SVG nativo
Comunidade maior
Google Fonts Integration
// Load fonts dynamically
const loadGoogleFont = (fontFamily: string) => {
  const link = document.createElement('link')
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;600;800&display=swap`
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}
// Usage
loadGoogleFont('Inter')
loadGoogleFont('Playfair Display')
Color Palette Generation
Opções:

IA gera cores baseado no tema
API Coolors.co (paletas prontas)
Algoritmo de harmonia de cores
Escolha: IA + validação de contraste

✅ Próximos Passos Imediatos
Atualizar TEMPLATE_BOOKS.md com conceito correto
Criar aba Design no App.tsx
Instalar Fabric.js
Implementar Design Agent
Testar com conteúdo real do editor