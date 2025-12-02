import { Check, Loader2, AlertCircle } from 'lucide-react'
import { useBookStore } from '../../stores/bookStore'
import './SaveStatusIndicator.css'

export default function SaveStatusIndicator() {
    const { getSaveStatus, currentBook } = useBookStore()
    const status = getSaveStatus()

    if (status === 'no-book') return null

    const getStatusIcon = () => {
        switch (status) {
            case 'saving':
                return <Loader2 size={14} className="spinning" />
            case 'saved':
                return <Check size={14} />
            case 'unsaved':
                return <AlertCircle size={14} />
            default:
                return null
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'saving':
                return 'Salvando...'
            case 'saved':
                return 'Salvo'
            case 'unsaved':
                return 'Não salvo'
            default:
                return ''
        }
    }

    const getStatusClass = () => {
        return `save-status save-status-${status}`
    }

    const formatTimestamp = (isoString?: string) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className={getStatusClass()}>
            <span className="status-icon">{getStatusIcon()}</span>
            <span className="status-text">{getStatusText()}</span>
            {status === 'saved' && currentBook?.last_saved && (
                <span className="status-timestamp">
                    às {formatTimestamp(currentBook.last_saved)}
                </span>
            )}
        </div>
    )
}
