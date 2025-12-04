import { useState } from 'react'
import { FileText, Globe, FileType, Download, X } from 'lucide-react'
import { exportTemplate } from '../../services/exportService'
import toast from 'react-hot-toast'
import './ExportPanel.css'

interface ExportPanelProps {
    styledHTML: string
    onClose: () => void
}

export default function ExportPanel({ styledHTML, onClose }: ExportPanelProps) {
    const [filename, setFilename] = useState('documento')
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async (format: 'pdf' | 'html' | 'word' | 'odt') => {
        if (!styledHTML) {
            toast.error('Nenhum conteúdo para exportar')
            return
        }

        setIsExporting(true)

        try {
            await exportTemplate(styledHTML, format, {
                filename,
                pageSize: 'A4',
                orientation: 'portrait'
            })

            toast.success(`Exportado como ${format.toUpperCase()} com sucesso!`)
            onClose()
        } catch (error) {
            console.error('Erro ao exportar:', error)
            toast.error(`Erro ao exportar como ${format.toUpperCase()}`)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="export-panel-overlay" onClick={onClose}>
            <div className="export-panel" onClick={(e) => e.stopPropagation()}>
                <div className="export-panel-header">
                    <h3>Exportar Documento</h3>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="export-panel-body">
                    <div className="filename-input">
                        <label>Nome do arquivo:</label>
                        <input
                            type="text"
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            placeholder="documento"
                        />
                    </div>

                    <div className="export-formats">
                        <h4>Escolha o formato:</h4>

                        <button
                            onClick={() => handleExport('pdf')}
                            disabled={isExporting}
                            className="export-format-btn"
                        >
                            <FileText size={24} />
                            <div>
                                <strong>PDF</strong>
                                <span>Documento portátil (recomendado)</span>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('html')}
                            disabled={isExporting}
                            className="export-format-btn"
                        >
                            <Globe size={24} />
                            <div>
                                <strong>HTML/CSS</strong>
                                <span>Para blogs e websites</span>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('word')}
                            disabled={isExporting}
                            className="export-format-btn"
                        >
                            <FileType size={24} />
                            <div>
                                <strong>Word (.docx)</strong>
                                <span>Microsoft Word</span>
                            </div>
                        </button>

                        <button
                            onClick={() => handleExport('odt')}
                            disabled={isExporting}
                            className="export-format-btn"
                        >
                            <Download size={24} />
                            <div>
                                <strong>LibreOffice (.odt)</strong>
                                <span>Open Document Format</span>
                            </div>
                        </button>
                    </div>
                </div>

                {isExporting && (
                    <div className="export-loading">
                        <div className="spinner"></div>
                        <span>Exportando...</span>
                    </div>
                )}
            </div>
        </div>
    )
}
