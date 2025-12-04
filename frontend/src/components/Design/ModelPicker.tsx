import { useState, useEffect } from 'react'
import { ChevronDown, Sparkles, DollarSign } from 'lucide-react'
import {
    getAvailableModels,
    selectBestModel,
    estimateCost,
    formatPrice,
    ModelInfo
} from '../../services/modelService'
import './ModelPicker.css'

interface ModelPickerProps {
    onModelSelect: (model: ModelInfo) => void
    selectedModel?: ModelInfo
    type?: 'image' | 'text' | 'multimodal'
}

export default function ModelPicker({ onModelSelect, selectedModel, type = 'image' }: ModelPickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [models, setModels] = useState<ModelInfo[]>([])
    const [strategy, setStrategy] = useState<'free' | 'cheap' | 'premium'>('free')

    useEffect(() => {
        loadModels()
    }, [])

    useEffect(() => {
        if (models.length > 0 && !selectedModel) {
            const bestModel = selectBestModel(strategy)
            onModelSelect(bestModel)
        }
    }, [strategy, models])

    const loadModels = async () => {
        const availableModels = await getAvailableModels()
        setModels(availableModels)
    }

    const handleStrategyChange = (newStrategy: 'free' | 'cheap' | 'premium') => {
        setStrategy(newStrategy)
        const bestModel = selectBestModel(newStrategy)
        onModelSelect(bestModel)
        setIsOpen(false)
    }

    const handleModelSelect = (model: ModelInfo) => {
        onModelSelect(model)
        setIsOpen(false)
    }

    const currentModel = selectedModel || (models.length > 0 ? models[0] : null)

    return (
        <div className="model-picker">
            <button
                className="model-picker-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Sparkles size={16} />
                <div className="model-info">
                    <span className="model-name">
                        {currentModel?.name || 'Selecionar Modelo'}
                    </span>
                    {currentModel && (
                        <span className="model-price">
                            {formatPrice(currentModel.pricing.output)}
                        </span>
                    )}
                </div>
                <ChevronDown size={16} className={isOpen ? 'rotated' : ''} />
            </button>

            {isOpen && (
                <div className="model-dropdown">
                    <div className="model-strategies">
                        <button
                            className={strategy === 'free' ? 'active' : ''}
                            onClick={() => handleStrategyChange('free')}
                        >
                            <Sparkles size={14} />
                            Gratuito
                        </button>
                        <button
                            className={strategy === 'cheap' ? 'active' : ''}
                            onClick={() => handleStrategyChange('cheap')}
                        >
                            <DollarSign size={14} />
                            Econômico
                        </button>
                        <button
                            className={strategy === 'premium' ? 'active' : ''}
                            onClick={() => handleStrategyChange('premium')}
                        >
                            ⭐
                            Premium
                        </button>
                    </div>

                    <div className="model-list">
                        {models.map(model => (
                            <div
                                key={model.id}
                                className={`model-item ${currentModel?.id === model.id ? 'selected' : ''}`}
                                onClick={() => handleModelSelect(model)}
                            >
                                <div className="model-item-header">
                                    <span className="model-item-name">{model.name}</span>
                                    <span className={`model-item-price ${model.pricing.free_tier ? 'free' : ''}`}>
                                        {formatPrice(model.pricing.output)}
                                    </span>
                                </div>
                                <div className="model-item-details">
                                    <span className="model-provider">{model.provider}</span>
                                    <span className="model-capabilities">
                                        {model.capabilities.slice(0, 2).join(', ')}
                                    </span>
                                </div>
                                <p className="model-description">{model.description}</p>
                                {!model.pricing.free_tier && (
                                    <div className="model-cost-estimate">
                                        Custo estimado: {formatPrice(estimateCost(model, 1))} por imagem
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
