// ATTENTION: jspdf is a new dependency. Please run `npm install jspdf` in the frontend directory.

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Blockquote from '@tiptap/extension-blockquote'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Color from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import FontFamily from '@tiptap/extension-font-family'
import Mathematics from '@tiptap/extension-mathematics'
import Image from '@tiptap/extension-image'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import mermaid from 'mermaid'

import ResizeImage from 'tiptap-extension-resize-image'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
import { useEffect, useState, useRef } from 'react'
import SaveStatusIndicator from '../UI/SaveStatusIndicator'
import PixabayModal from './PixabayModal'
import FreepikModal from './FreepikModal'
import './TipTapEditor.css'
import './TipTapExtensions.css'
import './MermaidStyles.css'
import { MermaidExtension } from './extensions/MermaidExtension'
import './TipTapTableStyles.css'

import { FolderOpen, Save, FileDown, Table2, LineChart, Quote, Sparkles, Wand2, Palette } from 'lucide-react'
import toast from 'react-hot-toast'
import { useBookStore } from '../../stores/bookStore'
import { GOOGLE_FONTS } from '../../services/designService'
import { Type } from 'lucide-react'
import { useTemplatePreviewStore } from '../../stores/templatePreviewStore'

interface TipTapEditorProps {
  content?: string
  onContentChange?: (content: string) => void
  onAutoSave?: (content: string) => void
  onOpen?: () => void
  onSwitchTab?: (tab: string) => void
  placeholder?: string
  editable?: boolean
  autoSaveDelay?: number
}

