import { useCallback, useState } from 'react'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    Panel,
    Node,
    Edge
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTemplateStore } from '../../stores/templateStore'
import { Sparkles, Trash2, CheckCircle, LayoutTemplate } from 'lucide-react'
import toast from 'react-hot-toast'
import './TemplateFlow.css'
import TemplateReferencesModal from './TemplateReferencesModal'
import { TemplateReference } from '../../services/designService'

// Import custom nodes
import PageNode from './nodes/PageNode'
import ChapterNode from './nodes/ChapterNode'
import ImageNode from './nodes/ImageNode'
import TextBlockNode from './nodes/TextBlockNode'
import LayoutNode from './nodes/LayoutNode'

const nodeTypes = {
    page: PageNode,
    chapter: ChapterNode,
    image: ImageNode,
    textBlock: TextBlockNode,
    layout: LayoutNode
}

export default function TemplateFlow() {
    const { setNodes: setStoreNodes, setEdges: setStoreEdges } = useTemplateStore()

    // Local state only - no sync with store until applyToEditor
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [isReferencesOpen, setIsReferencesOpen] = useState(false)

    const onConnect = useCallback((params: any) => {
        setEdges((eds) => addEdge(params, eds))
    }, [setEdges])

    const handleApplyToEditor = () => {
        // Sync to store only when applying
        setStoreNodes(nodes)
        setStoreEdges(edges)

        // Convert and apply
        const { applyToEditor } = useTemplateStore.getState()
        applyToEditor()

        toast.success('Template aplicado ao Editor!')
    }

    const handleClear = () => {
        if (confirm('Deseja limpar o canvas? Esta ação não pode ser desfeita.')) {
            setNodes([])
            setEdges([])
        }
    }

    const addPageNode = () => {
        const newNode: Node = {
            id: `page-${Date.now()}`,
            type: 'page',
            position: { x: 250, y: nodes.length * 150 },
            data: { label: `Página ${nodes.filter(n => n.type === 'page').length + 1}`, content: '' }
        }
        setNodes((nds) => [...nds, newNode])
    }

    const addChapterNode = () => {
        const newNode: Node = {
            id: `chapter-${Date.now()}`,
            type: 'chapter',
            position: { x: 100, y: nodes.length * 150 },
            data: { title: `Capítulo ${nodes.filter(n => n.type === 'chapter').length + 1}`, content: '' }
        }
        setNodes((nds) => [...nds, newNode])
    }

    const generateWithAI = async () => {
        setIsGenerating(true)
        toast.loading('Gerando template com IA...', { id: 'ai-gen' })

        try {
            const response = await fetch('http://localhost:8000/api/templates/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'book',
                    pages: 5,
                    theme: 'modern'
                })
            })

            if (!response.ok) throw new Error('Falha na geração')

            const data = await response.json()

            // Apply generated nodes
            if (data.nodes && data.edges) {
                setNodes(data.nodes)
                setEdges(data.edges)
                toast.success('Template gerado com sucesso!', { id: 'ai-gen' })
            }
        } catch (error) {
            console.error('Erro ao gerar template:', error)
            toast.error('Erro ao gerar template. Verifique o backend.', { id: 'ai-gen' })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleSelectReference = (reference: TemplateReference) => {
        toast.success(`Referência "${reference.title}" selecionada!`)
        // Aqui futuramente implementaremos a lógica para carregar o layout da referência
        setIsReferencesOpen(false)
    }

    return (
        <div className="template-flow-wrapper">
            {/* Preview Panel */}
            <div className="template-preview-panel">
                <h3>📋 Preview</h3>
                <div className="preview-content">
                    {nodes.length === 0 ? (
                        <div className="preview-empty">
                            <p>Nenhum template ainda</p>
                            <span>Adicione nodes ou gere com IA</span>
                        </div>
                    ) : (
                        <div className="preview-html">
                            {nodes.map((node) => (
                                <div key={node.id} className={`preview-node preview-${node.type}`}>
                                    <strong>{node.data.label || node.data.title || node.type}</strong>
                                    <div>{node.data.content || node.data.text || ''}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleApplyToEditor}
                    className="btn-success btn-full"
                    disabled={nodes.length === 0}
                >
                    <CheckCircle size={16} /> Aplicar ao Editor
                </button>
            </div>

            {/* React Flow Canvas */}
            <div className="template-flow-container">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    connectionMode={ConnectionMode.Loose}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <Background />
                    <Controls />
                    <MiniMap />

                    <Panel position="top-left" className="template-toolbar">
                        <h3>📐 Templates</h3>
                        <div className="toolbar-group">
                            <button onClick={addPageNode} title="Adicionar Página">
                                📄 Página
                            </button>
                            <button onClick={addChapterNode} title="Adicionar Capítulo">
                                📚 Capítulo
                            </button>
                            <button onClick={() => setIsReferencesOpen(true)} title="Ver Referências">
                                <LayoutTemplate size={16} /> Referências
                            </button>
                        </div>

                        <div className="toolbar-group">
                            <button
                                className="btn-primary"
                                title="Gerar com IA"
                                onClick={generateWithAI}
                                disabled={isGenerating}
                            >
                                <Sparkles size={16} /> {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                            </button>
                        </div>
                    </Panel>

                    <Panel position="top-right" className="template-actions">
                        <button onClick={handleClear} className="btn-danger" title="Limpar Canvas">
                            <Trash2 size={16} />
                        </button>
                    </Panel>
                </ReactFlow>
            </div>

            <TemplateReferencesModal
                isOpen={isReferencesOpen}
                onClose={() => setIsReferencesOpen(false)}
                onSelect={handleSelectReference}
            />
        </div>
    )
}
