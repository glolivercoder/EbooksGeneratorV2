import { create } from 'zustand'

interface APIConfig {
    openrouterKey: string
    openaiKey: string
    geminiKey: string
    pixabayKey: string
}

interface ConfigStore {
    apiConfig: APIConfig
    updateAPIConfig: (config: Partial<APIConfig>) => void
    loadAPIConfig: () => Promise<void>
    saveAPIConfig: () => Promise<void>
    testConnections: () => Promise<any>
}

export const useConfig = create<ConfigStore>()((set, get) => ({
    apiConfig: {
        openrouterKey: '',
        openaiKey: '',
        geminiKey: '',
        pixabayKey: '',
    },

    updateAPIConfig: (config) =>
        set((state) => ({
            apiConfig: { ...state.apiConfig, ...config },
        })),

    loadAPIConfig: async () => {
        try {
            const response = await fetch('/api/config/keys')
            if (!response.ok) {
                throw new Error('Falha ao carregar chaves de API')
            }
            const data = await response.json()
            set({
                apiConfig: {
                    openrouterKey: data.openrouter_api_key ?? '',
                    openaiKey: data.openai_api_key ?? '',
                    geminiKey: data.gemini_api_key ?? '',
                    pixabayKey: data.pixabay_api_key ?? '',
                },
            })
        } catch (error) {
            console.error('Error loading API config:', error)
            throw error
        }
    },

    saveAPIConfig: async () => {
        const { apiConfig } = get()
        try {
            const payload = [
                { key_name: 'OPENROUTER_API_KEY', key_value: apiConfig.openrouterKey },
                { key_name: 'OPENAI_API_KEY', key_value: apiConfig.openaiKey },
                { key_name: 'GEMINI_API_KEY', key_value: apiConfig.geminiKey },
                { key_name: 'PIXABAY_API_KEY', key_value: apiConfig.pixabayKey },
            ]

            const response = await fetch('/api/config/update-keys', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(text || 'Falha ao salvar chaves de API')
            }
        } catch (error) {
            console.error('Error saving API config:', error)
            throw error
        }
    },

    testConnections: async () => {
        try {
            const response = await fetch('/api/config/test-connection', {
                method: 'POST',
            })
            return await response.json()
        } catch (error) {
            console.error('Error testing connections:', error)
            throw error
        }
    },
}))
