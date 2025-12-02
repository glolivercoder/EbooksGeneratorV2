import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Underline from '@tiptap/extension-underline'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useState, useRef } from 'react'
import SaveStatusIndicator from '../UI/SaveStatusIndicator'
import './TipTapEditor.css'

interface TipTapEditorProps {
  content?: string
  onContentChange?: (content: string) => void
  onAutoSave?: (content: string) => void
  placeholder?: string
  editable?: boolean
  autoSaveDelay?: number
}

export default function TipTapEditor({
  content = '',
  onContentChange,
  onAutoSave,
  placeholder = 'Comece a escrever seu livro...',
  editable = true,
  autoSaveDelay = 2000
}: TipTapEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
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
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const text = editor.getText()

      // Sempre chamar onContentChange imediatamente
      onContentChange?.(html)

      // Atualizar contadores
      setWordCount(text.split(/\s+/).filter(word => word.length > 0).length)
      setCharacterCount(text.length)

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
      // Normalizar espaços para comparação robusta
      const normalizedNew = content.replace(/\s+/g, ' ').trim()
      const normalizedCurrent = currentContent.replace(/\s+/g, ' ').trim()

      if (normalizedNew !== normalizedCurrent && normalizedNew !== '') {
        console.log('TipTapEditor - Sincronizando conteúdo')
        editor.commands.setContent(content)
      }
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
    }
  }, [editable, editor])

  if (!editor) {
    return (
      <div className="tiptap-editor loading">
        <div className="loading-placeholder">Carregando editor...</div>
      </div>
    )
  }

  const MenuBar = () => {
    if (!editable) return null

    return (
      <div className="menu-bar">
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`menu-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
            title="Título 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`menu-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
            title="Título 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`menu-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
            title="Título 3"
          >
            H3
          </button>
        </div>

        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`menu-btn ${editor.isActive('bold') ? 'active' : ''}`}
            title="Negrito"
          >
            <strong>B</strong>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`menu-btn ${editor.isActive('italic') ? 'active' : ''}`}
            title="Itálico"
          >
            <em>I</em>
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`menu-btn ${editor.isActive('underline') ? 'active' : ''}`}
            title="Sublinhado"
          >
            <u>U</u>
          </button>
        </div>

        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`menu-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
            title="Lista com marcadores"
          >
            •
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`menu-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
            title="Lista numerada"
          >
            1.
          </button>
        </div>

        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="menu-btn"
            title="Desfazer"
          >
            ↶
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="menu-btn"
            title="Refazer"
          >
            ↷
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="tiptap-editor">
      <MenuBar />
      <div className="editor-stats">
        <div className="stats-left">
          <span className="stat">
            <strong>Palavras:</strong> {wordCount}
          </span>
          <span className="stat">
            <strong>Caracteres:</strong> {characterCount}
          </span>
        </div>
        {editable && onAutoSave && (
          <div className="stats-right">
            <SaveStatusIndicator />
          </div>
        )}
      </div>
      <EditorContent editor={editor} className="editor-content" />
    </div>
  )
}
