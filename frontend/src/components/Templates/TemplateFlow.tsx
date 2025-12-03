import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    Panel
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useTemplateStore } from '../../stores/templateStore'
import { Sparkles, Download, Upload, Trash2, CheckCircle } from 'lucide-react'
import './TemplateFlow.css'

// Import custom nodes (will create these next)
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
    const {
        nodes: storeNodes,
        edges: storeEdges,
        setNodes: setStoreNodes,
        setEdges: setStoreEdges,
        applyToEditor,
        clearTemplate
    } = useTemplateStore()

    const [nodes, setNodes, onNodesChange] = useNodesState(storeNodes)
    const [edges, setEdges, onEdgesChange] = useEdgesState(storeEdges)

    // Sync local state with store
    useEffect(() => {
        setStoreNodes(nodes)
    }, [nodes, setStoreNodes])

    useEffect(() => {
        setStoreEdges(edges)
    }, [edges, setStoreEdges])

    const onConnect = useCallback((params: any) => {
        setEdges((eds) => addEdge(params, eds))
    }, [setEdges])

    const handleApplyToEditor = () => {
        applyToEditor()
        // Trigger toast notification
        const event = new CustomEvent('showToast', {
            detail: { message: 'Template aplicado ao Editor!', type: 'success' }
        })
        window.dispatchEvent(event)
    }

    const handleClear = () => {
        if (confirm('Deseja limpar o canvas? Esta ação não pode ser desfeita.')) {
            clearTemplate()
            setNodes([])
            setEdges([])
        }
    }

    const addPageNode = () => {
        const newNode = {
            id: `page-${Date.now()}`,
            type: 'page',
            position: { x: 250, y: nodes.length * 150 },
            data: { label: `Página ${nodes.filter(n => n.type === 'page').length + 1}`, content: '' }
        }
        setNodes((nds) => [...nds, newNode])
    }

    const addChapterNode = () => {
        const newNode = {
            id: `chapter-${Date.now()}`,
            type: 'chapter',
            position: { x: 100, y: nodes.length * 150 },
            data: { title: `Capítulo ${nodes.filter(n => n.type === 'chapter').length + 1}`, content: '' }
        }
        setNodes((nds) => [...nds, newNode])
    }

    return (
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
                    </div>

                    <div className="toolbar-group">
                        <button className="btn-primary" title="Gerar com IA">
                            <Sparkles size={16} /> Gerar com IA
                        </button>
                    </div>
                </Panel>

                <Panel position="top-right" className="template-actions">
                    <button onClick={handleApplyToEditor} className="btn-success" title="Aplicar ao Editor">
                        <CheckCircle size={16} /> Aplicar ao Editor
                    </button>
                    <button onClick={handleClear} className="btn-danger" title="Limpar Canvas">
                        <Trash2 size={16} />
                    </button>
                </Panel>
            </ReactFlow>
        </div>
    )
}
