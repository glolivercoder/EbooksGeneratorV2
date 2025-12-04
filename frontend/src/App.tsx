import { useState, useEffect } from 'react'
import { Moon, Sun, Settings, Book, FileText, Cpu, Clock, Edit3, LayoutTemplate, Palette } from 'lucide-react'
import { useTheme } from './stores/themeStore'
import { Toaster } from 'react-hot-toast'
import SettingsPanel from './components/Settings/SettingsPanel'
import BookWizard from './components/BookWizard/BookWizard'
import EditorCentral from './components/BookWizard/EditorCentral'
import TemplateFlow from './components/Templates/TemplateFlow'
import LLMSelector from './components/LLMSelector/LLMSelector'
import HistoryModal from './components/History/HistoryModal'
import DesignTab from './components/Design/DesignTab'
import './App.css'
import './styles/global.css'

function App() {
    const { theme, toggleTheme } = useTheme()
    const [activeTab, setActiveTab] = useState<'generator' | 'editor' | 'design' | 'templates' | 'settings'>('generator')
    const [isLLMSelectorOpen, setIsLLMSelectorOpen] = useState(false)
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)
    const [editorContent, setEditorContent] = useState('')

    // Listen for template apply event
    useEffect(() => {
        const handleApplyTemplate = (event: any) => {
            const html = event.detail?.html || sessionStorage.getItem('templateHTML')
            if (html) {
                setEditorContent(html)
                setActiveTab('editor')
                sessionStorage.removeItem('templateHTML')
                sessionStorage.removeItem('templateApplied')
            }
        }

        window.addEventListener('applyTemplate', handleApplyTemplate)
        return () => window.removeEventListener('applyTemplate', handleApplyTemplate)
    }, [])

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
                            className={`nav-tab ${activeTab === 'editor' ? 'active' : ''}`}
                            onClick={() => setActiveTab('editor')}
                        >
                            <Edit3 size={18} />
                            <span>Editor</span>
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'design' ? 'active' : ''}`}
                            onClick={() => setActiveTab('design')}
                        >
                            <Palette size={18} />
                            <span>Design</span>
                        </button>
                        <button
                            className={`nav-tab ${activeTab === 'templates' ? 'active' : ''}`}
                            onClick={() => setActiveTab('templates')}
                        >
                            <LayoutTemplate size={18} />
                            <span>Templates</span>
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
                            className="history-btn"
                            onClick={() => setIsHistoryOpen(true)}
                            title="Histórico de Outlines"
                        >
                            <Clock size={18} />
                            <span>Histórico</span>
                        </button>

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
                {activeTab === 'generator' && (
                    <BookWizard
                        onSendToEditor={(content) => {
                            setEditorContent(content)
                            setActiveTab('editor')
                        }}
                    />
                )}
                {activeTab === 'editor' && (
                    <div className="editor-container" style={{ height: '100%', padding: '20px' }}>
                        <EditorCentral
                            content={editorContent}
                            onContentChange={setEditorContent}
                        />
                    </div>
                )}
                {activeTab === 'design' && (
                    <div className="design-container" style={{ height: '100%' }}>
                        <DesignTab
                            onApplyToEditor={(html) => {
                                setEditorContent(html)
                                setActiveTab('editor')
                            }}
                        />
                    </div>
                )}
                {activeTab === 'templates' && (
                    <div className="templates-container" style={{ height: '100%' }}>
                        <TemplateFlow />
                    </div>
                )}
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

            {/* History Modal */}
            <HistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onRestore={(outline) => {
                    // TODO: Implementar restauração do outline
                    console.log('Outline restaurado:', outline)
                }}
            />
        </div>
    )
}

export default App
