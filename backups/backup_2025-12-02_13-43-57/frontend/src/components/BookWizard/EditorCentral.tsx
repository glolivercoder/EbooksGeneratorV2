import { useBookStore } from '../../stores/bookStore'
import RichTextEditor from '../RichTextEditor/RichTextEditor'
import '../RichTextEditor/RichTextEditor.css'
import '../BookWizard/BookWizard.css'

interface EditorCentralProps {
  bookId?: string | null
  outline?: any
  content?: string
  onContentChange?: (content: string) => void
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

export default function EditorCentral({ content = '', onContentChange }: EditorCentralProps) {
  const { markSaved, setIsSaving, currentBook, setCurrentBook } = useBookStore()

  // Handler para auto-save
  const handleAutoSave = (html: string) => {
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

  // Detectar se é Markdown e converter
  const isMarkdown = content && (content.includes('##') || content.includes('**'))
  const htmlContent = isMarkdown ? convertMarkdownToHTML(content) : content

  const placeholderContent = `<h1>Bem-vindo ao Editor</h1><p>Use este espaço para visualizar e editar o conteúdo gerado.</p><ul><li>Negrito e itálico</li><li>Listas</li><li>Blocos de código</li></ul>`
  const effectiveContent = htmlContent || placeholderContent

  console.log('EditorCentral - RENDER')
  console.log('  content (raw):', content ? `${content.length} chars` : 'vazio')
  console.log('  isMarkdown:', isMarkdown)
  console.log('  htmlContent:', htmlContent ? `${htmlContent.length} chars` : 'vazio')
  console.log('  effectiveContent:', effectiveContent.substring(0, 100))

  return (
    <div className="editor-central">
      <div className="editor-header">
        <h2>Editor de Conteúdo</h2>
        {content && <span className="content-badge">✓ Conteúdo gerado</span>}
      </div>
      <div className="editor-body">
        <RichTextEditor
          content={effectiveContent}
          editable={true}
          onChange={(html: string) => {
            console.log('EditorCentral - onChange chamado')
            onContentChange?.(html)
          }}
          onAutoSave={handleAutoSave}
        />
      </div>
    </div>
  )
}
