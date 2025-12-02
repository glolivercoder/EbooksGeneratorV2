import { useState, useEffect } from 'react'
import { CheckCircle, Circle, Loader2, PlayCircle, PauseCircle, XCircle } from 'lucide-react'

interface GenerationProgressProps {
    bookId: string
    onComplete: (bookData: any) => void
}

export default function GenerationProgress({ bookId, onComplete }: GenerationProgressProps) {
    const [status, setStatus] = useState<any>(null)
    const [logs, setLogs] = useState<string[]>([])

    useEffect(() => {
        let interval: any

        const checkStatus = async () => {
            try {
                const response = await fetch(`/api/book/status/${bookId}`)
                const data = await response.json()

                setStatus(data)

                // Adicionar log simulado baseado no status
                if (data.status === 'generating') {
                    const currentCh = data.progress.current_chapter
                    const stage = data.progress.current_stage
                    setLogs(prev => {
                        const lastLog = prev[prev.length - 1]
                        const newLog = `[${new Date().toLocaleTimeString()}] Cap. ${currentCh}: ${stage}...`
                        if (lastLog !== newLog) return [...prev, newLog]
                        return prev
                    })
                }

                if (data.status === 'completed') {
                    clearInterval(interval)
                    onComplete(data)
                }
            } catch (error) {
                console.error('Error checking status:', error)
            }
        }

        // Polling a cada 2 segundos
        interval = setInterval(checkStatus, 2000)
        checkStatus() // Check imediato

        return () => clearInterval(interval)
    }, [bookId, onComplete])

    if (!status) return <div className="loading-state"><Loader2 className="spinning" size={40} /></div>

    const chaptersCompleted: number[] = status.progress?.chapters_completed ?? []
    const totalChapters: number =
        status.progress?.total_chapters ?? status.outline?.chapters?.length ?? 0

    const progressPercent = totalChapters > 0
        ? Math.round((chaptersCompleted.length / totalChapters) * 100)
        : 0

    return (
        <div className="wizard-step generation-progress">
            <div className="step-header">
                <h2>⚙️ Gerando seu Ebook...</h2>
                <p>O orquestrador está criando cada capítulo com pesquisa e validação.</p>
            </div>

            <div className="progress-card">
                <div className="progress-header">
                    <span>Progresso Global</span>
                    <strong>{progressPercent}%</strong>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="progress-stats">
                    <span>{chaptersCompleted.length} / {totalChapters} capítulos</span>
                    <span className="status-badge">{status.status}</span>
                </div>
            </div>

            <div className="chapters-status-list">
                {(status.outline?.chapters ?? []).map((chapter: any) => {
                    const isCompleted = chaptersCompleted.includes(chapter.number)
                    const currentChapter = status.progress?.current_chapter
                    const currentStage = status.progress?.current_stage
                    const isCurrent = currentChapter === chapter.number

                    return (
                        <div key={chapter.number} className={`chapter-status-item ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                            <div className="status-icon">
                                {isCompleted ? <CheckCircle className="text-success" size={20} /> :
                                    isCurrent ? <Loader2 className="spinning text-warning" size={20} /> :
                                        <Circle className="text-muted" size={20} />}
                            </div>
                            <div className="chapter-info">
                                <strong>Capítulo {chapter.number}: {chapter.title}</strong>
                                {isCurrent && currentStage && (
                                    <span className="current-action">Processando: {currentStage}...</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="logs-terminal">
                <div className="terminal-header">📋 Logs do Orquestrador</div>
                <div className="terminal-content">
                    {logs.map((log, i) => (
                        <div key={i} className="log-line">{log}</div>
                    ))}
                    {status.status === 'generating' && (
                        <div className="log-line active">_</div>
                    )}
                </div>
            </div>
        </div>
    )
}
