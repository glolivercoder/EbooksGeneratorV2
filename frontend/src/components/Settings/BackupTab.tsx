import { useState, useEffect } from 'react'
import { Download, Upload, FolderOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface BackupTabProps {
  className?: string
}

export default function BackupTab({ className }: BackupTabProps) {
  const [backupPath, setBackupPath] = useState<string>('./backups')
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false)
  const [autoBackupInterval, setAutoBackupInterval] = useState(24) // hours
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('backup-settings')
    if (stored) {
      const settings = JSON.parse(stored)
      setBackupPath(settings.backupPath ?? './backups')
      setAutoBackupEnabled(settings.autoBackupEnabled ?? false)
      setAutoBackupInterval(settings.autoBackupInterval ?? 24)
      setLastBackupTime(settings.lastBackupTime ?? null)
    }
  }, [])

  const saveBackupSettings = () => {
    const settings = { backupPath, autoBackupEnabled, autoBackupInterval, lastBackupTime }
    localStorage.setItem('backup-settings', JSON.stringify(settings))
    toast.success('Configurações de backup salvas.')
  }

  const handleSelectFolder = async () => {
    try {
      // Usar a API File System Access se disponível (Chrome/Edge)
      if ('showDirectoryPicker' in window) {
        const dirHandle = await (window as any).showDirectoryPicker({
          mode: 'readwrite'
        })
        // Obter o caminho do diretório (limitado por segurança)
        setBackupPath(dirHandle.name)
        toast.success('Pasta selecionada com sucesso!')
      } else {
        // Fallback: permitir selecionar um arquivo para inferir o diretório
        const input = document.createElement('input')
        input.type = 'file'
        input.webkitdirectory = true
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files
          if (files && files.length > 0) {
            // Extrair o nome do diretório do primeiro arquivo
            const firstPath = files[0].webkitRelativePath
            const dirName = firstPath.split('/')[0]
            setBackupPath(dirName)
            toast.success('Pasta selecionada com sucesso!')
          }
        }
        input.click()
      }
    } catch (error) {
      console.error('Erro ao selecionar pasta:', error)
      toast.error('Não foi possível selecionar a pasta')
    }
  }

  const handleExportBackup = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/backup/export')
      if (!response.ok) throw new Error('Falha ao exportar backup')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ebook-generator-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      const now = new Date().toISOString()
      setLastBackupTime(now)
      localStorage.setItem('backup-settings', JSON.stringify({ backupPath, autoBackupEnabled, autoBackupInterval, lastBackupTime: now }))
      toast.success('Backup exportado com sucesso.')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao exportar backup.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      const response = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Falha ao importar backup')
      toast.success('Backup importado com sucesso. Recarregue a página para ver as mudanças.')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao importar backup.')
    } finally {
      setIsImporting(false)
      event.target.value = ''
    }
  }

  return (
    <div className={`backup-tab ${className ?? ''}`}>
      <div className="settings-header">
        <h2>📦 Backup</h2>
        <p>Exporte e importe backups de seus livros, prompts e configurações.</p>
      </div>

      <div className="settings-content">
        <div className="setting-group">
          <label htmlFor="backup-path">
            <strong>Pasta de Backup</strong>
            <span className="label-hint">Local onde os backups serão salvos</span>
          </label>
          <div className="path-input-row">
            <input
              id="backup-path"
              type="text"
              value={backupPath}
              onChange={(e) => setBackupPath(e.target.value)}
              placeholder="./backups"
            />
            <button className="btn btn-secondary btn-sm" onClick={handleSelectFolder}>
              <FolderOpen size={16} /> Escolher
            </button>
          </div>
        </div>

        <div className="setting-group">
          <label>
            <strong>Backup Automático</strong>
            <span className="label-hint">Crie backups automaticamente em intervalos definidos</span>
          </label>
          <div className="auto-backup-controls">
            <label className="switch">
              <input
                type="checkbox"
                checked={autoBackupEnabled}
                onChange={(e) => setAutoBackupEnabled(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <input
              type="number"
              min={1}
              max={168}
              value={autoBackupInterval}
              onChange={(e) => setAutoBackupInterval(Number(e.target.value))}
              disabled={!autoBackupEnabled}
              className="interval-input"
            />
            <span className="interval-label">horas</span>
          </div>
        </div>

        {lastBackupTime && (
          <div className="last-backup-info">
            <Clock size={16} />
            <span>Último backup: {new Date(lastBackupTime).toLocaleString()}</span>
          </div>
        )}

        <div className="backup-actions">
          <button
            className="btn btn-primary"
            onClick={handleExportBackup}
            disabled={isExporting}
          >
            <Download size={18} className={isExporting ? 'spinning' : ''} />
            <span>{isExporting ? 'Exportando...' : 'Exportar Backup'}</span>
          </button>
          <label className="btn btn-secondary">
            <Upload size={18} />
            <span>Importar Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={isImporting}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div className="backup-hint">
          <AlertCircle size={16} />
          <span>
            O backup inclui: prompts originais e otimizados, outlines, livros gerados e configurações de agentes/RAG.
          </span>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-secondary" onClick={saveBackupSettings}>
          <CheckCircle size={18} />
          <span>Salvar Configurações de Backup</span>
        </button>
      </div>
    </div>
  )
}
