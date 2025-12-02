import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { useEffect, useRef } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Undo,
  Redo,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange?: (content: string) => void
  onAutoSave?: (content: string) => void
  editable?: boolean
  placeholder?: string
  autoSaveDelay?: number
}

export default function RichTextEditor({
  content,
  onChange,
  onAutoSave,
  editable = true,
  placeholder = 'Comece a escrever...',
  autoSaveDelay = 2000
}: RichTextEditorProps) {
  const autoSaveTimerRef = useRef<number | null>(null)
  const lastSavedContentRef = useRef<string>(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          HTMLAttributes: {
            class: 'bullet-list',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'ordered-list',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()

      // Sempre chamar onChange imediatamente
      if (onChange) {
        onChange(html)
      }

      // Auto-save com debouncing
      if (onAutoSave && html !== lastSavedContentRef.current) {
        // Limpar timer anterior
        if (autoSaveTimerRef.current) {
          window.clearTimeout(autoSaveTimerRef.current)
        }

        // Criar novo timer para auto-save
        autoSaveTimerRef.current = window.setTimeout(() => {
          onAutoSave(html)
          lastSavedContentRef.current = html
        }, autoSaveDelay)
      }
    },
  })

  // Cleanup do timer ao desmontar
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (editor && content !== undefined && content !== null) {
      const currentContent = editor.getHTML()
      // Normalizar espaços para comparação
      const normalizedNew = content.replace(/\s+/g, ' ').trim()
      const normalizedCurrent = currentContent.replace(/\s+/g, ' ').trim()

      // Atualizar se o conteúdo for diferente (ignorando espaços em branco)
      if (normalizedNew !== normalizedCurrent && normalizedNew !== '') {
        console.log('RichTextEditor - Atualizando com novo conteúdo')
        console.log('  Atual:', normalizedCurrent.substring(0, 100))
        console.log('  Novo:', normalizedNew.substring(0, 100))
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('URL:', previousUrl)

    // cancelled
    if (url === null) {
      return
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    // update
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="rich-text-editor">
      {editable && (
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
              title="Negrito"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
              title="Itálico"
            >
              <Italic size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
              title="Sublinhado"
            >
              <UnderlineIcon size={18} />
            </button>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
              title="Título 1"
            >
              <Heading1 size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
              title="Título 2"
            >
              <Heading2 size={18} />
            </button>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
              title="Alinhar à Esquerda"
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
              title="Centralizar"
            >
              <AlignCenter size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
              title="Alinhar à Direita"
            >
              <AlignRight size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
              title="Justificar"
            >
              <AlignJustify size={18} />
            </button>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
              title="Lista com marcadores"
            >
              <List size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
              title="Lista numerada"
            >
              <ListOrdered size={18} />
            </button>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <button
              onClick={setLink}
              className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
              title="Inserir Link"
            >
              <LinkIcon size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`toolbar-btn ${editor.isActive('codeBlock') ? 'active' : ''}`}
              title="Bloco de código"
            >
              <Code size={18} />
            </button>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Desfazer"
            >
              <Undo size={18} />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Refazer"
            >
              <Redo size={18} />
            </button>
          </div>
        </div>
      )}
      <div className="editor-content-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
