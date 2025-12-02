import { useState, useEffect } from 'react'
import { X, Save, Download, Copy, FileText, Book } from 'lucide-react'
import TipTapEditor from './TipTapEditor'
import toast from 'react-hot-toast'
import './EditorPanel.css'

interface EditorPanelProps {
  isOpen: boolean
  onClose: () => void
  initialContent?: string
  bookTitle?: string
  chapterTitle?: string
}

export default function EditorPanel({
  isOpen,
  onClose,
  initialContent = '',
  bookTitle = 'Meu Livro',
  chapterTitle = 'Capítulo'
}: EditorPanelProps) {
  const [content, setContent] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simular salvamento (poderia ser para API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLastSaved(new Date())
      toast.success('Conteúdo salvo com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar conteúdo')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${bookTitle}_${chapterTitle}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Conteúdo exportado!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success('Conteúdo copiado para área de transferência!')
  }

  const getPlainText = () => {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = content
    return tempDiv.textContent || tempDiv.innerText || ''
  }

  const wordCount = getPlainText().split(/\s+/).filter(word => word.length > 0).length
  const characterCount = getPlainText().length

  if (!isOpen) return null

  return (
    <div className="editor-panel-overlay">
      <div className="editor-panel">
        <div className="editor-header">
          <div className="header-info">
            <div className="title-section">
              <Book size={20} />
              <div>
                <h3>{bookTitle}</h3>
                <p className="chapter-info">{chapterTitle}</p>
              </div>
            </div>
            
            <div className="stats-section">
              <span className="stat-badge">
                <FileText size={12} />
                {wordCount} palavras
              </span>
              <span className="stat-badge">
                {characterCount} caracteres
              </span>
              {lastSaved && (
                <span className="last-saved">
                  Salvo há {Math.round((new Date().getTime() - lastSaved.getTime()) / 60000)} min
                </span>
              )}
            </div>
          </div>

          <div className="header-actions">
            <button
              className="action-btn save-btn"
              onClick={handleSave}
              disabled={isSaving}
              title="Salvar"
            >
              {isSaving ? (
                <div className="loading-spinner" />
              ) : (
                <Save size={16} />
              )}
            </button>
            
            <button
              className="action-btn"
              onClick={handleExport}
              title="Exportar"
            >
              <Download size={16} />
            </button>
            
            <button
              className="action-btn"
              onClick={handleCopy}
              title="Copiar"
            >
              <Copy size={16} />
            </button>
            
            <button
              className="action-btn close-btn"
              onClick={onClose}
              title="Fechar"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="editor-content-area">
          <TipTapEditor
            content={content}
            onContentChange={setContent}
            placeholder="Digite o conteúdo do seu livro aqui..."
            editable={true}
          />
        </div>

        <div className="editor-footer">
          <div className="footer-info">
            <span className="auto-save-info">
              Salvamento automático ativado
            </span>
          </div>
          
          <div className="footer-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setContent('')}
            >
              Limpar
            </button>
            
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
