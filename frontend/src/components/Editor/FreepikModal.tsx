import { useState } from 'react'
import { X, Loader2, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import './FreepikModal.css'

interface FreepikImage {
    id: string
    preview: string
    url: string
    prompt: string
    status: string
}

interface FreepikModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectImage: (url: string, alt: string) => void
}

export default function FreepikModal({ isOpen, onClose, onSelectImage }: FreepikModalProps) {
    const [prompt, setPrompt] = useState('')
    const [images, setImages] = useState<FreepikImage[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [generating, setGenerating] = useState<string[]>([])

    const MAX_POLL_ATTEMPTS = 12
    const INITIAL_POLL_DELAY = 8000
    const MAX_POLL_DELAY = 20000

    const handleGenerate = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!prompt.trim()) return

        setLoading(true)
        setSearched(true)

        try {
            const response = await fetch('http://localhost:8000/api/images/freepik', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    model: 'fluid',
                    aspect_ratio: 'square_1_1',
                    resolution: '1k',
                    engine: 'automatic',
                    filter_nsfw: true,
                    creative_detailing: 20
                })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Erro ao gerar imagem')
            }

            const data = await response.json()

            if (data.task_id) {
                setGenerating(prev => [...prev, data.task_id])

                const checkStatus = async (attempt: number = 1) => {
                    try {
                        const delay = Math.min(
                            INITIAL_POLL_DELAY * Math.pow(1.5, attempt - 1),
                            MAX_POLL_DELAY
                        )

                        console.log(`Checking status (attempt ${attempt}/${MAX_POLL_ATTEMPTS})...`)

                        const statusResponse = await fetch(`http://localhost:8000/api/images/freepik/${data.task_id}`)

                        if (!statusResponse.ok) {
                            console.error('Status check failed:', statusResponse.status)
                            setGenerating(prev => prev.filter(id => id !== data.task_id))
                            toast.dismiss('freepik-gen')
                            toast.error('Erro ao verificar status da geração')
                            return
                        }

                        const statusData = await statusResponse.json()
                        const status = statusData.status.toLowerCase()
                        const imagesList = statusData.images || []

                        console.log(`Status: ${status}, Images: ${imagesList.length}`)

                        if (status === 'completed' && imagesList.length > 0) {
                            setGenerating(prev => prev.filter(id => id !== data.task_id))
                            toast.dismiss('freepik-gen')

                            // Images array contains URLs directly (strings), not objects
                            const imageUrl = imagesList[0]

                            // Auto-insert image
                            onSelectImage(imageUrl, prompt)
                            onClose()

                            toast.success('Imagem gerada e inserida com sucesso!')
                        } else if (status === 'failed') {
                            setGenerating(prev => prev.filter(id => id !== data.task_id))
                            toast.dismiss('freepik-gen')
                            toast.error('Falha ao gerar imagem')
                        } else if (status === 'in_progress' || status === 'created') {
                            if (attempt >= MAX_POLL_ATTEMPTS) {
                                setGenerating(prev => prev.filter(id => id !== data.task_id))
                                toast.dismiss('freepik-gen')
                                toast.error('Tempo limite excedido. Tente novamente.')
                                return
                            }
                            setTimeout(() => checkStatus(attempt + 1), delay)
                        } else {
                            console.log('Status desconhecido:', status)
                            if (attempt >= MAX_POLL_ATTEMPTS) {
                                setGenerating(prev => prev.filter(id => id !== data.task_id))
                                toast.dismiss('freepik-gen')
                                toast.error('Tempo limite excedido.')
                                return
                            }
                            setTimeout(() => checkStatus(attempt + 1), delay)
                        }
                    } catch (error) {
                        console.error('Erro ao verificar status:', error)
                        setGenerating(prev => prev.filter(id => id !== data.task_id))
                        toast.dismiss('freepik-gen')
                        toast.error('Erro na comunicação com o servidor')
                    }
                }

                setTimeout(() => checkStatus(1), INITIAL_POLL_DELAY)
                toast.loading('Gerando imagem...', { id: 'freepik-gen' })
            }
        } catch (error) {
            console.error('Erro na geração:', error)
            toast.error('Erro ao gerar imagem. Verifique a API Key.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="freepik-modal-overlay" onClick={onClose}>
            <div className="freepik-modal" onClick={e => e.stopPropagation()}>
                <div className="freepik-header">
                    <div className="header-title">
                        <Sparkles className="freepik-icon" />
                        <h3>Gerar Imagens com Freepik IA</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="freepik-search">
                    <form onSubmit={handleGenerate} className="search-form">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Descreva a imagem que deseja gerar (ex: um gato astronauta no espaço)"
                            autoFocus
                        />
                        <button type="submit" disabled={loading || !prompt.trim()}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            Gerar
                        </button>
                    </form>
                </div>

                <div className="freepik-results">
                    {loading && images.length === 0 ? (
                        <div className="loading-state">
                            <Loader2 className="animate-spin" size={32} />
                            <p>Iniciando geração da imagem...</p>
                        </div>
                    ) : images.length > 0 || generating.length > 0 ? (
                        <div className="images-grid">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className="image-card"
                                    onClick={() => {
                                        onSelectImage(img.url, img.prompt)
                                        onClose()
                                    }}
                                >
                                    <img src={img.preview} alt={img.prompt} loading="lazy" />
                                    <div className="image-overlay">
                                        <span>{img.prompt}</span>
                                    </div>
                                </div>
                            ))}
                            {generating.map((taskId) => (
                                <div key={taskId} className="image-card generating">
                                    <div className="generating-placeholder">
                                        <Loader2 className="animate-spin" size={24} />
                                        <span>Gerando...</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searched ? (
                        <div className="empty-state">
                            <p>Nenhuma imagem gerada ainda</p>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Descreva a imagem que deseja criar com IA</p>
                            <span className="powered-by">Powered by Freepik Mystic</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
