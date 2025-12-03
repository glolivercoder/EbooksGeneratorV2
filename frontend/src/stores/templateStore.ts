import { create } from 'zustand'
import { Node, Edge } from '@xyflow/react'

export interface TemplateStore {
    // React Flow state
    nodes: Node[]
    edges: Edge[]

    // Template metadata
    currentTemplate: string | null
    templateName: string
    templateType: 'book' | 'magazine' | 'presentation' | 'custom'

    // Actions
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
    addNode: (node: Node) => void
    updateNode: (id: string, data: any) => void
    deleteNode: (id: string) => void

    setCurrentTemplate: (templateId: string | null) => void
    setTemplateName: (name: string) => void
    setTemplateType: (type: 'book' | 'magazine' | 'presentation' | 'custom') => void

    // Convert template to TipTap HTML
    convertToHTML: () => string

    // Apply template to editor (triggers tab switch)
    applyToEditor: () => void

    // Reset state
    clearTemplate: () => void
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
    // Initial state
    nodes: [],
    edges: [],
    currentTemplate: null,
    templateName: 'Novo Template',
    templateType: 'book',

    // Actions
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    addNode: (node) => set((state) => ({
        nodes: [...state.nodes, node]
    })),

    updateNode: (id, data) => set((state) => ({
        nodes: state.nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
        )
    })),

    deleteNode: (id) => set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== id),
        edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id)
    })),

    setCurrentTemplate: (templateId) => set({ currentTemplate: templateId }),
    setTemplateName: (name) => set({ templateName: name }),
    setTemplateType: (type) => set({ templateType: type }),

    convertToHTML: () => {
        const { nodes } = get()

        // Sort nodes by Y position (top to bottom)
        const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y)

        let html = ''

        for (const node of sortedNodes) {
            switch (node.type) {
                case 'page':
                    html += `<div class="template-page" data-page-id="${node.id}">\n${node.data.content || ''}\n</div>\n`
                    break
                case 'chapter':
                    html += `<h2 id="chapter-${node.id}">${node.data.title || 'Capítulo'}</h2>\n${node.data.content || ''}\n`
                    break
                case 'image':
                    html += `<img src="${node.data.src || ''}" alt="${node.data.alt || 'Imagem'}" style="max-width: ${node.data.width || '100%'};" />\n`
                    break
                case 'textBlock':
                    html += `<p>${node.data.text || ''}</p>\n`
                    break
                case 'layout':
                    html += `<div class="template-layout template-layout-${node.data.columns || 2}col">\n${node.data.content || ''}\n</div>\n`
                    break
                default:
                    break
            }
        }

        return html
    },

    applyToEditor: () => {
        const html = get().convertToHTML()

        // Store HTML in session storage for EditorCentral to pick up
        sessionStorage.setItem('templateHTML', html)
        sessionStorage.setItem('templateApplied', 'true')

        // Trigger custom event for App.tsx to listen
        window.dispatchEvent(new CustomEvent('applyTemplate', { detail: { html } }))
    },

    clearTemplate: () => set({
        nodes: [],
        edges: [],
        currentTemplate: null,
        templateName: 'Novo Template',
        templateType: 'book'
    })
}))
