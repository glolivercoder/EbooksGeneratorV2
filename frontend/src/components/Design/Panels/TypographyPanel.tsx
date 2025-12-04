import { useDesignStore } from '../../../stores/designStore'
import './TypographyPanel.css'

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
        </div>
    )
}
