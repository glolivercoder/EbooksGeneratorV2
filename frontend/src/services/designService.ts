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
 * Obtém biblioteca de fontes curadas
 */
export async function getFonts(): Promise<{ fonts: any }> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/design/fonts`)

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching fonts:', error)
        throw error
    }
}
