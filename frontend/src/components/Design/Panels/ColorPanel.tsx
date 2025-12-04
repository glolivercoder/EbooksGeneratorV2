import { useDesignStore } from '../../../stores/designStore'

const COLOR_SCHEMES = [
    {
        name: 'Modern Purple',
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#ffffff',
        surface: '#f5f7fa',
        textPrimary: '#2d3748',
        textSecondary: '#718096'
    },
    {
        name: 'Tech Blue',
        primary: '#0099ff',
        secondary: '#00d4ff',
        accent: '#e94560',
        background: '#1a1a2e',
        surface: '#16213e',
        textPrimary: '#ffffff',
        textSecondary: '#a0aec0'
    },
    {
        name: 'Earthy Warm',
        primary: '#8b7355',
        secondary: '#c19a6b',
        accent: '#d4a574',
        background: '#f4e8c1',
        surface: '#ffffff',
        textPrimary: '#2c2416',
        textSecondary: '#5a4a3a'
    }
]

export default function ColorPanel() {
    const { config, updateColors } = useDesignStore()

    const handleSchemeSelect = (scheme: typeof COLOR_SCHEMES[0]) => {
        updateColors(scheme)
    }

    return (
        <div className="panel-section">
            <h3>🎨 Cores e Tema</h3>

            <div className="color-schemes">
                {COLOR_SCHEMES.map(scheme => (
                    <div
                        key={scheme.name}
                        className={`scheme-card ${config.colors.name === scheme.name ? 'active' : ''}`}
                        onClick={() => handleSchemeSelect(scheme)}
                    >
                        <div className="palette-preview">
                            <span style={{ background: scheme.primary }} />
                            <span style={{ background: scheme.secondary }} />
                            <span style={{ background: scheme.accent }} />
                        </div>
                        <span className="scheme-name">{scheme.name}</span>
                    </div>
                ))}
            </div>

            <div className="color-editor">
                <label>
                    <span>Cor Principal</span>
                    <div className="color-input-group">
                        <input
                            type="color"
                            value={config.colors.primary}
                            onChange={(e) => updateColors({ primary: e.target.value })}
                        />
                        <input
                            type="text"
                            value={config.colors.primary}
                            onChange={(e) => updateColors({ primary: e.target.value })}
                        />
                    </div>
                </label>

                <label>
                    <span>Cor Secundária</span>
                    <div className="color-input-group">
                        <input
                            type="color"
                            value={config.colors.secondary}
                            onChange={(e) => updateColors({ secondary: e.target.value })}
                        />
                        <input
                            type="text"
                            value={config.colors.secondary}
                            onChange={(e) => updateColors({ secondary: e.target.value })}
                        />
                    </div>
                </label>

                <label>
                    <span>Cor de Destaque</span>
                    <div className="color-input-group">
                        <input
                            type="color"
                            value={config.colors.accent}
                            onChange={(e) => updateColors({ accent: e.target.value })}
                        />
                        <input
                            type="text"
                            value={config.colors.accent}
                            onChange={(e) => updateColors({ accent: e.target.value })}
                        />
                    </div>
                </label>

                <label>
                    <span>Cor de Fundo</span>
                    <div className="color-input-group">
                        <input
                            type="color"
                            value={config.colors.background}
                            onChange={(e) => updateColors({ background: e.target.value })}
                        />
                        <input
                            type="text"
                            value={config.colors.background}
                            onChange={(e) => updateColors({ background: e.target.value })}
                        />
                    </div>
                </label>
            </div>

            <style jsx>{`
        .color-schemes {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .scheme-card {
          padding: 12px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .scheme-card:hover {
          border-color: var(--primary);
          background: var(--bg-hover);
        }

        .scheme-card.active {
          border-color: var(--primary);
          background: var(--primary-light, #f0f4ff);
        }

        .palette-preview {
          display: flex;
          gap: 4px;
        }

        .palette-preview span {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .scheme-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .color-editor {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .color-editor label {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .color-editor label span {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .color-input-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .color-input-group input[type="color"] {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          cursor: pointer;
        }

        .color-input-group input[type="text"] {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 13px;
          font-family: monospace;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
      `}</style>
        </div>
    )
}
