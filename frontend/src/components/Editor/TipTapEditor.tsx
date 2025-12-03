import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import FontFamily from '@tiptap/extension-font-family'
import Mathematics from '@tiptap/extension-mathematics'
import Image from '@tiptap/extension-image'

import ResizeImage from 'tiptap-extension-resize-image'
import Columns from '@tiptap-extend/columns'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { useEffect, useState, useRef } from 'react'
import SaveStatusIndicator from '../UI/SaveStatusIndicator'
import PixabayModal from './PixabayModal'
import './TipTapEditor.css'
import './TipTapExtensions.css'
import './MermaidStyles.css'

import { FolderOpen, Save, FileDown, Table2, LineChart } from 'lucide-react'

interface TipTapEditorProps {
  content?: string
  onContentChange?: (content: string) => void
  onAutoSave?: (content: string) => void
  onSave?: () => void
  onOpen?: () => void
  onExport?: (format?: string) => void
  placeholder?: string
  editable?: boolean
  autoSaveDelay?: number
}

export default function TipTapEditor({
  content = '',
  onContentChange,
  onAutoSave,
  onSave,
  onOpen,
  onExport,
  placeholder = 'Comece a escrever seu livro...',
  editable = true,
  autoSaveDelay = 2000
}: TipTapEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [isPixabayModalOpen, setIsPixabayModalOpen] = useState(false)
  const [showMermaidDropdown, setShowMermaidDropdown] = useState(false)
  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimerRef = useRef<number | null>(null)
  const lastSavedContentRef = useRef<string>(content)

  // Handle local image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        editor?.chain().focus().setImage({ src: imageUrl }).run()
      }
      reader.readAsDataURL(file)
    }
  }

  // Mermaid chart templates
  const mermaidTemplates = {
    flowchart: `graph TD
    A[Início] --> B{Decisão?}
    B -->|Sim| C[Resultado 1]
    B -->|Não| D[Resultado 2]
    C --> E[Fim]
    D --> E`,
    sequence: `sequenceDiagram
    participant A as Usuário
    participant B as Sistema
    A->>B: Requisição
    B->>A: Resposta`,
    gantt: `gantt
    title Cronograma do Projeto
    dateFormat YYYY-MM-DD
    section Fase 1
    Tarefa 1: 2024-01-01, 30d
    Tarefa 2: 2024-02-01, 20d`,
    pie: `pie title Distribuição
    "Categoria A" : 45
    "Categoria B" : 30
    "Categoria C" : 25`,
    class: `classDiagram
    class Animal {
      +String nome
      +int idade
      +fazerSom()
    }
    class Cachorro {
      +latir()
    }
    Animal <|-- Cachorro`,
    state: `stateDiagram-v2
    [*] --> Inativo
    Inativo --> Ativo: iniciar
    Ativo --> Inativo: parar
    Ativo --> [*]`,
  }

  const insertMermaidChart = (type: keyof typeof mermaidTemplates) => {
    const template = mermaidTemplates[type]
    editor?.chain().focus().insertContent(`\n\`\`\`mermaid\n${template}\n\`\`\`\n`).run()
    setShowMermaidDropdown(false)
  }

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
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      CharacterCount,
      Mathematics,
      Image,
      ResizeImage,
      Columns,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
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
        {/* File Operations */}
        <div className="menu-group">
          {onOpen && (
            <button
              onClick={onOpen}
              className="menu-btn"
              title="Abrir arquivo"
            >
              <FolderOpen size={16} />
            </button>
          )}
          {onSave && (
            <button
              onClick={onSave}
              className="menu-btn"
              title="Salvar arquivo"
            >
              <Save size={16} />
            </button>
          )}
          {onExport && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="menu-btn"
                title="Exportar arquivo"
              >
                <FileDown size={16} />
              </button>
              {showExportDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  minWidth: '160px',
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => { onExport('pdf'); setShowExportDropdown(false) }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📄 PDF
                  </button>
                  <button
                    onClick={() => { onExport('rtf'); setShowExportDropdown(false) }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📝 Rich Text (RTF)
                  </button>
                  <button
                    onClick={() => { onExport('docx'); setShowExportDropdown(false) }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📘 Word (DOCX)
                  </button>
                  <button
                    onClick={() => { onExport('odt'); setShowExportDropdown(false) }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📗 LibreOffice (ODT)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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

        {/* Text Alignment */}
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`menu-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
            title="Alinhar à esquerda"
          >
            ⬅
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`menu-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
            title="Centralizar"
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`menu-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
            title="Alinhar à direita"
          >
            ➡
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`menu-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
            title="Justificar"
          >
            ≡
          </button>
        </div>

        <div className="menu-group">
          <label className="menu-label" title="Cor do texto">
            Cor:
            <input
              type="color"
              onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
              className="color-picker"
            />
          </label>
          <label className="menu-label" title="Cor de fundo">
            Fundo:
            <input
              type="color"
              onInput={(e) => editor.chain().focus().toggleHighlight({ color: (e.target as HTMLInputElement).value }).run()}
              className="color-picker"
            />
          </label>
        </div>

        <div className="menu-group">
          <select
            onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
            value={editor.getAttributes('textStyle').fontFamily || ''}
            className="font-select"
            title="Família de fonte"
          >
            <option value="">Fonte padrão</option>
            <option value="Inter">Inter</option>
            <option value="Arial">Arial</option>
            <option value="Courier New">Courier New</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Verdana">Verdana</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
          </select>
        </div>

        <div className="menu-group">
          <button
            onClick={() => {
              const latex = prompt('Digite a fórmula LaTeX (ex: E = mc^2):')
              if (latex) {
                editor.chain().focus().insertContent(`<span class="math-inline">${latex}</span>`).run()
              }
            }}
            className="menu-btn"
            title="Inserir fórmula matemática"
          >
            ∑
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMermaidDropdown(!showMermaidDropdown)}
              className="menu-btn"
              title="Inserir diagrama/gráfico"
            >
              <LineChart size={16} />
            </button>
            {showMermaidDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1000,
                minWidth: '200px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => insertMermaidChart('flowchart')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  📊 Fluxograma
                </button>
                <button
                  onClick={() => insertMermaidChart('sequence')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🔄 Diagrama de Sequência
                </button>
                <button
                  onClick={() => insertMermaidChart('gantt')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  📅 Gráfico de Gantt
                </button>
                <button
                  onClick={() => insertMermaidChart('pie')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🥧 Gráfico de Pizza
                </button>
                <button
                  onClick={() => insertMermaidChart('class')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🏛️ Diagrama de Classes
                </button>
                <button
                  onClick={() => insertMermaidChart('state')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  🔀 Diagrama de Estados
                </button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="menu-btn"
            title="Upload imagem do dispositivo"
          >
            📁
          </button>
          <button
            onClick={() => setIsPixabayModalOpen(true)}
            className="menu-btn"
            title="Inserir imagem do Pixabay"
          >
            🖼️
          </button>
        </div>

        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().setColumns(2).run()}
            className="menu-btn"
            title="2 Colunas"
          >
            ❚❚
          </button>
          <button
            onClick={() => editor.chain().focus().setColumns(3).run()}
            className="menu-btn"
            title="3 Colunas"
          >
            ❚❚❚
          </button>
          <button
            onClick={() => editor.chain().focus().unsetColumns().run()}
            className="menu-btn"
            title="Remover Colunas"
          >
            ⬛
          </button>
        </div>

        {/* Table Controls */}
        <div className="menu-group">
          <button
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="menu-btn"
            title="Inserir tabela"
          >
            <Table2 size={16} />
          </button>
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            className="menu-btn"
            title="Adicionar coluna"
          >
            ➕
          </button>
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className="menu-btn"
            title="Remover tabela"
          >
            🗑️
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
            <strong>Caracteres:</strong> {editor.storage.characterCount?.characters() || characterCount}
          </span>
          <span className="stat">
            <strong>Limite:</strong> {editor.storage.characterCount?.words() || 'Ilimitado'}
          </span>
        </div>
        {editable && onAutoSave && (
          <div className="stats-right">
            <SaveStatusIndicator />
          </div>
        )}
      </div>
      <EditorContent editor={editor} className="editor-content" />

      <PixabayModal
        isOpen={isPixabayModalOpen}
        onClose={() => setIsPixabayModalOpen(false)}
        onSelectImage={(url, alt) => {
          editor?.chain().focus().setImage({ src: url, alt }).run()
        }}
      />
    </div>
  )
}
