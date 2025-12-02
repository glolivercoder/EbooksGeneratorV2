import { useState } from 'react'
import { Moon, Sun, Settings, Book, FileText, Cpu } from 'lucide-react'
import { useTheme } from './stores/themeStore'
import { Toaster } from 'react-hot-toast'
import SettingsPanel from './components/Settings/SettingsPanel'
import BookWizard from './components/BookWizard/BookWizard'
import LLMSelector from './components/LLMSelector/LLMSelector'
import './App.css'

function App() {
    const { theme, toggleTheme } = useTheme()
    const [activeTab, setActiveTab] = useState<'generator' | 'settings'>('generator')
    const [isLLMSelectorOpen, setIsLLMSelectorOpen] = useState(false)

    return (
        <div className="app">
            <Toaster position="top-right" />

            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo">
                        <Book className="logo-icon" />
                        <h1>Ebook Generator</h1>
                    </div>

                    <nav className="nav-tabs">
                        <button
                            className={`nav-tab ${activeTab === 'generator' ? 'active' : ''}`}
                            onClick={() => setActiveTab('generator')}
                        >
                            <FileText size={18} />
                            <span>Gerador</span>
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={18} />
                            <span>Configurações</span>
                        </button>
                    </nav>

                    <div className="header-actions">
                        <button 
                            className="llm-models-btn" 
                            onClick={() => setIsLLMSelectorOpen(true)}
                            title="Configurar Modelos LLM"
                        >
                            <Cpu size={18} />
                            <span>LLM Models</span>
                        </button>
                        
                        <button className="theme-toggle" onClick={toggleTheme} title="Alternar tema">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="app-main">
                {activeTab === 'generator' && <BookWizard />}
                {activeTab === 'settings' && <SettingsPanel />}
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <p>
                    Ebook Generator v1.0 | Backend: <span className="status-dot online"></span> Online
                </p>
            </footer>

            {/* LLM Selector Modal */}
            <LLMSelector 
                isOpen={isLLMSelectorOpen}
                onClose={() => setIsLLMSelectorOpen(false)}
            />
        </div>
    )
}

export default App
