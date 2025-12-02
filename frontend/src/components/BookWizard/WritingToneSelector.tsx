import { useState } from 'react'
import { ChevronDown, BookOpen, GraduationCap, Coffee, Newspaper } from 'lucide-react'
import './WritingToneSelector.css'

interface WritingTone {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  characteristics: string[]
}

const writingTones: WritingTone[] = [
  {
    id: 'didatico',
    name: 'Didático',
    description: 'Claro, estruturado, com explicações passo a passo',
    icon: BookOpen,
    characteristics: [
      'Linguagem acessível e educativa',
      'Explicações detalhadas',
      'Exemplos práticos',
      'Estrutura lógica progressiva',
      'Objetivo de ensinar'
    ]
  },
  {
    id: 'academico',
    name: 'Acadêmico',
    description: 'Formal, rigoroso, com citações e referências',
    icon: GraduationCap,
    characteristics: [
      'Linguagem formal e técnica',
      'Citações e referências',
      'Argumentação baseada em evidências',
      'Estrutura metodológica',
      'Objetividade científica'
    ]
  },
  {
    id: 'descontraido',
    name: 'Descontraído',
    description: 'Informal, próximo, com linguagem casual',
    icon: Coffee,
    characteristics: [
      'Linguagem informal e coloquial',
      'Tom conversacional',
      'Histórias pessoais',
      'Humor leve',
      'Conexão emocional'
    ]
  },
  {
    id: 'jornalistico',
    name: 'Jornalístico',
    description: 'Informativo, objetivo, com os 5Ws + H',
    icon: Newspaper,
    characteristics: [
      'Linguagem clara e direta',
      'Fatos e dados',
      'Entrevistas e declarações',
      'Estrutura piramidal',
      'Objetividade informativa'
    ]
  }
]

interface WritingToneSelectorProps {
  selectedTone: string
  onToneChange: (tone: string) => void
  disabled?: boolean
}

export default function WritingToneSelector({ 
  selectedTone, 
  onToneChange, 
  disabled = false 
}: WritingToneSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentTone = writingTones.find(tone => tone.id === selectedTone) || writingTones[0]
  const Icon = currentTone.icon
  
  const handleToneSelect = (toneId: string) => {
    onToneChange(toneId)
    setIsOpen(false)
  }
  
  return (
    <div className="writing-tone-selector">
      <label className="tone-label">Tom de Escrita:</label>
      
      <div className={`tone-dropdown ${isOpen ? 'open' : ''}`}>
        <button
          className="tone-selected"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <Icon size={20} />
          <span className="tone-name">{currentTone.name}</span>
          <ChevronDown size={16} className={`dropdown-arrow ${isOpen ? 'up' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="tone-options">
            {writingTones.map((tone) => {
              const ToneIcon = tone.icon
              return (
                <button
                  key={tone.id}
                  className={`tone-option ${tone.id === selectedTone ? 'selected' : ''}`}
                  onClick={() => handleToneSelect(tone.id)}
                >
                  <ToneIcon size={18} />
                  <div className="tone-info">
                    <div className="tone-option-name">{tone.name}</div>
                    <div className="tone-description">{tone.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      
      <div className="tone-details">
        <h4>{currentTone.name}</h4>
        <p>{currentTone.description}</p>
        <ul>
          {currentTone.characteristics.map((char, index) => (
            <li key={index}>{char}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
