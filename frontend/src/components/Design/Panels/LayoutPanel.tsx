import { useDesignStore } from '../../../stores/designStore'

const PAGE_PRESETS = [
    { name: 'A4', width: 210, height: 297 },
    { name: 'Letter', width: 215.9, height: 279.4 },
    { name: 'A5', width: 148, height: 210 },
    { name: '6x9" (KDP)', width: 152.4, height: 228.6 },
]

const MARGIN_PRESETS = [
    { name: 'Estreitas', top: 12.7, right: 12.7, bottom: 12.7, left: 12.7 },
    { name: 'Normais', top: 25.4, right: 25.4, bottom: 25.4, left: 25.4 },
    { name: 'Largas', top: 38.1, right: 38.1, bottom: 38.1, left: 38.1 },
]

export default function LayoutPanel() {
    const { config, updatePageSize, updateMargins } = useDesignStore()

    return (
        <div className="panel-section">
            <h3>📐 Layout</h3>

            <div className="layout-section">
                <h4>Tamanho da Página</h4>
                <div className="preset-buttons">
                    {PAGE_PRESETS.map(preset => (
                        <button
                            key={preset.name}
                            className={config.pageSize.width === preset.width ? 'active' : ''}
                            onClick={() => updatePageSize({
                                preset: 'Custom',
                                width: preset.width,
                                height: preset.height
                            })}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>

                <div className="orientation-buttons">
                    <button
                        className={config.pageSize.orientation === 'portrait' ? 'active' : ''}
                        onClick={() => updatePageSize({ orientation: 'portrait' })}
                    >
                        📱 Retrato
                    </button>
                    <button
                        className={config.pageSize.orientation === 'landscape' ? 'active' : ''}
                        onClick={() => updatePageSize({ orientation: 'landscape' })}
                    >
                        🖥️ Paisagem
                    </button>
                </div>
            </div>

            <div className="layout-section">
                <h4>Margens</h4>
                <div className="preset-buttons">
                    {MARGIN_PRESETS.map(preset => (
                        <button
                            key={preset.name}
                            onClick={() => updateMargins({
                                top: preset.top,
                                right: preset.right,
                                bottom: preset.bottom,
                                left: preset.left
                            })}
                        >
                            {preset.name}
                        </button>
                    ))}
                </div>

                <div className="margin-inputs">
                    <input
                        type="number"
                        placeholder="Superior"
                        value={config.margins.top}
                        onChange={(e) => updateMargins({ top: parseFloat(e.target.value) })}
                    />
                    <input
                        type="number"
                        placeholder="Direita"
                        value={config.margins.right}
                        onChange={(e) => updateMargins({ right: parseFloat(e.target.value) })}
                    />
                    <input
                        type="number"
                        placeholder="Inferior"
                        value={config.margins.bottom}
                        onChange={(e) => updateMargins({ bottom: parseFloat(e.target.value) })}
                    />
                    <input
                        type="number"
                        placeholder="Esquerda"
                        value={config.margins.left}
                        onChange={(e) => updateMargins({ left: parseFloat(e.target.value) })}
                    />
                </div>
            </div>

            <style jsx>{`
        .layout-section {
          margin-bottom: 24px;
        }

        .layout-section h4 {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 12px 0;
        }

        .preset-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
        }

        .preset-buttons button,
        .orientation-buttons button {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .preset-buttons button:hover,
        .orientation-buttons button:hover {
          background: var(--bg-hover);
          border-color: var(--primary);
        }

        .preset-buttons button.active,
        .orientation-buttons button.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .orientation-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .margin-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .margin-inputs input {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 13px;
        }
      `}</style>
        </div>
    )
}
