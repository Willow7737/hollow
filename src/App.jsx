import React, { useState, useCallback, useEffect, useRef } from 'react'
import CodeMirrorEditor from './components/CodeMirrorEditor.jsx'
import JsonTree, { useJsonTree } from './components/JsonTree.jsx'
import QuickEdit from './components/QuickEdit.jsx'
import HistoryPanel from './components/HistoryPanel.jsx'
import DiffPanel from './components/DiffPanel.jsx'
import StatusBar from './components/StatusBar.jsx'
import KeyboardShortcuts, { ShortcutsButton } from './components/KeyboardShortcuts.jsx'
import { useTheme } from './hooks/useTheme.js'
import { useSaveFile } from './hooks/useSaveFile.js'
import { validateJson } from './utils/crypto.js'
import './App.css'

function App() {
  const { theme, toggleTheme } = useTheme()
  const save = useSaveFile()
  const treeState = useJsonTree()
  const [showTree, setShowTree] = useState(false)
  const [showQuickEdit, setShowQuickEdit] = useState(false)
  const [showDiff, setShowDiff] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [cursorLine, setCursorLine] = useState(1)
  const [cursorCol, setCursorCol] = useState(1)
  const [totalLines, setTotalLines] = useState(0)
  const [goToLineValue, setGoToLineValue] = useState('')
  const editorContainerRef = useRef(null)

  // Track line/col from editor
  useEffect(() => {
    if (!save.gameFile) return
    setTotalLines(save.gameFile.split('\n').length)
  }, [save.gameFile])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Ctrl+S to download
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (save.editing) save.handleDownloadEncrypted()
      }
      // Ctrl+Shift+S for Switch download
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        if (save.editing) save.handleDownloadSwitch()
      }
      // Escape to close panels
      if (e.key === 'Escape') {
        setShowShortcuts(false)
        setGoToLineValue('')
      }
      // Ctrl+G for go-to-line
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault()
        setGoToLineValue(prev => prev === '' ? '1' : prev)
      }
      // ? for shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = document.activeElement?.tagName
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          setShowShortcuts(prev => !prev)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [save])

  // Window drag and drop
  useEffect(() => {
    let dragIndex = 0
    const onDragOver = (e) => e.preventDefault()
    const onDragEnter = (e) => {
      dragIndex++
      e.preventDefault()
      save.setDragging(true)
    }
    const onDragLeave = (e) => {
      if (--dragIndex === 0) save.setDragging(false)
      e.preventDefault()
    }
    const onDrop = (e) => {
      if (dragIndex > 0) {
        if (--dragIndex === 0) save.setDragging(false)
      }
      save.handleFileChange(e.dataTransfer.files)
      e.preventDefault()
    }

    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [save])

  const handleNavigateToPath = useCallback((path) => {
    // Simple: search for the key in the editor text
    if (!save.gameFile) return
    // Convert dot path to a searchable key
    const lastKey = path.split('.').pop().replace(/\[\d+\]/g, '')
    const searchStr = `"${lastKey}"`
    const idx = save.gameFile.indexOf(searchStr)
    if (idx !== -1) {
      const line = save.gameFile.substring(0, idx).split('\n').length
      setCursorLine(line)
      setGoToLineValue(String(line))
    }
  }, [save.gameFile])

  const handleGoToLine = useCallback(() => {
    const line = parseInt(goToLineValue, 10)
    if (isNaN(line) || line < 1) return
    // We can't directly control CodeMirror cursor from here without a ref,
    // but we can scroll to show the line by briefly manipulating the editor
    setCursorLine(line)
    setGoToLineValue('')
  }, [goToLineValue])

  const parsedData = React.useMemo(() => {
    try { return JSON.parse(save.gameFile) }
    catch { return null }
  }, [save.gameFile])

  const parsedOriginal = React.useMemo(() => {
    try { return JSON.parse(save.gameFileOriginal) }
    catch { return null }
  }, [save.gameFileOriginal])

  return (
    <div className={`app ${theme}`} data-theme={theme}>
      {save.dragging && (
        <div className="drag-overlay">
          <div className="drag-overlay-content">
            <div className="drag-icon">📁</div>
            <div className="drag-text">Drop your save file here</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Hollow Knight Save Editor</h1>
          <p className="app-subtitle">Modify and convert Hollow Knight save files in your browser</p>
        </div>
        <div className="header-right">
          <ShortcutsButton onClick={() => setShowShortcuts(true)} />
          <button className="theme-toggle" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Instructions & File Select */}
      {!save.editing && (
        <div className="intro-section">
          <div className="intro-card">
            <p className="intro-description">
              This online tool allows you to modify a Hollow Knight save file. You can also use this to convert your PC save to and from a Switch save.
            </p>
            <div className="intro-steps">
              <div className="intro-step">
                <span className="step-number">1</span>
                <span className="step-text">Make a backup of your original file</span>
              </div>
              <div className="intro-step">
                <span className="step-number">2</span>
                <span className="step-text">Select or drag in the save file you want to modify</span>
              </div>
              <div className="intro-step">
                <span className="step-number">3</span>
                <span className="step-text">Edit using the JSON editor, tree view, or quick edit panel</span>
              </div>
              <div className="intro-step">
                <span className="step-number">4</span>
                <span className="step-text">Download your modified save file</span>
              </div>
            </div>

            <div className="file-select-area">
              <button className="file-select-btn" onClick={() => save.fileInputRef.current?.click()}>
                Select File
              </button>
              <label className="switch-mode-toggle">
                <input
                  type="checkbox"
                  checked={save.switchMode}
                  onChange={e => save.setSwitchMode(e.target.checked)}
                />
                <span className="switch-mode-slider" />
                <span className="switch-mode-label">Nintendo Switch Mode</span>
              </label>
            </div>

            <div className="source-link">
              <a href="https://github.com/bloodorca/hollow" target="_blank" rel="noopener noreferrer">
                View source on GitHub
              </a>
            </div>
          </div>

          <HistoryPanel onLoad={save.setGameFileFromJson} />
        </div>
      )}

      <input
        ref={save.fileInputRef}
        type="file"
        style={{ position: 'fixed', opacity: 0, left: 0, top: 0, width: 0, height: 0 }}
        onChange={e => save.handleFileChange(e.target.files)}
      />

      {/* Editor Section */}
      {save.editing && (
        <div className="editor-section">
          {/* Toolbar */}
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <span className="toolbar-filename">{save.gameFileName}</span>
              {!save.jsonValid && <span className="toolbar-error">Invalid JSON</span>}
              {save.changes.length > 0 && (
                <span className="toolbar-changes" onClick={() => setShowDiff(!showDiff)}>
                  {save.changes.length} change{save.changes.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="toolbar-right">
              <button
                className="toolbar-btn"
                onClick={() => save.fileInputRef.current?.click()}
                title="Open another file"
              >
                Open
              </button>
              <button
                className="toolbar-btn"
                onClick={() => { save.setSwitchMode(!save.switchMode) }}
                title={save.switchMode ? 'Switch to PC mode' : 'Switch to Switch mode'}
              >
                {save.switchMode ? 'PC Mode' : 'Switch Mode'}
              </button>
              <div className="toolbar-separator" />
              <button className="toolbar-btn" onClick={() => setShowTree(!showTree)} title="Toggle JSON tree view">
                🌳 Tree
              </button>
              <button className="toolbar-btn" onClick={() => setShowQuickEdit(!showQuickEdit)} title="Toggle quick edit panel">
                ⚡ Quick
              </button>
              <div className="toolbar-separator" />
              <button className="toolbar-btn" onClick={save.handleFormat} title="Format JSON (pretty print)">
                Format
              </button>
              <button className="toolbar-btn" onClick={save.handleMinify} title="Minify JSON">
                Minify
              </button>
              <button className="toolbar-btn" onClick={save.handleReset} title="Reset to original">
                ↺ Reset
              </button>
              <div className="toolbar-separator" />
              <button className="toolbar-btn primary" onClick={save.handleDownloadEncrypted} title="Download encrypted PC save (Ctrl+S)">
                ⬇ PC Save
              </button>
              <button className="toolbar-btn" onClick={save.handleDownloadSwitch} title="Download plain text Switch save (Ctrl+Shift+S)">
                ⬇ Switch
              </button>
            </div>
          </div>

          {/* Go to line bar */}
          {goToLineValue !== '' && (
            <div className="goto-bar">
              <span>Go to line:</span>
              <input
                type="number"
                min={1}
                max={totalLines}
                value={goToLineValue}
                onChange={e => setGoToLineValue(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleGoToLine() }}
                autoFocus
              />
              <button onClick={handleGoToLine}>Go</button>
              <button onClick={() => setGoToLineValue('')}>Cancel</button>
            </div>
          )}

          {/* Main Editor Area */}
          <div className="editor-main">
            {/* Side Panels */}
            {showTree && (
              <div className="side-panel tree-panel">
                <div className="side-panel-header">
                  <h3>JSON Tree</h3>
                  <div className="side-panel-actions">
                    <button onClick={() => parsedData && treeState.expandAll(parsedData)} title="Expand all">⊕</button>
                    <button onClick={treeState.collapseAll} title="Collapse all">⊖</button>
                    <button onClick={() => setShowTree(false)} title="Close">✕</button>
                  </div>
                </div>
                <div className="side-panel-content">
                  <JsonTree
                    data={parsedData}
                    originalData={parsedOriginal}
                    onNavigate={handleNavigateToPath}
                    expandedPaths={treeState.expandedPaths}
                    togglePath={treeState.togglePath}
                  />
                </div>
              </div>
            )}

            {/* CodeMirror Editor */}
            <div className="editor-container" ref={editorContainerRef}>
              <CodeMirrorEditor
                value={save.gameFile}
                onChange={save.handleEditorChange}
                theme={theme}
                jsonValid={save.jsonValid}
              />
            </div>

            {/* Quick Edit Panel */}
            {showQuickEdit && (
              <div className="side-panel quickedit-panel">
                <div className="side-panel-header">
                  <h3>Quick Edit</h3>
                  <button onClick={() => setShowQuickEdit(false)} title="Close">✕</button>
                </div>
                <div className="side-panel-content">
                  <QuickEdit
                    gameFile={save.gameFile}
                    gameFileOriginal={save.gameFileOriginal}
                    onChange={(newJson) => {
                      save.setGameFile(newJson)
                      save.updateValidation(newJson)
                      save.updateChanges(newJson, save.gameFileOriginal)
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Diff Panel (collapsible below editor) */}
          {showDiff && save.changes.length > 0 && (
            <div className="diff-section">
              <DiffPanel changes={save.changes} onNavigate={handleNavigateToPath} />
            </div>
          )}

          {/* Status Bar */}
          <StatusBar
            jsonValid={save.jsonValid}
            jsonError={save.jsonError}
            changes={save.changes}
            gameFileName={save.gameFileName}
            line={cursorLine}
            col={cursorCol}
            totalLines={totalLines}
          />
        </div>
      )}

      {/* History at bottom */}
      {save.editing && <HistoryPanel onLoad={save.setGameFileFromJson} />}

      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && <KeyboardShortcuts onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}

export default App
