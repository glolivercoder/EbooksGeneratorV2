import { useState, useEffect } from 'react'
import { Play, CheckCircle, Clock, Loader2, FileText, BookOpen, Edit3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useBookStore } from '../../stores/bookStore'
import './ChapterScopeEnhanced.css'

interface Topic {
  id: string
  title: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  content?: string
  wordCount?: number
  estimatedTime?: number
}

interface ChapterScopeEnhancedProps {
  chapterNumber: number
  chapterTitle: string
  bookTopic: string
  writingTone: string
  onContentGenerated?: (content: string) => void
  onSendToEditor?: (content: string) => void
}

export default function ChapterScopeEnhanced({
  chapterNumber,
  chapterTitle,
  bookTopic,
  writingTone,
  onContentGenerated,
  onSendToEditor
}: ChapterScopeEnhancedProps) {
  const [topics, setTopics] = useState<Topic[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [chapterContent, setChapterContent] = useState('')
  const { setIsSaving, markSaved, currentBook, updateChapter } = useBookStore()

  // Estrutura padrão de tópicos baseada no tom de escrita
  const getDefaultTopics = () => {
    const baseTopics: Topic[] = [
      {
        id: 'intro',
        title: 'Introdução e Contexto',
        status: 'pending',
        estimatedTime: 3
      },
      {
        id: 'theory',
        title: 'Fundamentação Teórica',
        status: 'pending',
        estimatedTime: 5
      },
      {
        id: 'state',
        title: 'Estado da Arte',
        status: 'pending',
        estimatedTime: 4
      },
      {
        id: 'practice',
        title: 'Aplicações Práticas',
        status: 'pending',
        estimatedTime: 5
      },
      {
        id: 'analysis',
        title: 'Análise Crítica',
        status: 'pending',
        estimatedTime: 3
      },
      {
        id: 'conclusion',
        title: 'Resumo e Próximos Passos',
        status: 'pending',
        estimatedTime: 2
      }
    ]

    // Ajustar títulos baseado no tom de escrita
    if (writingTone === 'descontraido') {
      return baseTopics.map(topic => ({
        ...topic,
        title: topic.title.replace('e Contexto', 'e Contexto')
          .replace('Fundamentação Teórica', 'Conceitos Essenciais')
          .replace('Estado da Arte', 'O Que Há de Novo')
          .replace('Aplicações Práticas', 'Na Prática')
          .replace('Análise Crítica', 'Pontos a Melhorar')
          .replace('Resumo e Próximos Passos', 'Resumo e O Que Vem Depois')
      }))
    } else if (writingTone === 'jornalistico') {
      return baseTopics.map(topic => ({
        ...topic,
        title: topic.title.replace('e Contexto', 'e Contextualização')
          .replace('Fundamentação Teórica', 'Base Teórica')
          .replace('Estado da Arte', 'Cenário Atual')
          .replace('Aplicações Práticas', 'Casos e Exemplos')
          .replace('Análise Crítica', 'Análise Crítica')
          .replace('Resumo e Próximos Passos', 'Conclusão')
      }))
    }

    return baseTopics
  }

  // Carregar tópicos salvos ou iniciar padrão
  useEffect(() => {
    if (currentBook) {
      const chapter = currentBook.chapters.find(c => c.number === chapterNumber)
      if (chapter?.topics_data && chapter.topics_data.length > 0) {
        console.log('ChapterScopeEnhanced - Carregando tópicos salvos:', chapter.topics_data.length)
        setTopics(chapter.topics_data)

        // Recalcular conteúdo completo se já houver tópicos completados
        const fullContent = chapter.topics_data
          .filter((t: any) => t.status === 'completed' && t.content)
          .map((t: any) => `## ${t.title}\n\n${t.content}`)
          .join('\n\n')

        if (fullContent) {
          setChapterContent(fullContent)
        }
        return
      }
    }
    setTopics(getDefaultTopics())
  }, [chapterNumber, currentBook?.id]) // Recarregar se mudar o capítulo ou livro

  // Persistir tópicos quando mudarem
  useEffect(() => {
    if (topics.length > 0 && currentBook) {
      const chapter = currentBook.chapters.find(c => c.number === chapterNumber)
      // Só salvar se houver mudança real para evitar loop infinito ou updates desnecessários
      // Comparação simples de stringify por enquanto
      if (JSON.stringify(chapter?.topics_data) !== JSON.stringify(topics)) {
        console.log('ChapterScopeEnhanced - Persistindo tópicos no store')
        updateChapter(chapterNumber, { topics_data: topics })
      }
    }
  }, [topics, chapterNumber])

  const generateTopicContent = async (topicId: string): Promise<string | null> => {
    const topic = topics.find(t => t.id === topicId)
    if (!topic) return null

    // Atualizar status para gerando
    setTopics(prev => prev.map(t =>
      t.id === topicId ? { ...t, status: 'generating' } : t
    ))

    try {
      // Pegar conteúdo anterior atualizado (dos tópicos já completados)
      // Nota: aqui ainda pegamos do state, que pode não estar 100% sync no loop, 
      // mas para o contexto do prompt é aceitável.
      const previousContent = topics.filter(t => t.status === 'completed' && t.content)
        .map(t => `## ${t.title}\n${t.content}`)
        .join('\n\n')

      const response = await fetch('http://localhost:8000/api/chapter/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapter_number: chapterNumber,
          chapter_title: chapterTitle,
          book_topic: bookTopic,
          topic_title: topic.title,
          writing_tone: writingTone,
          previous_content: previousContent
        })
      })

      if (!response.ok) throw new Error('Erro na geração')

      const data = await response.json()
      const generatedContent = data.content

      // Atualizar tópico com conteúdo gerado
      setTopics(prev => prev.map(t =>
        t.id === topicId ? {
          ...t,
          status: 'completed',
          content: generatedContent,
          wordCount: data.word_count || 0
        } : t
      ))

      toast.success(`${topic.title} gerado com sucesso!`)
      return generatedContent

    } catch (error) {
      console.error('Error generating topic:', error)
      setTopics(prev => prev.map(t =>
        t.id === topicId ? { ...t, status: 'error' } : t
      ))
      toast.error(`Erro ao gerar ${topic.title}`)
      return null
    }
  }

  const generateAllTopics = async () => {
    setIsGenerating(true)

    try {
      // Map local para armazenar conteúdos gerados e evitar stale state
      const generatedContents = new Map<string, string>()

      // Inicializar com conteúdos já existentes
      topics.forEach(t => {
        if (t.content) generatedContents.set(t.id, t.content)
      })

      // Gerar tópicos em sequência
      for (const topic of topics) {
        if (topic.status === 'pending') {
          const content = await generateTopicContent(topic.id)
          if (content) {
            generatedContents.set(topic.id, content)

            // ATUALIZAÇÃO INCREMENTAL:
            // Reconstruir conteúdo parcial e enviar para o editor AGORA
            const currentFullContent = topics
              .map(t => {
                const c = generatedContents.get(t.id)
                if (c) return `## ${t.title}\n\n${c}`
                return null
              })
              .filter(Boolean)
              .join('\n\n')

            // Enviar para o editor e salvar
            if (currentFullContent) {
              console.log(`ChapterScopeEnhanced - Atualizando editor após tópico: ${topic.title}`)
              onContentGenerated?.(currentFullContent)
              onSendToEditor?.(currentFullContent)
            }
          }
          // Pequena pausa entre tópicos
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      // Combinar todos os conteúdos finais
      const fullContent = topics
        .map(t => {
          const content = generatedContents.get(t.id)
          if (content) {
            return `## ${t.title}\n\n${content}`
          }
          return null
        })
        .filter(Boolean)
        .join('\n\n')

      console.log('ChapterScopeEnhanced - fullContent gerado:', fullContent.substring(0, 200))

      setChapterContent(fullContent)
      onContentGenerated?.(fullContent)

      console.log('ChapterScopeEnhanced - onContentGenerated chamado!')

      // Auto-save: marcar como salvando e depois salvo
      setIsSaving(true)

      // Enviar automaticamente para o editor
      if (onSendToEditor && fullContent) {
        console.log('ChapterScopeEnhanced - chamando onSendToEditor')
        onSendToEditor(fullContent)

        // Marcar como salvo após enviar
        setTimeout(() => {
          markSaved()
          toast.success('Capítulo gerado, enviado e salvo automaticamente!')
        }, 500)
      } else {
        setTimeout(() => {
          markSaved()
          toast.success('Capítulo gerado e salvo com sucesso!')
        }, 500)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const sendToEditor = () => {
    if (chapterContent) {
      onSendToEditor?.(chapterContent)
      toast.success('Conteúdo enviado para o editor!')
    }
  }

  const getStatusIcon = (status: Topic['status']) => {
    switch (status) {
      case 'pending':
        return <Play size={16} className="play-icon" />
      case 'generating':
        return <Loader2 size={16} className="loading-spinner" />
      case 'completed':
        return <CheckCircle size={16} className="check-icon" />
      case 'error':
        return <Clock size={16} className="error-icon" />
      default:
        return null
    }
  }

  const completedTopics = topics.filter(t => t.status === 'completed').length
  const totalTopics = topics.length
  const progress = (completedTopics / totalTopics) * 100

  return (
    <div className="chapter-scope-enhanced">
      <div className="scope-header">
        <div className="header-info">
          <h3>
            <BookOpen size={20} />
            Capítulo {chapterNumber}: {chapterTitle}
          </h3>
          <span className="tone-badge">{writingTone}</span>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
          <span className="progress-text">{completedTopics}/{totalTopics}</span>
        </div>
      </div>

      <div className="topics-list">
        {topics.map((topic) => (
          <div key={topic.id} className={`topic-item ${topic.status}`}>
            <div className="topic-header">
              <button
                className="topic-play-btn"
                onClick={() => generateTopicContent(topic.id)}
                disabled={topic.status === 'generating' || isGenerating}
              >
                {getStatusIcon(topic.status)}
              </button>

              <div className="topic-info">
                <h4>{topic.title}</h4>
                <div className="topic-meta">
                  {topic.estimatedTime && (
                    <span className="time-estimate">
                      <Clock size={12} />
                      ~{topic.estimatedTime}min
                    </span>
                  )}
                  {topic.wordCount && (
                    <span className="word-count">
                      <FileText size={12} />
                      {topic.wordCount} palavras
                    </span>
                  )}
                </div>
              </div>
            </div>

            {topic.content && (
              <div className="topic-content">
                <div className="content-preview">
                  {topic.content.substring(0, 200)}...
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="scope-actions">
        <button
          className="btn btn-primary generate-all-btn"
          onClick={generateAllTopics}
          disabled={isGenerating || completedTopics === totalTopics}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Gerando Capítulo...
            </>
          ) : (
            <>
              <Play size={16} />
              Gerar Capítulo Completo
            </>
          )}
        </button>

        {chapterContent && (
          <button
            className="btn btn-secondary send-to-editor-btn"
            onClick={sendToEditor}
          >
            <Edit3 size={16} />
            Enviar para Editor
          </button>
        )}
      </div>
    </div>
  )
}
