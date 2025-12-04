import { useDesignStore } from '../../../stores/designStore'
import './ColorPanel.css'

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
    },
    {
        name: 'Ocean Breeze',
        primary: '#1e88e5',
        secondary: '#00acc1',
        accent: '#26c6da',
        background: '#e3f2fd',
        surface: '#ffffff',
        textPrimary: '#01579b',
        textSecondary: '#0277bd'
    },
    {
        name: 'Sunset Vibes',
        primary: '#ff6f61',
        secondary: '#ff9f68',
        accent: '#ffcc00',
        background: '#fff5ec',
        surface: '#ffffff',
        textPrimary: '#5d3a1a',
        textSecondary: '#8b5a3c'
    },
    {
        name: 'Forest Green',
        primary: '#2e7d32',
        secondary: '#66bb6a',
        accent: '#a5d6a7',
        background: '#f1f8e9',
        surface: '#ffffff',
        textPrimary: '#1b5e20',
        textSecondary: '#388e3c'
    },
    {
        name: 'Dark Mode Pro',
        primary: '#bb86fc',
        secondary: '#03dac6',
        accent: '#cf6679',
        background: '#121212',
        surface: '#1e1e1e',
        textPrimary: '#ffffff',
        textSecondary: '#b0b0b0'
    },
    {
        name: 'Cherry Blossom',
        primary: '#ec407a',
        secondary: '#f48fb1',
        accent: '#fce4ec',
        background: '#fff0f5',
        surface: '#ffffff',
        textPrimary: '#880e4f',
        textSecondary: '#c2185b'
    },
    {
        name: 'Corporate Blue',
        primary: '#1976d2',
        secondary: '#2196f3',
        accent: '#64b5f6',
        background: '#fafafa',
        surface: '#ffffff',
        textPrimary: '#212121',
        textSecondary: '#616161'
    },
    {
        name: 'Retro Vintage',
        primary: '#d84315',
        secondary: '#ff5722',
        accent: '#ffab91',
        background: '#fff3e0',
        surface: '#ffffff',
        textPrimary: '#3e2723',
        textSecondary: '#6d4c41'
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
        </div>
    )
}
