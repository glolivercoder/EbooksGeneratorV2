/**
 * Model Service - Gerencia modelos disponíveis para geração
 */

const API_BASE_URL = 'http://localhost:8000'

export interface ModelInfo {
    id: string
    name: string
    provider: string
    type: 'text' | 'image' | 'multimodal'
    capabilities: string[]
    pricing: {
        input: number  // $ por 1M tokens ou por imagem
        output: number
        free_tier: boolean
    }
    description: string
}

export const IMAGE_GENERATION_MODELS: ModelInfo[] = [
    // Modelos Gratuitos
    {
        id: 'black-forest-labs/flux-schnell',
        name: 'FLUX Schnell (Free)',
        provider: 'Black Forest Labs',
        type: 'image',
        capabilities: ['image-generation', 'fast'],
        pricing: {
            input: 0,
            output: 0,
            free_tier: true
        },
        description: 'Modelo gratuito rápido para geração de imagens'
    },
    {
        id: 'google/gemini-2.5-flash-image',
        name: 'Gemini 2.5 Flash Image (Free)',
        provider: 'Google',
        type: 'multimodal',
        capabilities: ['image-generation', 'image-edit', 'multimodal'],
        pricing: {
            input: 0,
            output: 0,
            free_tier: true
        },
        description: 'Modelo gratuito para geração e edição de imagens com contexto'
    },

    // Modelos Baratos (OpenRouter)
    {
        id: 'stability-ai/stable-diffusion-xl',
        name: 'Stable Diffusion XL',
        provider: 'Stability AI',
        type: 'image',
        capabilities: ['image-generation', 'high-quality'],
        pricing: {
            input: 0.002,
            output: 0.002,
            free_tier: false
        },
        description: 'Modelo de alta qualidade com preço acessível (~$0.002/imagem)'
    },
    {
        id: 'black-forest-labs/flux-pro',
        name: 'FLUX Pro',
        provider: 'Black Forest Labs',
        type: 'image',
        capabilities: ['image-generation', 'professional'],
        pricing: {
            input: 0.005,
            output: 0.005,
            free_tier: false
        },
        description: 'Versão profissional do FLUX (~$0.005/imagem)'
    },

    // Fallback Premium
    {
        id: 'openai/dall-e-3',
        name: 'DALL-E 3',
        provider: 'OpenAI',
        type: 'image',
        capabilities: ['image-generation', 'premium', 'high-quality'],
        pricing: {
            input: 0.04,  // Standard quality
            output: 0.04,
            free_tier: false
        },
        description: 'Modelo premium da OpenAI (~$0.04/imagem standard)'
    }
]

export const TEMPLATE_GENERATION_MODELS: ModelInfo[] = [
    {
        id: 'google/gemini-pro-1.5',
        name: 'Gemini Pro 1.5',
        provider: 'Google',
        type: 'text',
        capabilities: ['html-generation', 'css-generation', 'multimodal'],
        pricing: {
            input: 0.00125,
            output: 0.00375,
            free_tier: false
        },
        description: 'Modelo para geração de HTML/CSS profissional'
    },
    {
        id: 'anthropic/claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        type: 'text',
        capabilities: ['html-generation', 'css-generation', 'fast'],
        pricing: {
            input: 0.00025,
            output: 0.00125,
            free_tier: false
        },
        description: 'Modelo rápido e barato para templates'
    }
]

/**
 * Obtém lista de modelos disponíveis da OpenRouter
 */
export async function getAvailableModels(): Promise<ModelInfo[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/openrouter/models`)

        if (!response.ok) {
            throw new Error('Failed to fetch models')
        }

        const data = await response.json()

        // TODO: Transform OpenRouter response to ModelInfo format
        return IMAGE_GENERATION_MODELS
    } catch (error) {
        console.error('Error fetching models:', error)
        return IMAGE_GENERATION_MODELS
    }
}

/**
 * Seleciona melhor modelo baseado em estratégia
 */
export function selectBestModel(
    strategy: 'free' | 'cheap' | 'premium',
    capabilities: string[] = []
): ModelInfo {
    let models = IMAGE_GENERATION_MODELS

    // Filtrar por capacidades se especificadas
    if (capabilities.length > 0) {
        models = models.filter(m =>
            capabilities.every(cap => m.capabilities.includes(cap))
        )
    }

    switch (strategy) {
        case 'free':
            return models.find(m => m.pricing.free_tier) || models[0]

        case 'cheap':
            const cheapModels = models.filter(m => !m.pricing.free_tier)
            return cheapModels.sort((a, b) => a.pricing.output - b.pricing.output)[0] || models[0]

        case 'premium':
            return models[models.length - 1] // DALL-E 3

        default:
            return models[0]
    }
}

/**
 * Calcula custo estimado de geração
 */
export function estimateCost(model: ModelInfo, numImages: number = 1): number {
    if (model.pricing.free_tier) {
        return 0
    }

    return (model.pricing.input + model.pricing.output) * numImages
}

/**
 * Formata preço para exibição
 */
export function formatPrice(price: number): string {
    if (price === 0) {
        return 'Grátis'
    }

    if (price < 0.01) {
        return `$${(price * 1000).toFixed(3)}/k`
    }

    return `$${price.toFixed(3)}`
}