export default function TipTapEditor({
  content = '',
  onContentChange,
  onAutoSave,
  onOpen,
  onSwitchTab,
  placeholder = 'Comece a escrever seu livro...',
  editable = true,
  autoSaveDelay = 2000
}: TipTapEditorProps) {
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [isPixabayModalOpen, setIsPixabayModalOpen] = useState(false)
  const [isFreepikModalOpen, setIsFreepikModalOpen] = useState(false)
  const [showMermaidDropdown, setShowMermaidDropdown] = useState(false)

  const [showExportDropdown, setShowExportDropdown] = useState(false)
  const [showFontDropdown, setShowFontDropdown] = useState(false)
  const [showMermaidAIModal, setShowMermaidAIModal] = useState(false)
  const [diagramDescription, setDiagramDescription] = useState('')
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const autoSaveTimerRef = useRef<number | null>(null)
  const lastSavedContentRef = useRef<string>(content)
  const { currentBook } = useBookStore()

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

  // Send content to Design Tab
  const handleSendToDesign = () => {
    if (!editor) return

    const html = editor.getHTML()
    const text = editor.getText()

    // Store content in template preview store
    useTemplatePreviewStore.getState().setOriginalContent(html, text)

    // Switch to design tab
    if (onSwitchTab) {
      onSwitchTab('design')
      toast.success('Conteúdo enviado para Design Tab! 🎨')
    } else {
      toast.success('Conteúdo copiado! Vá para a aba Design para estilizar.')
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
    xychart: `xychart-beta
    title "Vendas por Trimestre"
    x-axis [Q1, Q2, Q3, Q4]
    y-axis "Receita (k)" 0 --> 100
    bar [45, 78, 92, 65]
    line [40, 70, 85, 60]`,
  }

  const insertMermaidChart = (type: keyof typeof mermaidTemplates) => {
    const template = mermaidTemplates[type]
    editor?.chain().focus().insertContent({
      type: 'mermaid',
      content: [
        {
          type: 'text',
          text: template
        }
      ]
    }).run()
    setShowMermaidDropdown(false)
  }

  const editor = useEditor({
    extensions: [

      StarterKit.configure({
        blockquote: false, // Disable built-in blockquote to use the configured one below
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
      Blockquote.configure({
        HTMLAttributes: {
          class: 'blockquote',
        },
      }),
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
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      MermaidExtension,
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

  const generateMermaidWithAI = async () => {
    if (!diagramDescription.trim()) {
      toast.error('Por favor, descreva o diagrama')
      return
    }

    setIsGeneratingDiagram(true)
    toast.loading('Gerando diagrama...', { id: 'diagram-gen' })

    try {
      const response = await fetch('http://localhost:8000/api/diagrams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: diagramDescription,
          diagram_type: 'auto'
        })
      })

      if (!response.ok) throw new Error('Falha na geração')

      const data = await response.json()

      // Remove markdown code block wrapper if present
      const cleanCode = data.mermaid_code.replace(/^```mermaid\n/, '').replace(/\n```$/, '')

      editor?.chain().focus().insertContent({
        type: 'mermaid',
        content: [
          {
            type: 'text',
            text: cleanCode
          }
        ]
      }).run()

      toast.success(`Diagrama gerado! Custo: $${data.cost.toFixed(4)}`, { id: 'diagram-gen' })
      setShowMermaidAIModal(false)
      setDiagramDescription('')

    } catch (error) {
      console.error('Erro ao gerar diagrama:', error)
      toast.error('Erro ao gerar diagrama', { id: 'diagram-gen' })
    } finally {
      setIsGeneratingDiagram(false)
    }
  }

  if (!editor) {
    return (
      <div className="tiptap-editor loading">
        <div className="loading-placeholder">Carregando editor...</div>
      </div>
    )
  }

  const MenuBar = () => {
    if (!editable) return null

    const handleSaveToDisk = () => {
      const htmlContent = editor.getHTML();
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

    const handleExport = async (format: string = 'pdf') => {
      const htmlContent = editor.getHTML();
      if (!htmlContent) {
        alert('Nenhum conteúdo para exportar')
        return
      }

      const fileName = currentBook?.title || 'documento'

      switch (format) {
        case 'pdf':
          if (editorRef.current) {
            const contentElement = editorRef.current.querySelector('.editor-content') as HTMLElement;
            if (!contentElement) {
              toast.error('Erro ao encontrar conteúdo para exportar');
              return;
            }

            toast.loading('Exportando para PDF...', { id: 'pdf-export' });
            try {
              const canvas = await html2canvas(contentElement, {
                useCORS: true,
                allowTaint: true,
                onclone: (doc) => {
                  const mermaidElements = doc.querySelectorAll('.mermaid');
                  const promises = Array.from(mermaidElements).map((el, i) => {
                    const id = `mermaid-temp-render-${i}`;
                    const code = el.querySelector('code')?.innerText || '';
                    if (code) {
                      return mermaid.render(id, code);
                    }
                    return Promise.resolve({ svg: '' });
                  });

                  Promise.all(promises).then(results => {
                    results.forEach((result, i) => {
                      const el = doc.querySelector(`#mermaid-temp-render-${i}`)?.parentElement;
                      if (el) {
                        const svgContainer = doc.createElement('div');
                        svgContainer.innerHTML = result.svg;
                        el.replaceWith(svgContainer);
                      }
                    });
                  });
                }
              });

              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
              });

              const pdfWidth = pdf.internal.pageSize.getWidth();
              const canvasWidth = canvas.width;
              const canvasHeight = canvas.height;
              const ratio = canvasHeight / canvasWidth;
              const pdfHeight = ratio * pdfWidth;

              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              pdf.save(`${fileName}.pdf`);
              toast.success('PDF exportado com sucesso!', { id: 'pdf-export' });
            } catch (error) {
              console.error("Error exporting PDF:", error);
              toast.error('Falha ao exportar PDF.', { id: 'pdf-export' });
            }
          }
          break;
        case 'rtf':
          const rtfContent = `{\rtf1\ansi\deff0 ${htmlContent.replace(/<[^>]*>/g, '')}}`
          const rtfBlob = new Blob([rtfContent], { type: 'application/rtf' })
          const rtfUrl = URL.createObjectURL(rtfBlob)
          const rtfLink = document.createElement('a')
          rtfLink.href = rtfUrl
          rtfLink.download = `${fileName}.rtf`
          rtfLink.click()
          URL.revokeObjectURL(rtfUrl)
          break
        case 'docx':
        case 'odt':
          alert('Exportação DOCX/ODT: Use "Salvar como HTML" e abra no Word/LibreOffice para converter')
          handleSaveToDisk()
          break
        default:
          alert('Formato inválido')
      }
    }

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
          <button
            onClick={handleSaveToDisk}
            className="menu-btn"
            title="Salvar arquivo"
          >
            <Save size={16} />
          </button>
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
                  onClick={() => { handleExport('pdf'); setShowExportDropdown(false) }}
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
                  onClick={() => { handleExport('rtf'); setShowExportDropdown(false) }}
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
                  onClick={() => { handleExport('docx'); setShowExportDropdown(false) }}
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
                  onClick={() => { handleExport('odt'); setShowExportDropdown(false) }}
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
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFontDropdown(!showFontDropdown)}
              className={`menu-btn ${editor.isActive('textStyle') ? 'is-active' : ''}`}
              title="Fonte"
            >
              <Type size={16} />
            </button>
            {showFontDropdown && (
              <div className="font-dropdown" style={{
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
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                <div className="font-category-label">Serif</div>
                {GOOGLE_FONTS.serif.map(font => (
                  <button
                    key={font}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font).run()
                      setShowFontDropdown(false)
                    }}
                    style={{ fontFamily: font }}
                    className={`font-option ${editor.isActive('textStyle', { fontFamily: font }) ? 'active' : ''}`}
                  >
                    {font}
                  </button>
                ))}

                <div className="font-category-label">Sans-Serif</div>
                {GOOGLE_FONTS.sans.map(font => (
                  <button
                    key={font}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font).run()
                      setShowFontDropdown(false)
                    }}
                    style={{ fontFamily: font }}
                    className={`font-option ${editor.isActive('textStyle', { fontFamily: font }) ? 'active' : ''}`}
                  >
                    {font}
                  </button>
                ))}

                <div className="font-category-label">Display</div>
                {GOOGLE_FONTS.display.map(font => (
                  <button
                    key={font}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font).run()
                      setShowFontDropdown(false)
                    }}
                    style={{ fontFamily: font }}
                    className={`font-option ${editor.isActive('textStyle', { fontFamily: font }) ? 'active' : ''}`}
                  >
                    {font}
                  </button>
                ))}

                <div className="font-category-label">Script</div>
                {GOOGLE_FONTS.script.map(font => (
                  <button
                    key={font}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font).run()
                      setShowFontDropdown(false)
                    }}
                    style={{ fontFamily: font }}
                    className={`font-option ${editor.isActive('textStyle', { fontFamily: font }) ? 'active' : ''}`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Send to Design Button */}
          <button
            onClick={handleSendToDesign}
            className="menu-btn"
            title="Enviar para Design Tab"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: '600'
            }}
          >
            <Palette size={16} />
          </button>

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
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`menu-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
            title="Citação"
          >
            <Quote size={16} />
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
          <button
            onClick={() => setIsFreepikModalOpen(true)}
            className="menu-btn"
            title="Gerar imagem com Freepik IA"
          >
            <Wand2 size={16} />
          </button>

          <button
            onClick={() => setShowMermaidAIModal(true)}
            className="menu-btn"
            title="Gerar Diagrama com IA"
          >
            <Sparkles size={16} />
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
    <div className="tiptap-editor" ref={editorRef}>
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

      <FreepikModal
        isOpen={isFreepikModalOpen}
        onClose={() => setIsFreepikModalOpen(false)}
        onSelectImage={(url, alt) => {
          editor?.chain().focus().setImage({ src: url, alt }).run()
        }}
      />

      {/* Mermaid AI Modal */}
      {showMermaidAIModal && (
        <div className="modal-overlay" onClick={() => setShowMermaidAIModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>✨ Gerar Diagrama com IA</h3>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '16px' }}>
              Descreva o diagrama que deseja e a IA irá gerar o código Mermaid automaticamente.
            </p>
            <textarea
              placeholder="Exemplo: 'Fluxo de aprovação de pedidos com 3 níveis: gerente, diretor e CEO'"
              value={diagramDescription}
              onChange={(e) => setDiagramDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              autoFocus
            />
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '16px'
            }}>
              <button
                onClick={() => setShowMermaidAIModal(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={generateMermaidWithAI}
                disabled={isGeneratingDiagram || !diagramDescription.trim()}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: isGeneratingDiagram || !diagramDescription.trim() ? '#ccc' : '#667eea',
                  color: 'white',
                  cursor: isGeneratingDiagram || !diagramDescription.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={14} />
                {isGeneratingDiagram ? 'Gerando...' : 'Gerar Diagrama'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}