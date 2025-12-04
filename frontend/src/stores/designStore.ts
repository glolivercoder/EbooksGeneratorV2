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

interface DesignState {
    config: DesignConfig
    selectedTemplate: string | null
    canvasObjects: any[]

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

export const useDesignStore = create<DesignState>((set) => ({
    config: DEFAULT_CONFIG,
    selectedTemplate: null,
    canvasObjects: [],

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
    })
}))
