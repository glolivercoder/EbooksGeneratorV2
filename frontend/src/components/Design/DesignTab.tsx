import { useState } from 'react'
import { Palette, Type, Layout, Image, Layers, Sparkles } from 'lucide-react'
import DesignCanvas from './DesignCanvas'
import DesignToolbar from './DesignToolbar'
import DesignSidebar from './DesignSidebar'
import { analyzeContent, DesignAnalysis } from '../../services/designService'
import { useDesignStore } from '../../stores/designStore'
import './DesignTab.css'

interface DesignTabProps {
    onApplyToEditor?: (html: string) => void
}

export default function DesignTab({ onApplyToEditor }: DesignTabProps) {
    const [activeSidebarTab, setActiveSidebarTab] = useState<'colors' | 'typography' | 'layout' | 'images' | 'layers'>('colors')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null)
    const { updateColors, updateTypography } = useDesignStore()

    const handleExportToEditor = (html: string) => {
        if (onApplyToEditor) {
            onApplyToEditor(html)
        }
    }

    const handleGenerateWithAI = async () => {
        setIsAnalyzing(true)
        try {
            // Simular pegar conteúdo do editor (TODO: integrar com editor real)
            const editorContent = "Livro sobre desenvolvimento web moderno com React, TypeScript e boas práticas de UX/UI design."

            const result = await analyzeContent(editorContent)
            setAnalysis(result)

            // Aplicar sugestões automaticamente
            if (result.color_palette && result.color_palette.length >= 4) {
                updateColors({
                    primary: result.color_palette[0].hex,
                    secondary: result.color_palette[1].hex,
                    accent: result.color_palette[2].hex,
                    background: result.color_palette[3].hex
                })
            }

            if (result.typography) {
                updateTypography({
                    primary: result.typography.heading,
                    secondary: result.typography.subheading,
                    body: result.typography.body
                })
            }

            alert(`✨ Design gerado com IA!\n\nEstilo: ${result.suggested_style}\nTom: ${result.tone}\nMood: ${result.mood}`)
        } catch (error) {
            console.error('Erro ao gerar design:', error)
            alert('Erro ao gerar design com IA. Verifique se o backend está rodando.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="design-tab">
            <div className="design-header">
                <div>
                    <h2>🎨 Design</h2>
                    <p>Crie capas e templates visuais profissionais para seu ebook</p>
                </div>
                <button
                    className="ai-generate-btn"
                    onClick={handleGenerateWithAI}
                    disabled={isAnalyzing}
                >
                    <Sparkles size={18} />
                    {isAnalyzing ? 'Gerando...' : 'Gerar com IA'}
                </button>
            </div>

            <div className="design-layout">
                {/* Sidebar */}
                <aside className="design-sidebar">
                    <div className="sidebar-tabs">
                        <button
                            className={activeSidebarTab === 'colors' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('colors')}
                            title="Cores"
                        >
                            <Palette size={18} />
                        </button>
                        <button
                            className={activeSidebarTab === 'typography' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('typography')}
                            title="Tipografia"
                        >
                            <Type size={18} />
                        </button>
                        <button
                            className={activeSidebarTab === 'layout' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('layout')}
                            title="Layout"
                        >
                            <Layout size={18} />
                        </button>
                        <button
                            className={activeSidebarTab === 'images' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('images')}
                            title="Imagens"
                        >
                            <Image size={18} />
                        </button>
                        <button
                            className={activeSidebarTab === 'layers' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('layers')}
                            title="Camadas"
                        >
                            <Layers size={18} />
                        </button>
                    </div>

                    <DesignSidebar activeTab={activeSidebarTab} />
                </aside>

                {/* Main Canvas Area */}
                <main className="design-main">
                    <DesignToolbar />
                    <DesignCanvas onExport={handleExportToEditor} />
                </main>
            </div>
        </div>
    )
}
