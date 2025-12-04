/**
 * Design Service - API calls para Design Agent
 */

const API_BASE_URL = 'http://localhost:8000'

export interface DesignAnalysis {
    topic: string
    tone: string
    target_audience: string
    suggested_style: string
    color_palette: Array<{
        hex: string
        name: string
        usage: string
    }>
    typography: {
        heading: string
        subheading: string
        body: string
        reasoning: string
    }
    mood: string
}

export interface CoverDesign {
    html: string
    css: string
    suggestions: string[]
}

export interface ContrastValidation {
    contrast_ratio: number
    wcag_aa: boolean
    wcag_aaa: boolean
}

export interface ColorScheme {
    id: string
    name: string
    colors: {
        primary: string
        secondary: string
        accent: string
        background: string
        text: string
    }
    category: string
}

/**
 * Analisa conteúdo do editor e sugere design
 */
export async function analyzeContent(content: string): Promise<DesignAnalysis> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/design/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error analyzing content:', error)
        throw error
    }
}

/**
 * Gera design de capa profissional
 */
export async function generateCover(params: {
    title: string
    subtitle?: string
    analysis?: DesignAnalysis
    content?: string
}): Promise<CoverDesign> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/design/generate-cover`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error generating cover:', error)
        throw error
    }
}

/**
 * Valida contraste de cores (WCAG)
 */
export async function validateContrast(
    foreground: string,
    background: string
): Promise<ContrastValidation> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/design/validate-contrast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ foreground, background }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error validating contrast:', error)
        throw error
    }
}

/**
 * Obtém esquemas de cores predefinidos
 */
export async function getColorSchemes(): Promise<{ schemes: ColorScheme[] }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/design/color-schemes`)

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching color schemes:', error)
        throw error
    }
}

/**
 * Fontes disponíveis (Google Fonts)
 */
export const GOOGLE_FONTS = {
    serif: [
        'Merriweather', 'Lora', 'EB Garamond', 'Crimson Text', 'Libre Baskerville',
        'PT Serif', 'Spectral', 'Playfair Display', 'Bodoni Moda', 'Cormorant Garamond'
    ],
    sans: [
        'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
        'Inter', 'Raleway', 'Nunito', 'Ubuntu'
    ],
    display: [
        'Bebas Neue', 'Oswald', 'Cinzel', 'Abril Fatface', 'Anton'
    ],
    script: [
        'Pacifico', 'Great Vibes'
    ]
}

/**
 * Obtém biblioteca de fontes curadas
 */
export async function getFonts(): Promise<{ fonts: typeof GOOGLE_FONTS }> {
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 200))
    return { fonts: GOOGLE_FONTS }
}
/**
 * Referências de Templates por Tema
 */
export interface TemplateReference {
    id: string
    title: string
    category: 'blog' | 'cover' | 'editorial'
    theme: string
    imageUrl: string
    sourceUrl: string
    description: string
}

const MOCK_REFERENCES: TemplateReference[] = [
    {
        id: 'ref-1',
        title: 'Minimalist Blog Layout',
        category: 'blog',
        theme: 'minimalist',
        imageUrl: 'https://via.placeholder.com/300x200?text=Minimalist+Blog',
        sourceUrl: 'https://nomiolo.blogspot.com/',
        description: 'Layout limpo com foco em tipografia e espaço em branco.'
    },
    {
        id: 'ref-2',
        title: 'Vibrant Book Cover',
        category: 'cover',
        theme: 'vibrant',
        imageUrl: 'https://via.placeholder.com/200x300?text=Vibrant+Cover',
        sourceUrl: 'https://www.marcomancen.com/capas-diversas',
        description: 'Capa de livro com cores fortes e tipografia ousada.'
    },
    {
        id: 'ref-3',
        title: 'Editorial Spread',
        category: 'editorial',
        theme: 'editorial',
        imageUrl: 'https://via.placeholder.com/400x250?text=Editorial+Spread',
        sourceUrl: 'https://www.spd.org/nice-spread',
        description: 'Design de página dupla com layout assimétrico e imagens grandes.'
    },
    {
        id: 'ref-4',
        title: 'Creative Text Flow',
        category: 'blog',
        theme: 'creative',
        imageUrl: 'https://via.placeholder.com/300x200?text=Creative+Text',
        sourceUrl: 'https://nomiolo.blogspot.com/',
        description: 'Arranjo de texto criativo que quebra o grid tradicional.'
    },
    {
        id: 'ref-5',
        title: 'Dark Mode Cover',
        category: 'cover',
        theme: 'dark',
        imageUrl: 'https://via.placeholder.com/200x300?text=Dark+Cover',
        sourceUrl: 'https://www.marcomancen.com/capas-diversas',
        description: 'Capa misteriosa com fundo escuro e elementos metálicos.'
    },
    {
        id: 'ref-6',
        title: 'Academic Journal',
        category: 'editorial',
        theme: 'academic',
        imageUrl: 'https://via.placeholder.com/400x250?text=Academic+Journal',
        sourceUrl: 'https://nomiolo.blogspot.com/',
        description: 'Layout estruturado, ideal para conteúdo técnico e científico.'
    },
    {
        id: 'ref-7',
        title: 'Lifestyle Magazine',
        category: 'editorial',
        theme: 'lifestyle',
        imageUrl: 'https://via.placeholder.com/400x250?text=Lifestyle+Mag',
        sourceUrl: 'https://www.spd.org/nice-spread',
        description: 'Design moderno com foco em fotografia e tipografia leve.'
    },
    {
        id: 'ref-8',
        title: 'Retro Book Cover',
        category: 'cover',
        theme: 'retro',
        imageUrl: 'https://via.placeholder.com/200x300?text=Retro+Cover',
        sourceUrl: 'https://www.marcomancen.com/capas-diversas',
        description: 'Estilo vintage com texturas e fontes clássicas.'
    },
    {
        id: 'ref-9',
        title: 'Corporate Report',
        category: 'editorial',
        theme: 'corporate',
        imageUrl: 'https://via.placeholder.com/300x200?text=Corporate+Report',
        sourceUrl: 'https://nomiolo.blogspot.com/',
        description: 'Grid limpo, cores sóbrias e foco em dados.'
    },
    {
        id: 'ref-10',
        title: 'Playful Kids Book',
        category: 'cover',
        theme: 'playful',
        imageUrl: 'https://via.placeholder.com/200x300?text=Kids+Book',
        sourceUrl: 'https://www.marcomancen.com/capas-diversas',
        description: 'Cores vibrantes, fontes arredondadas e ilustrações.'
    }
]

export async function getTemplateReferences(theme?: string): Promise<TemplateReference[]> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500))

    if (theme) {
        return MOCK_REFERENCES.filter(ref => ref.theme.includes(theme) || ref.category.includes(theme))
    }
    return MOCK_REFERENCES
}
