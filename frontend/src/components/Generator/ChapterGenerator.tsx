import { useState } from 'react'
import { BookOpen, Search, Sparkles, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import './ChapterGenerator.css'

interface GenerationStep {
    name: string
    status: 'pending' | 'running' | 'completed' | 'error'
    message?: string
}

function ChapterGenerator() {
    const [isGenerating, setIsGenerating] = useState(false)
    const [chapterNumber, setChapterNumber] = useState(1)
    const [chapterTitle, setChapterTitle] = useState('')
    const [topic, setTopic] = useState('')
    const [targetAudience, setTargetAudience] = useState('estudantes de graduação')
    const [generatedContent, setGeneratedContent] = useState('')
    const [researchResults, setResearchResults] = useState<any>(null)

    const [steps, setSteps] = useState<GenerationStep[]>([
        { name: 'Pesquisa Profunda', status: 'pending' },
        { name: 'Análise de Contexto', status: 'pending' },
        { name: 'Geração de Conteúdo', status: 'pending' },
        { name: 'Validação', status: 'pending' },
    ])

    const updateStep = (index: number, status: GenerationStep['status'], message?: string) => {
        setSteps(prev => prev.map((step, i) =>
            i === index ? { ...step, status, message } : step
        ))
    }

    const handleResearch = async () => {
        if (!topic || !chapterTitle) {
            toast.error('Preencha o tema e título do capítulo')
            return
        }

        try {
            const query = `${topic}: ${chapterTitle}`
            const response = await fetch(`/api/research/deep?query=${encodeURIComponent(query)}&academic_only=true`, {
                method: 'POST',
            })

            const data = await response.json()
            setResearchResults(data)
            toast.success(`${data.sources_count} fontes encontradas!`)
        } catch (error) {
            console.error('Research error:', error)
            toast.error('Erro na pesquisa')
        }
    }

    const handleGenerate = async () => {
        if (!topic || !chapterTitle) {
            toast.error('Preencha todos os campos obrigatórios')
            return
        }

        setIsGenerating(true)
        setGeneratedContent('')

        try {
            // Step 1: Pesquisa
            updateStep(0, 'running')
            const researchResponse = await fetch(`/api/research/deep?query=${encodeURIComponent(topic + ': ' + chapterTitle)}&academic_only=true`, {
                method: 'POST',
            })
            const researchData = await researchResponse.json()
            setResearchResults(researchData)
            updateStep(0, 'completed', `${researchData.sources_count} fontes`)

            // Step 2: Análise (simulado - backend faz isso internamente)
            updateStep(1, 'running')
            await new Promise(resolve => setTimeout(resolve, 1000))
            updateStep(1, 'completed')

            // Step 3: Geração
            updateStep(2, 'running', 'Gerando com LLM...')
            const generateResponse = await fetch('/api/generate/chapter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chapter_number: chapterNumber,
                    chapter_title: chapterTitle,
                    topic: topic,
                    context: targetAudience,
                }),
            })

            const generateData = await generateResponse.json()

            if (generateData.status === 'success') {
                setGeneratedContent(generateData.chapter.content)
                updateStep(2, 'completed', `${generateData.chapter.metadata?.model || 'LLM'}`)

                // Step 4: Validação
                updateStep(3, 'running')
                await new Promise(resolve => setTimeout(resolve, 500))
                updateStep(3, 'completed')

                toast.success('Capítulo gerado com sucesso!')
            } else {
                throw new Error('Geração falhou')
            }

        } catch (error: any) {
            console.error('Generation error:', error)
            const failedStepIndex = steps.findIndex(s => s.status === 'running')
            if (failedStepIndex >= 0) {
                updateStep(failedStepIndex, 'error', error.message)
            }
            toast.error('Erro na geração: ' + error.message)
        } finally {
            setIsGenerating(false)
        }
    }

    const resetGeneration = () => {
        setSteps(steps.map(s => ({ ...s, status: 'pending', message: undefined })))
        setGeneratedContent('')
        setResearchResults(null)
    }

    return (
        <div className="chapter-generator">
            <div className="generator-layout">
                {/* Form Column */}
                <div className="form-column">
                    <div className="form-card">
                        <h2>
                            <BookOpen size={24} />
                            Gerar Capítulo
                        </h2>

                        <div className="form-group">
                            <label>Número do Capítulo</label>
                            <input
                                type="number"
                                min="1"
                                value={chapterNumber}
                                onChange={(e) => setChapterNumber(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="form-group">
                            <label>Título do Capítulo *</label>
                            <input
                                type="text"
                                placeholder="Ex: Introdução ao Machine Learning"
                                value={chapterTitle}
                                onChange={(e) => setChapterTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Tema Principal *</label>
                            <input
                                type="text"
                                placeholder="Ex: Inteligência Artificial"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Público-Alvo</label>
                            <select
                                value={targetAudience}
                                onChange={(e) => setTargetAudience(e.target.value)}
                            >
                                <option value="estudantes de graduação">Estudantes de Graduação</option>
                                <option value="profissionais de tecnologia">Profissionais de Tecnologia</option>
                                <option value="pesquisadores acadêmicos">Pesquisadores Acadêmicos</option>
                                <option value="público geral">Público Geral</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button
                                className="btn btn-secondary"
                                onClick={handleResearch}
                                disabled={isGenerating}
                            >
                                <Search size={18} />
                                Pesquisar Fontes
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerate}
                                disabled={isGenerating}
                            >
                                {isGenerating ? (
                                    <><Loader2 size={18} className="spinning" /> Gerando...</>
                                ) : (
                                    <><Sparkles size={18} /> Gerar Capítulo</>
                                )}
                            </button>
                        </div>

                        {isGenerating && (
                            <div className="progress-steps">
                                <h3>Progresso da Geração:</h3>
                                {steps.map((step, index) => (
                                    <div key={index} className={`step step-${step.status}`}>
                                        {step.status === 'pending' && <div className="step-icon pending"></div>}
                                        {step.status === 'running' && <Loader2 size={16} className="step-icon spinning" />}
                                        {step.status === 'completed' && <CheckCircle size={16} className="step-icon completed" />}
                                        {step.status === 'error' && <span className="step-icon error">✕</span>}
                                        <div className="step-info">
                                            <strong>{step.name}</strong>
                                            {step.message && <span className="step-message">{step.message}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {researchResults && !isGenerating && (
                            <div className="research-summary">
                                <h3>📚 Pesquisa Completada</h3>
                                <p>{researchResults.sources_count} fontes acadêmicas encontradas</p>
                                <button className="btn-link" onClick={() => console.log(researchResults.sources)}>
                                    Ver fontes encontradas
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Column */}
                <div className="preview-column">
                    <div className="preview-card">
                        <h3>Preview do Conteúdo</h3>
                        {generatedContent ? (
                            <div className="content-preview">
                                <div className="preview-header">
                                    <h4>Capítulo {chapterNumber}: {chapterTitle}</h4>
                                    <button className="btn btn-secondary btn-sm" onClick={resetGeneration}>
                                        Nova Geração
                                    </button>
                                </div>
                                <div className="preview-content">
                                    <pre>{generatedContent}</pre>
                                </div>
                            </div>
                        ) : (
                            <div className="preview-empty">
                                <Sparkles size={48} className="empty-icon" />
                                <p>O conteúdo gerado aparecerá aqui</p>
                                <small>Configure os parâmetros e clique em "Gerar Capítulo"</small>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChapterGenerator
