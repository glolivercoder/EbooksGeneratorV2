import { useDesignStore } from '../../../stores/designStore'

const FONT_LIBRARY = {
    serif: [
        'Playfair Display',
        'Merriweather',
        'Lora',
        'Crimson Text'
    ],
    sansSerif: [
        'Inter',
        'Lato',
        'Open Sans',
        'Montserrat'
    ],
    display: [
        'Bebas Neue',
        'Oswald',
        'Righteous'
    ],
    monospace: [
        'Fira Code',
        'JetBrains Mono',
        'Courier New'
    ]
}

export default function TypographyPanel() {
    const { config, updateTypography } = useDesignStore()

    return (
        <div className="panel-section">
            <h3>🔤 Tipografia</h3>

            <div className="typography-controls">
                <label>
                    <span>Título Principal</span>
                    <select
                        value={config.typography.primary}
                        onChange={(e) => updateTypography({ primary: e.target.value })}
                    >
                        <optgroup label="Serif">
                            {FONT_LIBRARY.serif.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Sans-Serif">
                            {FONT_LIBRARY.sansSerif.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Display">
                            {FONT_LIBRARY.display.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </optgroup>
                    </select>
                </label>

                <label>
                    <span>Subtítulos</span>
                    <select
                        value={config.typography.secondary}
                        onChange={(e) => updateTypography({ secondary: e.target.value })}
                    >
                        <optgroup label="Serif">
                            {FONT_LIBRARY.serif.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Sans-Serif">
                            {FONT_LIBRARY.sansSerif.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </optgroup>
                    </select>
                </label>

                <label>
                    <span>Corpo de Texto</span>
                    <select
                        value={config.typography.body}
                        onChange={(e) => updateTypography({ body: e.target.value })}
                    >
                        <optgroup label="Serif">
                            {FONT_LIBRARY.serif.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </optgroup>
                        <optgroup label="Sans-Serif">
                            {FONT_LIBRARY.sansSerif.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </optgroup>
                    </select>
                </label>

                <label>
                    <span>Código (Monospace)</span>
                    <select
                        value={config.typography.monospace}
                        onChange={(e) => updateTypography({ monospace: e.target.value })}
                    >
                        <optgroup label="Monospace">
                            {FONT_LIBRARY.monospace.map(font => (
                                <option key={font} value={font}>{font}</option>
                            ))}
                        </optgroup>
                    </select>
                </label>
            </div>

            <div className="font-preview">
                <h4>Preview</h4>
                <div style={{ fontFamily: config.typography.primary, fontSize: '24px', fontWeight: 700 }}>
                    Design Thinking
                </div>
                <div style={{ fontFamily: config.typography.secondary, fontSize: '18px', fontWeight: 600, marginTop: '8px' }}>
                    Uma jornada pela inovação
                </div>
                <div style={{ fontFamily: config.typography.body, fontSize: '14px', marginTop: '12px', lineHeight: 1.6 }}>
                    Este é um exemplo de texto no corpo do documento. A tipografia escolhida deve ser legível e harmoniosa.
                </div>
            </div>

            <style jsx>{`
        .typography-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .typography-controls label {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .typography-controls label span {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .typography-controls select {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-size: 14px;
          cursor: pointer;
        }

        .font-preview {
          padding: 16px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
        }

        .font-preview h4 {
          margin: 0 0 12px 0;
          font-size: 12px;
          text-transform: uppercase;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }
      `}</style>
        </div>
    )
}
