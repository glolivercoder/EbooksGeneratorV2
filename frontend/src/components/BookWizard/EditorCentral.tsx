import { useBookStore } from '../../stores/bookStore'
import { FolderOpen, Save, FileDown } from 'lucide-react'
import TipTapEditor from '../Editor/TipTapEditor'
import '../RichTextEditor/RichTextEditor.css'
import '../BookWizard/BookWizard.css'
import './EditorCentralToolbar.css'

interface EditorCentralProps {
  bookId?: string | null
  outline?: any
  content?: string
  onContentChange?: (content: string) => void
  onOpenSavedFiles?: () => void
}

/**
 * Converte Markdown simples para HTML
 * Necessário porque ChapterScopeEnhanced gera Markdown
 */
function convertMarkdownToHTML(md: string): string {
  if (!md || md.trim() === '') return ''

  try {
    let html = md

    // Substituir ## por <h2> (linha por linha para evitar erros)
    const lines = html.split('\n')
    const htmlLines = lines.map(line => {
      const trimmed = line.trim()

      // Headings
      if (trimmed.startsWith('### ')) {
        return `<h3>${trimmed.substring(4)}</h3>`
      } else if (trimmed.startsWith('## ')) {
        return `<h2>${trimmed.substring(3)}</h2>`
      } else if (trimmed.startsWith('# ')) {
        return `<h1>${trimmed.substring(2)}</h1>`
      }

      // Listas
      else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        return `<li>${trimmed.substring(2)}</li>`
      }

      // Linha vazia
      else if (trimmed === '') {
        return '<br>'
      }

      // Parágrafo normal
      else {
        return `<p>${line}</p>`
      }
    })

    html = htmlLines.join('\n')

    // Agrupar <li> em <ul>
    html = html.replace(/(<li>.*?<\/li>\n?)+/g, match => `<ul>${match}</ul>`)

    // Bold e italic
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

    console.log('✓ Markdown convertido para HTML')
    return html

  } catch (error) {
    console.error('❌ Erro ao converter Markdown:', error)
    // Fallback: retornar texto com quebras
    return `<p>${md.replace(/\n/g, '<br>')}</p>`
  }
}

export default function EditorCentral({ content = '', onContentChange, onOpenSavedFiles }: EditorCentralProps) {
  const { markSaved, setIsSaving, currentBook, setCurrentBook } = useBookStore()

  // Handler para auto-save
  const handleAutoSave = (html: string) => {
    // Ignorar se estiver vazio
    if (!html || html === '<p></p>' || html === '<p><br></p>') {
      console.log('EditorCentral - Ignorando auto-save de conteúdo vazio')
      return
    }

    console.log('EditorCentral - Auto-salvando')
    setIsSaving(true)

    // Chamar onChange
    if (onContentChange) {
      onContentChange(html)
    }

    // Salvar no currentBook
    if (currentBook) {
      const updated = {
        ...currentBook,
        last_modified: new Date().toISOString(),
        last_saved: new Date().toISOString()
      }
      setCurrentBook(updated)
    }

    // Marcar como salvo
    setTimeout(() => {
      markSaved()
      console.log('✓ Conteúdo auto-salvo')
    }, 300)
  }

  const handleOpenFiles = () => {
    if (onOpenSavedFiles) {
      onOpenSavedFiles()
    } else {
      alert('Funcionalidade: Abrir modal de arquivos salvos')
    }
  }

  const handleSaveToDisk = () => {
    if (!htmlContent) {
      alert('Nenhum conteúdo para salvar')
      return
    }

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${currentBook?.title || 'documento'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    console.log('✓ Arquivo HTML salvo no dispositivo')
  }

  const handleExportPDF = (format: string = '1') => {
    if (!htmlContent) {
      alert('Nenhum conteúdo para exportar')
      return
    }

    // Format is now passed directly, no prompt needed unless undefined
    // But we expect the dropdown to pass 'pdf', 'rtf', 'docx', 'odt' or '1', '2', '3', '4'

    if (!format) return

    const fileName = currentBook?.title || 'documento'

    switch (format) {
      case 'pdf':
      case '1':
        // PDF export
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`<html><head><title>${fileName}</title></head><body>`)
          printWindow.document.write(htmlContent)
          printWindow.document.write('</body></html>')
          printWindow.document.close()
          printWindow.print()
        }
        break
      case 'rtf':
      case '2':
        // RTF export (simplified HTML to RTF conversion)
        const rtfContent = `{\\rtf1\\ansi\\deff0 ${htmlContent.replace(/<[^>]*>/g, '')}}`
        const rtfBlob = new Blob([rtfContent], { type: 'application/rtf' })
        const rtfUrl = URL.createObjectURL(rtfBlob)
        const rtfLink = document.createElement('a')
        rtfLink.href = rtfUrl
        rtfLink.download = `${fileName}.rtf`
        rtfLink.click()
        URL.revokeObjectURL(rtfUrl)
        break
      case 'docx':
      case '3':
      case 'odt':
      case '4':
        alert('Exportação DOCX/ODT: Use "Salvar como HTML" e abra no Word/LibreOffice para converter')
        handleSaveToDisk()
        break
      default:
        alert('Formato inválido')
    }
  }

  // Detectar se é Markdown e converter
  const isMarkdown = content && (content.includes('##') || content.includes('**'))
  const htmlContent = isMarkdown ? convertMarkdownToHTML(content) : content

  console.log('EditorCentral - RENDER')
  console.log('  content (raw):', content ? `${content.length} chars` : 'vazio')
  console.log('  isMarkdown:', isMarkdown)
  console.log('  htmlContent:', htmlContent ? `${htmlContent.length} chars` : 'vazio')

  // Se não há conteúdo, mostrar mensagem vazia
  // if (!htmlContent) {
  //   return (
  //     <div className="editor-central">
  //       <div className="editor-header">
  //         <h2>Editor de Conteúdo</h2>
  //       </div>
  //       <div className="editor-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
  //         <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
  //           <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Nenhum conteúdo gerado ainda</p>
  //           <p style={{ fontSize: '0.9rem' }}>Selecione um capítulo na sidebar e gere conteúdo para visualizá-lo aqui</p>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="editor-central">
      {/* Header minimalista integrado */}
      <div className="editor-header-compact" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>Editor de Conteúdo</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>{currentBook?.title || 'Sem título'}</span>
        </div>
        <div style={{ fontSize: '0.8rem' }}>
          {content ? `${content.length} caracteres` : 'Vazio'}
        </div>
      </div>
      <div className="editor-body">
        <TipTapEditor
          content={htmlContent}
          editable={true}
          onContentChange={(html: string) => {
            // Ignorar se estiver vazio
            const isEmpty = html === '<p></p>' || html === '' || html === '<p><br></p>'

            if (isEmpty) {
              console.log('EditorCentral - Ignorando onChange (vazio):', html.substring(0, 50))
              return
            }

            console.log('EditorCentral - onChange chamado com conteúdo válido')
            onContentChange?.(html)
          }}
          onAutoSave={handleAutoSave}
          onOpen={handleOpenFiles}
          onSave={handleSaveToDisk}
          onExport={(format) => handleExportPDF(format)}
        />
      </div>
    </div>
  )
}
