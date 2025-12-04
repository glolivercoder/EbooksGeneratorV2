import { useState, useEffect } from 'react'
import { Monitor, Tablet, Smartphone, ZoomIn, ZoomOut, Download, ArrowLeft } from 'lucide-react'
import { useTemplatePreviewStore } from '../../stores/templatePreviewStore'
import { useDesignStore } from '../../stores/designStore'
import { parseContent } from '../../services/templateParser'
import { applyTemplate } from '../../services/templateGenerator'
import ExportPanel from './ExportPanel'
import toast from 'react-hot-toast'
import './TemplatePreview.css'

interface TemplatePreviewProps {
    onBackToEditor?: () => void
    onExport?: (format: string) => void
}

export default function TemplatePreview({ onBackToEditor }: TemplatePreviewProps) {
    const {
        originalHTML,
        styledHTML,
        currentTheme,
        previewMode,
        zoom,
        hasContent,
        setStyledHTML,
        setCurrentTheme,
        setPreviewMode,
        setZoom,
        setIsGenerating
    } = useTemplatePreviewStore()

    const { savedTemplates, config } = useDesignStore()
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
    const [showExportPanel, setShowExportPanel] = useState(false)

    // Generate styled HTML when content or theme changes
    useEffect(() => {
        if (!originalHTML || !hasContent) return

        console.log('🔄 Regenerating template...')
        console.log('Current theme:', currentTheme?.name || 'Config Atual')
        console.log('Config colors:', config.colors)

        setIsGenerating(true)

        try {
            const parsed = parseContent(originalHTML)

            // IMPORTANTE: Usar currentTheme SE existir, senão usar config atual
            // Isso permite que mudanças na sidebar (config.colors) sejam aplicadas
            const theme = currentTheme || {
                id: 'from-config',
                name: 'Config Atual',
                colors: config.colors,
                typography: config.typography,
                createdAt: new Date().toISOString()
            }

            console.log('✅ Applying theme:', theme.name)
            console.log('Colors:', theme.colors.primary, theme.colors.secondary, theme.colors.accent)

            const styled = applyTemplate(parsed, theme, {
                includeGoogleFonts: true,
                responsive: true,
                darkMode: false
            })

            setStyledHTML(styled)
        } catch (error) {
            console.error('❌ Error generating template:', error)
            toast.error('Erro ao gerar preview')
        } finally {
            setIsGenerating(false)
        }
    }, [originalHTML, currentTheme, hasContent, config, setStyledHTML, setIsGenerating])

    // Reset currentTheme when config colors change (sidebar click)
    useEffect(() => {
        if (currentTheme && currentTheme.id !== 'from-config') {
            console.log('⚡ Config changed, resetting to config-based theme')
            // Create a new theme from current config instead of null
            const configTheme = {
                id: 'from-config',
                name: 'Config Atual',
                colors: config.colors,
                typography: config.typography,
                createdAt: new Date().toISOString()
            }
            setCurrentTheme(configTheme)
        }
    }, [config.colors, currentTheme, config.typography, setCurrentTheme])

    const handleThemeChange = (templateId: string) => {
        const template = savedTemplates.find(t => t.id === templateId)
        if (template) {
            setSelectedTemplateId(templateId)
            setCurrentTheme(template)
            toast.success(`Tema "${template.name}" aplicado!`)
        }
    }

    const handleBackToEditor = () => {
        toast.success('Voltando ao editor...')
        if (onBackToEditor) {
            onBackToEditor()
        }
    }

    const deviceWidths = {
        desktop: '100%',
        tablet: '768px',
        mobile: '375px'
    }

    if (!hasContent) {
        return (
            <div className="template-preview-empty">
                <div className="empty-state">
                    <Monitor size={64} color="#999" />
                    <h3>Nenhum conteúdo para preview</h3>
                    <p>Vá para a aba <strong>Editor</strong> e clique no botão <strong>Enviar para Design</strong></p>
                </div>
            </div>
        )
    }

    return (
        <div className="template-preview-container">
            <div className="preview-controls">
                <div className="control-group">
                    <label>Tema:</label>
                    <select
                        value={selectedTemplateId || currentTheme?.id || ''}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className="theme-selector"
                    >
                        {savedTemplates.length === 0 ? (
                            <option value="">Nenhum template salvo</option>
                        ) : (
                            savedTemplates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))
                        )}
                    </select>
                </div>

                <div className="control-group">
                    <label>Dispositivo:</label>
                    <div className="device-buttons">
                        <button
                            className={previewMode === 'desktop' ? 'active' : ''}
                            onClick={() => setPreviewMode('desktop')}
                            title="Desktop"
                        >
                            <Monitor size={18} />
                        </button>
                        <button
                            className={previewMode === 'tablet' ? 'active' : ''}
                            onClick={() => setPreviewMode('tablet')}
                            title="Tablet"
                        >
                            <Tablet size={18} />
                        </button>
                        <button
                            className={previewMode === 'mobile' ? 'active' : ''}
                            onClick={() => setPreviewMode('mobile')}
                            title="Mobile"
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>
                </div>

                <div className="control-group">
                    <label>Zoom:</label>
                    <div className="zoom-controls">
                        <button onClick={() => setZoom(zoom - 0.1)} title="Diminuir">
                            <ZoomOut size={18} />
                        </button>
                        <span>{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(zoom + 0.1)} title="Aumentar">
                            <ZoomIn size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="preview-area">
                <div
                    className="preview-device-frame"
                    style={{
                        width: deviceWidths[previewMode],
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center'
                    }}
                >
                    <iframe
                        srcDoc={styledHTML}
                        className="preview-iframe"
                        title="Template Preview"
                        sandbox="allow-same-origin"
                    />
                </div>
            </div>

            <div className="preview-actions">
                <button
                    onClick={handleBackToEditor}
                    className="btn-secondary"
                >
                    <ArrowLeft size={18} />
                    Voltar ao Editor
                </button>

                <button
                    onClick={() => setShowExportPanel(true)}
                    className="btn-primary"
                >
                    <Download size={18} />
                    Exportar
                </button>
            </div>

            {showExportPanel && (
                <ExportPanel
                    styledHTML={styledHTML}
                    onClose={() => setShowExportPanel(false)}
                />
            )}
        </div>
    )
}
