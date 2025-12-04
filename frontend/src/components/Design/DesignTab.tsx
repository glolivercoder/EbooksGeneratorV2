import { useState } from 'react'
import { Palette, Type, Layout, Image, Layers, Sparkles, Settings } from 'lucide-react'
import DesignCanvas from './DesignCanvas'
import DesignToolbar from './DesignToolbar'
import DesignSidebar from './DesignSidebar'
import ModelPicker from './ModelPicker'
import ImageUploader from './ImageUploader'
import { analyzeContent, DesignAnalysis } from '../../services/designService'
import { useDesignStore } from '../../stores/designStore'
import { ModelInfo } from '../../services/modelService'
import './DesignTab.css'

interface DesignTabProps {
    onApplyToEditor?: (html: string) => void
}

export default function DesignTab({ onApplyToEditor }: DesignTabProps) {
    const [activeSidebarTab, setActiveSidebarTab] = useState<'colors' | 'typography' | 'layout' | 'images' | 'layers'>('colors')
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [selectedModel, setSelectedModel] = useState<ModelInfo | undefined>()
    const [customPrompt, setCustomPrompt] = useState('')
    const [referenceImage, setReferenceImage] = useState<string | null>(null)
    const { updateColors, updateTypography, saveCurrentAsTemplate } = useDesignStore()

    const handleExportToEditor = (html: string) => {
        if (onApplyToEditor) {
            onApplyToEditor(html)
        }
    }

    const handleGenerateWithAI = async () => {
        setIsAnalyzing(true)
        try {
            // Usar prompt customizado ou conteúdo padrão
            const content = customPrompt || "Livro sobre desenvolvimento web moderno com React, TypeScript e boas práticas de UX/UI design."

            const result = await analyzeContent(content)

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

            // Salvar como template
            const templateName = `IA - ${result.suggested_style} (${new Date().toLocaleTimeString()})`
            const savedTemplate = saveCurrentAsTemplate(templateName, `Gerado por IA com base em: ${content.substring(0, 50)}...`)

            alert(`✨ Design gerado e salvo com IA!\n\nTemplate: ${savedTemplate.name}\nModelo: ${selectedModel?.name || 'Padrão'}\nEstilo: ${result.suggested_style}\nTom: ${result.tone}\nMood: ${result.mood}`)
        } catch (error) {
            console.error('Erro ao gerar design:', error)
            alert('Erro ao gerar design com IA. Verifique se o backend está rodando.')
        } finally {
            setIsAnalyzing(false)
        }
    }

    const handleImageSelect = (file: File, dataUrl: string) => {
        setReferenceImage(dataUrl)
        // TODO: Extrair cores da imagem
        console.log('Imagem de referência selecionada:', file.name)
    }

    return (
        <div className="design-tab">
            <div className="design-header">
                <div className="header-title">
                    <h2>🎨 Design</h2>
                    <p>Crie capas e templates visuais profissionais para seu ebook</p>
                </div>
                <div className="header-controls">
                    <ModelPicker
                        onModelSelect={setSelectedModel}
                        selectedModel={selectedModel}
                    />
                    <button
                        className={`advanced-btn ${showAdvanced ? 'active' : ''}`}
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        title="Configurações Avançadas"
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        className="ai-generate-btn"
                        onClick={handleGenerateWithAI}
                        disabled={isAnalyzing}
                    >
                        <Sparkles size={18} />
                        {isAnalyzing ? 'Gerando...' : 'Gerar com IA'}
                    </button>
                </div>
            </div>

            {showAdvanced && (
                <div className="advanced-panel">
                    <div className="advanced-section">
                        <label>Prompt Customizado</label>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder="Descreva o estilo visual desejado (ex: 'Minimalista, tons pastéis, fonte serifada elegante')..."
                            rows={3}
                        />
                    </div>
                    <div className="advanced-section">
                        <label>Imagem de Referência (Cores)</label>
                        <ImageUploader
                            onImageSelect={handleImageSelect}
                            currentImage={referenceImage || undefined}
                            onRemove={() => setReferenceImage(null)}
                        />
                    </div>
                </div>
            )}

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
