import { useDesignStore } from '../../../stores/designStore'
import { Trash2, Download } from 'lucide-react'
import './LayoutPanel.css'

const PAGE_PRESETS = [
    { name: 'A4', width: 210, height: 297 },
    { name: 'Letter', width: 215.9, height: 279.4 },
    { name: 'A5', width: 148, height: 210 },
    { name: '6x9" (KDP)', width: 152.4, height: 228.6 },
]

const MARGIN_PRESETS = [
    { name: 'Estreitas', top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 },
    { name: 'Normais', top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
    { name: 'Largas', top: 38.1, right: 38.1, bottom: 38.1, left: 38.1 },
]

export default function LayoutPanel() {
    const { config, updatePageSize, updateMargins, savedTemplates, loadTemplate, deleteTemplate, selectedTemplate } = useDesignStore()

    return (
        <div className="panel-section">
            <h3>📑 Templates Salvos</h3>

            {savedTemplates.length === 0 ? (
                <div className="empty-state">
                    <p>Nenhum template salvo ainda.</p>
                    <span>Use "Gerar com IA" para criar seu primeiro template!</span>
                </div>
            ) : (
                <div className="saved-templates-list">
                    {savedTemplates.map(template => (
                        <div
                            key={template.id}
                            className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
                        >
                            <div className="template-preview">
                                <div className="color-dots">
                                    <span style={{ backgroundColor: template.colors.primary }} />
                                    <span style={{ backgroundColor: template.colors.secondary }} />
                                    <span style={{ backgroundColor: template.colors.accent }} />
                                </div>
                            </div>
                            <div className="template-info">
                                <h4>{template.name}</h4>
                                {template.description && (
                                    <p className="template-description">{template.description}</p>
                                )}
                                <span className="template-date">
                                    {new Date(template.createdAt).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <div className="template-actions">
                                <button
                                    onClick={() => loadTemplate(template.id)}
                                    className="btn-load"
                                    title="Carregar Template"
                                >
                                    <Download size={16} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm(`Deletar template "${template.name}"?`)) {
                                            deleteTemplate(template.id)
                                        }
                                    }}
                                    className="btn-delete"
                                    title="Deletar Template"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <hr className="panel-divider" />

            <h3>📐 Layout</h3>

            <div className="layout-section">
                <h4>Tamanho da Página</h4>
                <div className="preset-buttons">
                    {PAGE_PRESETS.map(preset => (
                        <button
                            key={preset.name}
                            className={config.pageSize.width === preset.width ? 'active' : ''}
                            onClick={() => updatePageSize({
                                preset: 'Custom',
                                width: preset.width,
                                height: preset.height
                            })}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>

                <div className="orientation-buttons">
                    <button
                        className={config.pageSize.orientation === 'portrait' ? 'active' : ''}
                        onClick={() => updatePageSize({ orientation: 'portrait' })}
                    >
                        📱 Retrato
                    </button>
                    <button
                        className={config.pageSize.orientation === 'landscape' ? 'active' : ''}
                        onClick={() => updatePageSize({ orientation: 'landscape' })}
                    >
                        🖥️ Paisagem
                    </button>
                </div>
            </div>

            <div className="layout-section">
                <h4>Margens</h4>
                <div className="preset-buttons">
                    {MARGIN_PRESETS.map(preset => (
                        <button
                            key={preset.name}
                            onClick={() => updateMargins({
                                top: preset.top,
                                right: preset.right,
                                bottom: preset.bottom,
                                left: preset.left
                            })}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>

                <div className="margin-inputs">
                    <input
                        type="number"
                        placeholder="Superior"
                        value={config.margins.top}
                        onChange={(e) => updateMargins({ top: parseFloat(e.target.value) })}
                    />
                    <input
                        type="number"
                        placeholder="Direita"
                        value={config.margins.right}
                        onChange={(e) => updateMargins({ right: parseFloat(e.target.value) })}
                    />
                    <input
                        type="number"
                        placeholder="Inferior"
                        value={config.margins.bottom}
                        onChange={(e) => updateMargins({ bottom: parseFloat(e.target.value) })}
                    />
                    <input
                        type="number"
                        placeholder="Esquerda"
                        value={config.margins.left}
                        onChange={(e) => updateMargins({ left: parseFloat(e.target.value) })}
                    />
                </div>
            </div>
        </div>
    )
}
