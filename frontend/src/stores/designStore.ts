import { create } from 'zustand'

export interface PageSize {
    preset: 'A4' | 'Letter' | 'A5' | 'Custom'
    width: number  // mm
    height: number // mm
    orientation: 'portrait' | 'landscape'
}

export interface Margins {
    top: number
    right: number
    bottom: number
    left: number
    unit: 'mm' | 'in' | 'px'
    gutter?: number
    mirror?: boolean
}

export interface TypographyConfig {
    primary: string
    secondary: string
    body: string
    accent: string
    monospace: string
}

export interface ColorScheme {
    name: string
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    textPrimary: string
    textSecondary: string
}

export interface DesignConfig {
    pageSize: PageSize
    margins: Margins
    typography: TypographyConfig
    colors: ColorScheme
}


export interface DesignTemplate {
    id: string
    name: string
    description?: string
    colors: ColorScheme
    typography: TypographyConfig
    layout: 'classic' | 'modern' | 'magazine' | 'minimal' | 'tech'
    createdAt: string
}

interface DesignState {
    config: DesignConfig
    selectedTemplate: string | null
    canvasObjects: any[]
    savedTemplates: DesignTemplate[]

    // Actions
    updatePageSize: (pageSize: Partial<PageSize>) => void
    updateMargins: (margins: Partial<Margins>) => void
    updateTypography: (typography: Partial<TypographyConfig>) => void
    updateColors: (colors: Partial<ColorScheme>) => void
    setSelectedTemplate: (templateId: string | null) => void
    addCanvasObject: (object: any) => void
    removeCanvasObject: (id: string) => void
    clearCanvas: () => void
    resetConfig: () => void
    saveCurrentAsTemplate: (name: string, description?: string) => DesignTemplate
    loadTemplate: (templateId: string) => void
    deleteTemplate: (templateId: string) => void
}

const DEFAULT_CONFIG: DesignConfig = {
    pageSize: {
        preset: 'A4',
        width: 210,
        height: 297,
        orientation: 'portrait'
    },
    margins: {
        top: 25.4,
        right: 25.4,
        bottom: 25.4,
        left: 25.4,
        unit: 'mm'
    },
    typography: {
        primary: 'Inter',
        secondary: 'Lato',
        body: 'Open Sans',
        accent: 'Playfair Display',
        monospace: 'Fira Code'
    },
    colors: {
        name: 'Modern Purple',
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#ffffff',
        surface: '#f5f7fa',
        textPrimary: '#2d3748',
        textSecondary: '#718096'
    }
}

const DEFAULT_TEMPLATES: DesignTemplate[] = [
    {
        id: 'template-modern-minimal',
        name: 'Modern Minimalist',
        description: 'Clean, elegant design with plenty of whitespace',
        layout: 'minimal',
        colors: {
            name: 'Minimal',
            primary: '#1a202c',
            secondary: '#4a5568',
            accent: '#3182ce',
            background: '#ffffff',
            surface: '#f7fafc',
            textPrimary: '#2d3748',
            textSecondary: '#718096'
        },
        typography: {
            primary: 'Playfair Display',
            secondary: 'Inter',
            body: 'Inter',
            accent: 'Playfair Display',
            monospace: 'Fira Code'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'template-tech-dark',
        name: 'Tech Dark Mode',
        description: 'Dark theme optimized for technical content',
        layout: 'tech',
        colors: {
            name: 'Cyberpunk',
            primary: '#00ff9d',
            secondary: '#bd00ff',
            accent: '#00d4ff',
            background: '#0f172a',
            surface: '#1e293b',
            textPrimary: '#e2e8f0',
            textSecondary: '#94a3b8'
        },
        typography: {
            primary: 'Orbitron',
            secondary: 'Roboto',
            body: 'Roboto',
            accent: 'Fira Code',
            monospace: 'Fira Code'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'template-magazine-vibrant',
        name: 'Vibrant Magazine',
        description: 'Bold colors and typography for engaging content',
        layout: 'magazine',
        colors: {
            name: 'Vibrant',
            primary: '#ff4757',
            secondary: '#2ed573',
            accent: '#ffa502',
            background: '#ffffff',
            surface: '#f1f2f6',
            textPrimary: '#2f3542',
            textSecondary: '#57606f'
        },
        typography: {
            primary: 'Montserrat',
            secondary: 'Raleway',
            body: 'Lato',
            accent: 'Pacifico',
            monospace: 'Consolas'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: 'template-classic-book',
        name: 'Classic Literature',
        description: 'Traditional book layout with serif fonts',
        layout: 'classic',
        colors: {
            name: 'Classic',
            primary: '#2c3e50',
            secondary: '#8e44ad',
            accent: '#c0392b',
            background: '#fdfbf7', // Cream
            surface: '#fff',
            textPrimary: '#2c3e50',
            textSecondary: '#7f8c8d'
        },
        typography: {
            primary: 'Merriweather',
            secondary: 'Lora',
            body: 'Crimson Text',
            accent: 'Cinzel',
            monospace: 'Courier Prime'
        },
        createdAt: new Date().toISOString()
    }
]

export const useDesignStore = create<DesignState>((set, get) => ({
    config: DEFAULT_CONFIG,
    selectedTemplate: null,
    canvasObjects: [],
    savedTemplates: DEFAULT_TEMPLATES,

    updatePageSize: (pageSize) => set((state) => ({
        config: {
            ...state.config,
            pageSize: { ...state.config.pageSize, ...pageSize }
        }
    })),

    updateMargins: (margins) => set((state) => ({
        config: {
            ...state.config,
            margins: { ...state.config.margins, ...margins }
        }
    })),

    updateTypography: (typography) => set((state) => ({
        config: {
            ...state.config,
            typography: { ...state.config.typography, ...typography }
        }
    })),

    updateColors: (colors) => set((state) => ({
        config: {
            ...state.config,
            colors: { ...state.config.colors, ...colors }
        }
    })),

    setSelectedTemplate: (templateId) => set({ selectedTemplate: templateId }),

    addCanvasObject: (object) => set((state) => ({
        canvasObjects: [...state.canvasObjects, object]
    })),

    removeCanvasObject: (id) => set((state) => ({
        canvasObjects: state.canvasObjects.filter(obj => obj.id !== id)
    })),

    clearCanvas: () => set({ canvasObjects: [] }),

    resetConfig: () => set({
        config: DEFAULT_CONFIG,
        selectedTemplate: null,
        canvasObjects: []
    }),

    saveCurrentAsTemplate: (name, description) => {
        const state = get()
        const newTemplate: DesignTemplate = {
            id: `template-${Date.now()}`,
            name,
            description,
            colors: { ...state.config.colors },
            typography: { ...state.config.typography },
            layout: 'modern',
            createdAt: new Date().toISOString()
        }
        set((state) => ({
            savedTemplates: [...state.savedTemplates, newTemplate]
        }))
        return newTemplate
    },

    loadTemplate: (templateId) => {
        const state = get()
        const template = state.savedTemplates.find(t => t.id === templateId)
        if (template) {
            set({
                config: {
                    ...state.config,
                    colors: template.colors,
                    typography: template.typography
                },
                selectedTemplate: templateId
            })
        }
    },

    deleteTemplate: (templateId) => set((state) => ({
        savedTemplates: state.savedTemplates.filter(t => t.id !== templateId),
        selectedTemplate: state.selectedTemplate === templateId ? null : state.selectedTemplate
    }))
}))
