import ColorPanel from './Panels/ColorPanel'
import TypographyPanel from './Panels/TypographyPanel'
import LayoutPanel from './Panels/LayoutPanel'
import ImagesPanel from './Panels/ImagesPanel'
import LayersPanel from './Panels/LayersPanel'
import './DesignSidebar.css'

interface DesignSidebarProps {
    activeTab: 'colors' | 'typography' | 'layout' | 'images' | 'layers'
}

export default function DesignSidebar({ activeTab }: DesignSidebarProps) {
    return (
        <div className="design-sidebar-content">
            {activeTab === 'colors' && <ColorPanel />}
            {activeTab === 'typography' && <TypographyPanel />}
            {activeTab === 'layout' && <LayoutPanel />}
            {activeTab === 'images' && <ImagesPanel />}
            {activeTab === 'layers' && <LayersPanel />}
        </div>
    )
}
