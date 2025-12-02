import { useState, useEffect } from 'react'
import PromptOptimizer from './PromptOptimizer'
import OutlineEditor from './OutlineEditor'
import GenerationProgress from './GenerationProgress'
import BookEditor from './BookEditor'
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
        setStep(1)
        setOutline(null)
        setBookId(null)
        // Limpar store se confirmado
        if (isDirty) {
            const confirmed = window.confirm('Você tem alterações não salvas. Deseja descartá-las?')
            if (!confirmed) return
        }
        // TODO: Limpar store
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
                    <h3>Criar Novo Outline</h3>
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
                />
            </div>

            {/* Layout de três colunas: sidebar esquerdo, centro (editor), sidebar direito */}
            <div className="wizard-three-columns">
                {/* Sidebar esquerdo: escopo do livro */}
                <div className="wizard-sidebar-left">
                    <div className="sidebar-section">
                        <h3>Escopo do Livro</h3>
                        {outline ? (
                            <div className="book-scope">
                                <h4>{outline.book_title}</h4>
                                <p>{outline.description}</p>
                                <div className="book-meta">
                                    <span>Total de capítulos: {outline.total_chapters}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="placeholder-text">
                                Gere um outline para ver o escopo do livro aqui.
                            </div>
                        )}
                    </div>
                </div>

                {/* Centro: OutlineEditor OU Editor */}
                <div className="wizard-main-center">
                    {step === 2 && outline && (
                        <OutlineEditor
                            initialOutline={outline}
                            onBack={() => setStep(1)}
                            onComplete={handleOutlineComplete}
                        />
                    )}

                    {step === 3 && bookId && (
                        <GenerationProgress
                            bookId={bookId}
                            onComplete={handleGenerationComplete}
                        />
                    )}

                    {step === 4 && bookId && (
                        <BookEditor bookId={bookId} />
                    )}

                    {/* Editor Central sempre visível em step 1 ou quando há outline */}
                    {(step === 1 || outline) && step !== 3 && step !== 4 && (
                        <EditorCentral
                            bookId={bookId}
                            outline={outline}
                            content={editorContent}
                            onContentChange={setEditorContent}
                        />
                    )}
                </div>

                {/* Sidebar direito: escopo dos capítulos (visível após outline) */}
                {outline && (
                    <div className="wizard-sidebar-right">
                        <div className="sidebar-section">
                            <h3>Escopo dos Capítulos</h3>

                            {/* Lista de capítulos para seleção */}
                            <div className="chapters-selector">
                                {outline.chapters.map((chapter: any) => (
                                    <button
                                        key={chapter.number}
                                        className={`chapter-selector-btn ${selectedChapter?.number === chapter.number ? 'active' : ''
                                            }`}
                                        onClick={() => handleChapterSelect(chapter)}
                                    >
                                        Cap. {chapter.number}
                                    </button>
                                ))}
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
                                        console.log('BookWizard - onContentGenerated')
                                        console.log('  Content length:', content.length)
                                        console.log('  First 200 chars:', content.substring(0, 200))
                                        console.log('  Selected chapter:', selectedChapter?.number, selectedChapter?.title)

                                        handleUpdateChapter({ content })
                                        setEditorContent(content)

                                        console.log('  editorContent atualizado!')
                                        console.log('===========================================')
                                    }}
                                    onSendToEditor={(content) => {
                                        console.log('========== SEND TO EDITOR ===========')
                                        console.log('BookWizard - onSendToEditor')
                                        console.log('  Content length:', content.length)
                                        console.log('  First 100 chars:', content.substring(0, 100))

                                        setEditorContent(content)
                                        onSendToEditor?.(content)

                                        console.log('  editorContent setado:', content ? 'SIM' : 'NÃO')
                                        console.log('=====================================')
                                    }}
                                />
                            )}
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
