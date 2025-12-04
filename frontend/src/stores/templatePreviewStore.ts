import { create } from 'zustand'
import { DesignTemplate } from './designStore'

export interface TemplatePreviewState {
    // Content
    originalHTML: string
    originalText: string
    styledHTML: string

    // Theme
    currentTheme: DesignTemplate | null

    // Preview settings
    previewMode: 'desktop' | 'tablet' | 'mobile'
    zoom: number

    // Status
    isGenerating: boolean
    hasContent: boolean

    // Actions
    setOriginalContent: (html: string, text: string) => void
    setStyledHTML: (html: string) => void
    setCurrentTheme: (theme: DesignTemplate) => void
    setPreviewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void
    setZoom: (zoom: number) => void
    setIsGenerating: (isGenerating: boolean) => void
    clearContent: () => void
    reset: () => void
}

export const useTemplatePreviewStore = create<TemplatePreviewState>((set) => ({
    // Initial state
    originalHTML: '',
    originalText: '',
    styledHTML: '',
    currentTheme: null,
    previewMode: 'desktop',
    zoom: 1,
    isGenerating: false,
    hasContent: false,

    // Actions
    setOriginalContent: (html, text) => set({
        originalHTML: html,
        originalText: text,
        hasContent: true
    }),

    setStyledHTML: (html) => set({
        styledHTML: html
    }),

    setCurrentTheme: (theme) => set({
        currentTheme: theme
    }),

    setPreviewMode: (mode) => set({
        previewMode: mode
    }),

    setZoom: (zoom) => set({
        zoom: Math.max(0.5, Math.min(2, zoom))
    }),

    setIsGenerating: (isGenerating) => set({
        isGenerating
    }),

    clearContent: () => set({
        originalHTML: '',
        originalText: '',
        styledHTML: '',
        hasContent: false
    }),

    reset: () => set({
        originalHTML: '',
        originalText: '',
        styledHTML: '',
        currentTheme: null,
        previewMode: 'desktop',
        zoom: 1,
        isGenerating: false,
        hasContent: false
    })
}))
