import { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import PromptOptimizer from './PromptOptimizer'
import OutlineEditor from './OutlineEditor'
import GenerationProgress from './GenerationProgress'
import EditorCentral from './EditorCentral'
import LoadOutlineModal from './LoadOutlineModal'
import SavedFilesModal from './SavedFilesModal'
import ChapterScopeEnhanced from './ChapterScopeEnhanced'
import { useBookStore } from '../../stores/bookStore'
import './BookWizard.css'

interface BookWizardProps {
    onSendToEditor?: (content: string) => void
}

export default function BookWizard({ onSendToEditor }: BookWizardProps) {
    const [step, setStep] = useState(1)
    const [outline, setOutline] = useState<any>(null)
    const [bookId, setBookId] = useState<string | null>(null)
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false)
    const [isSavedFilesModalOpen, setIsSavedFilesModalOpen] = useState(false)
    const [selectedChapter, setSelectedChapter] = useState<any>(null)
    const [skipResearch, setSkipResearch] = useState(false)
    const [writingTone, setWritingTone] = useState('didatico')
    const [editorContent, setEditorContent] = useState('')
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isOutlineExpanded, setIsOutlineExpanded] = useState(true)

    const { setCurrentBook, currentBook, isDirty } = useBookStore()

    // Restaurar outline do store ao montar (previne perda ao trocar de aba)
    useEffect(() => {
        if (currentBook && !outline) {
            console.log('BookWizard - Restaurando outline do store:', currentBook)
            setOutline({
                book_title: currentBook.title,
                refined_prompt: currentBook.optimized_prompt,
                total_chapters: currentBook.total_chapters,
                chapters: currentBook.chapters,
                description: currentBook.description
            })
            // Se tinha conteúdo, ir para step 2
            if (currentBook.chapters && currentBook.chapters.length > 0) {
                setStep(2)
            }
        }
    }, [])

    const handlePromptComplete = (_prompt: string, outlineData: any, optimizerUsed: boolean = true, tone: string = 'didatico') => {
        setOutline(outlineData)
        setSkipResearch(!optimizerUsed)
        setWritingTone(tone)

        // Salvar outline no store imediatamente
        const bookData = {
            id: crypto.randomUUID(),
            title: outlineData.book_title || 'Novo Livro',
            description: outlineData.refined_prompt || '',
            optimized_prompt: outlineData.refined_prompt || '',
            total_chapters: outlineData.total_chapters || 0,
            chapters: outlineData.chapters || [],
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString(),
            status: 'in_progress' as const
        }
        setCurrentBook(bookData)
        console.log('Outline salvo no store:', bookData)

        setStep(2)
    }

    const handleLoadOutline = (historyOutline: any) => {
        // Converter formato do store para o formato do app
        const bookData = {
            id: historyOutline.id,
            title: historyOutline.title,
            description: historyOutline.description,
            optimized_prompt: historyOutline.optimized_prompt || historyOutline.refined_prompt,
            total_chapters: historyOutline.total_chapters,
            chapters: historyOutline.chapters,
            created_at: historyOutline.created_at,
            last_modified: new Date().toISOString(),
            status: 'in_progress' as const
        }

        setCurrentBook(bookData)
        setOutline({
            book_title: historyOutline.title,
            description: historyOutline.description,
            refined_prompt: historyOutline.optimized_prompt || historyOutline.description,
            total_chapters: historyOutline.total_chapters,
            chapters: historyOutline.chapters
        })
        setStep(2)
        console.log('Outline carregado:', bookData)
    }

    const handleReset = () => {
        if (isDirty) {
            const confirmed = window.confirm('Você tem alterações não salvas. Deseja descartá-las?')
            if (!confirmed) return
        }

        // Limpar estado local
        setStep(1)
        setOutline(null)
        setBookId(null)
        setEditorContent('')

        // Limpar store
        const { clearCurrentBook } = useBookStore.getState()
        clearCurrentBook()

        console.log('Wizard resetado e store limpo')
    }

    const handleOutlineComplete = async (finalOutline: any) => {
        setOutline(finalOutline)

        // Iniciar geração completa
        try {
            const response = await fetch('http://localhost:8000/api/book/generate-full', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    outline: finalOutline,
                    skip_research: skipResearch,
                    writing_tone: writingTone
                })
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.status === 'started') {
                setBookId(data.book_id)
                setStep(3)
            }
        } catch (error) {
            console.error('Erro ao iniciar geração:', error)
            alert('Erro ao conectar com o backend. Verifique se o servidor está rodando em http://localhost:8000')
        }
    }

    const handleGenerationComplete = (_bookData: any) => {
        // Ir para step 4 (Editor de Conteúdo) após geração
        setStep(4)
    }

    const handleUpdateChapter = (chapterUpdates: any) => {
        if (!selectedChapter || !outline) return

        const updatedChapters = outline.chapters.map((chapter: any) =>
            chapter.number === selectedChapter.number
                ? { ...chapter, ...chapterUpdates }
                : chapter
        )

        setOutline({
            ...outline,
            chapters: updatedChapters
        })

        // Atualizar store SEMPRE (criar se não existir)
        const bookData = currentBook || {
            id: crypto.randomUUID(),
            title: outline.book_title || 'Novo Livro',
            description: outline.refined_prompt || '',
            optimized_prompt: outline.refined_prompt || '',
            total_chapters: outline.total_chapters || 0,
            chapters: updatedChapters,
            created_at: new Date().toISOString(),
            last_modified: new Date().toISOString(),
            status: 'in_progress' as const
        }

        setCurrentBook({
            ...bookData,
            chapters: updatedChapters,
            last_modified: new Date().toISOString()
        })

        console.log('Capítulo atualizado no store:', selectedChapter.number, chapterUpdates)
    }

    const handleChapterSelect = (chapter: any) => {
        setSelectedChapter(chapter)
    }

    return (
        <div className="book-wizard">
            {/* Prompt Optimizer sempre visível no topo */}
            <div className="wizard-section prompt-section">
                <div className="prompt-header">
                    <button
                        className="btn btn-primary"
                        onClick={handleReset}
                        title="Criar um novo outline do zero"
                    >
                        ✨ Criar Novo Outline
                    </button>
                    <div className="header-actions">
                        <button
                            className="load-outline-btn"
                            onClick={() => setIsSavedFilesModalOpen(true)}
                            title="Ver arquivos salvos"
                        >
                            📁 Arquivos Salvos
                        </button>
                        <button
                            className="load-outline-btn"
                            onClick={() => setIsLoadModalOpen(true)}
                            title="Carregar outline salvo"
                        >
                            📚 Carregar Outline
                        </button>
                    </div>
                </div>

                <PromptOptimizer
                    onComplete={handlePromptComplete}
                    initialPrompt={outline?.refined_prompt || ''}
                    isLocked={step > 1}
                    onReset={handleReset}
                    initialIsOpen={step === 1}
                />
            </div>

            {/* Layout Flexível: Conteúdo Principal + Sidebar Direita (Colapsável) */}
            <div className={`wizard-flexible-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

                {/* Centro: OutlineEditor OU Editor */}
                <div className="wizard-main-center expanded-editor">
                    {step === 2 && outline && (
                        <div className="outline-editor-container">
                            <div
                                className="outline-header-toggle"
                                onClick={() => setIsOutlineExpanded(!isOutlineExpanded)}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    background: 'var(--bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    marginBottom: isOutlineExpanded ? '10px' : '0',
                                    cursor: 'pointer',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📚 Escopo do Livro {outline.book_title && `- ${outline.book_title}`}
                                </h3>
                                <button className="btn-icon" style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
                                    {isOutlineExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                            </div>

                            {isOutlineExpanded && (
                                <OutlineEditor
                                    initialOutline={outline}
                                    onBack={() => setStep(1)}
                                    onComplete={handleOutlineComplete}
                                />
                            )}
                        </div>
                    )}

                    {step === 3 && bookId && (
                        <GenerationProgress
                            bookId={bookId}
                            onComplete={handleGenerationComplete}
                        />
                    )}

                    {/* Editor Central sempre visível em step 1 ou quando há outline */}
                    {(step === 1 || outline) && step !== 3 && (
                        <EditorCentral
                            bookId={bookId}
                            outline={outline}
                            content={editorContent}
                            onContentChange={setEditorContent}
                            onOpenSavedFiles={() => setIsSavedFilesModalOpen(true)}
                        />
                    )}
                </div>

                {/* Sidebar Direita: Escopo dos Capítulos */}
                {outline && (
                    <div className="wizard-sidebar-right collapsible-sidebar">
                        <button
                            className="sidebar-toggle-btn"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            title={isSidebarOpen ? "Fechar sidebar" : "Expandir sidebar"}
                        >
                            {isSidebarOpen ? '>' : '<'}
                        </button>

                        <div className={`sidebar-content ${!isSidebarOpen ? 'hidden' : ''}`}>
                            <div className="sidebar-section">
                                <h3>Escopo dos Capítulos</h3>

                                {/* Lista de capítulos para seleção */}
                                <div className="chapters-selector">
                                    {outline?.chapters?.map((chapter: any) => (
                                        <button
                                            key={chapter.number}
                                            className={`chapter-selector-btn ${selectedChapter?.number === chapter.number ? 'active' : ''
                                                }`}
                                            onClick={() => handleChapterSelect(chapter)}
                                        >
                                            Cap. {chapter.number}
                                        </button>
                                    )) || <p style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Nenhum capítulo disponível</p>}
                                </div>

                                {/* Detalhes do capítulo selecionado */}
                                {selectedChapter && (
                                    <ChapterScopeEnhanced
                                        chapterNumber={selectedChapter.number}
                                        chapterTitle={selectedChapter.title}
                                        bookTopic={outline.book_title || 'Meu Livro'}
                                        writingTone={writingTone}
                                        onContentGenerated={(content) => {
                                            console.log('========== AI CONTENT GENERATED ===========')
                                            handleUpdateChapter({ content })
                                            setEditorContent(content)
                                        }}
                                        onSendToEditor={(content) => {
                                            console.log('========== SEND TO EDITOR ===========')
                                            setEditorContent(content)
                                            onSendToEditor?.(content)
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <LoadOutlineModal
                isOpen={isLoadModalOpen}
                onClose={() => setIsLoadModalOpen(false)}
                onLoad={handleLoadOutline}
            />

            <SavedFilesModal
                isOpen={isSavedFilesModalOpen}
                onClose={() => setIsSavedFilesModalOpen(false)}
                onLoad={handleLoadOutline}
            />
        </div>
    )
}
