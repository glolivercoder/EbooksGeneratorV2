import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import mermaid from 'mermaid'
import { Loader2, AlertCircle, Code2, Eye } from 'lucide-react'

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
})

interface MermaidComponentProps {
    node: {
        attrs: {
            src: string
        }
        textContent: string
    }
    updateAttributes: (attrs: any) => void
    extension: any
    getPos: () => number
}

export default function MermaidComponent(props: any) {
    const [svg, setSvg] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [isRendering, setIsRendering] = useState(false)
    const contentRef = useRef<string>('')

    // Get content from node
    const content = props.node.textContent

    const renderDiagram = useCallback(async (code: string) => {
        if (!code.trim()) return

        setIsRendering(true)
        setError(null)

        try {
            // Generate a unique ID for the diagram
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

            // Render the diagram
            const { svg } = await mermaid.render(id, code)
            setSvg(svg)
        } catch (err: any) {
            console.error('Mermaid rendering error:', err)
            setError(err.message || 'Erro ao renderizar diagrama')
            // Keep the old SVG if possible, or clear it?
            // setSvg('') 
        } finally {
            setIsRendering(false)
        }
    }, [])

    useEffect(() => {
        // Debounce rendering
        const timer = setTimeout(() => {
            if (content !== contentRef.current) {
                contentRef.current = content
                renderDiagram(content)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [content, renderDiagram])

    // Initial render
    useEffect(() => {
        renderDiagram(content)
    }, [])

    return (
        <NodeViewWrapper className="mermaid-node-view">
            <div className="mermaid-controls">
                <div className="mermaid-label">
                    <span className="mermaid-badge">Mermaid</span>
                </div>
                <div className="mermaid-actions">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="mermaid-btn"
                        title={isEditing ? "Ver Diagrama" : "Editar Código"}
                    >
                        {isEditing ? <Eye size={16} /> : <Code2 size={16} />}
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className={`mermaid-preview ${isEditing ? 'hidden' : ''} ${error ? 'error' : ''}`}>
                {isRendering && !svg && (
                    <div className="mermaid-loading">
                        <Loader2 className="animate-spin" />
                        <span>Renderizando...</span>
                    </div>
                )}

                {error ? (
                    <div className="mermaid-error">
                        <AlertCircle size={24} />
                        <p>Erro no diagrama:</p>
                        <pre>{error}</pre>
                    </div>
                ) : (
                    <div
                        className="mermaid-svg-container"
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                )}
            </div>

            {/* Editor Area - Hidden by default unless editing */}
            <div className={`mermaid-editor ${!isEditing ? 'hidden' : ''}`}>
                <NodeViewContent as="code" className="mermaid-code" />
            </div>
        </NodeViewWrapper>
    )
}
