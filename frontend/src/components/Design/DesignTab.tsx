import { useState } from 'react'
import { Palette, Type, Layout, Image, Layers } from 'lucide-react'
import DesignCanvas from './DesignCanvas'
import DesignToolbar from './DesignToolbar'
import DesignSidebar from './DesignSidebar'
import './DesignTab.css'

interface DesignTabProps {
    onApplyToEditor?: (html: string) => void
}

export default function DesignTab({ onApplyToEditor }: DesignTabProps) {
    const [activeSidebarTab, setActiveSidebarTab] = useState<'colors' | 'typography' | 'layout' | 'images' | 'layers'>('colors')

    const handleExportToEditor = (html: string) => {
        if (onApplyToEditor) {
            onApplyToEditor(html)
        }
    }

    return (
        <div className="design-tab">
            <div className="design-header">
                <h2>🎨 Design</h2>
                <p>Crie capas e templates visuais profissionais para seu ebook</p>
            </div>

            <div className="design-layout">
                {/* Sidebar */}
                <aside className="design-sidebar">
                    <div className="sidebar-tabs">
                        <button
                            className={activeSidebarTab === 'colors' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('colors')}
                            title="Cores"
                        >
                            <Palette size={18} />
                        </button>
                        <button
                            className={activeSidebarTab === 'typography' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('typography')}
                            title="Tipografia"
                        >
                            <Type size={18} />
                        </button>
                        <button
                            className={activeSidebarTab === 'layout' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('layout')}
                            title="Layout"
                        >
                            <Layout size={18} />
                        </button>
                        <button
                            className={activeSidebarTab === 'images' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('images')}
                            title="Imagens"
                        >
                            <Image size={18} />
                        </button>
                        <button
                            className={activeSidebarTab === 'layers' ? 'active' : ''}
                            onClick={() => setActiveSidebarTab('layers')}
                            title="Camadas"
                        >
                            <Layers size={18} />
                        </button>
                    </div>

                    <DesignSidebar activeTab={activeSidebarTab} />
                </aside>

                {/* Main Canvas Area */}
                <main className="design-main">
                    <DesignToolbar />
                    <DesignCanvas onExport={handleExportToEditor} />
                </main>
            </div>
        </div>
    )
}
