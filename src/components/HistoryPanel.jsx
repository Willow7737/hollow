import React, { useState, useEffect, useCallback } from 'react'
import { getHistory, removeFromHistory } from '../hooks/useSaveFile.js'
import { humanTime } from '../utils/crypto.js'

function HistoryPanel({ onLoad }) {
  const [historyItems, setHistoryItems] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const refreshHistory = useCallback(() => {
    setHistoryItems(getHistory())
  }, [])

  useEffect(() => {
    refreshHistory()
  }, [refreshHistory])

  // Re-read on focus (in case changes in another tab)
  useEffect(() => {
    const handler = () => refreshHistory()
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [refreshHistory])

  if (historyItems.length === 0) return null

  const handleLoad = (item) => {
    onLoad(item.jsonString, item.fileName)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleRemove = (e, hash) => {
    e.preventDefault()
    e.stopPropagation()
    removeFromHistory(hash)
    refreshHistory()
  }

  return (
    <div className="history-panel">
      <button
        className="history-toggle"
        onClick={() => setShowHistory(!showHistory)}
      >
        <span className="history-toggle-icon">📋</span>
        History ({historyItems.length})
        <span className={`history-chevron ${showHistory ? 'open' : ''}`}>▼</span>
      </button>

      {showHistory && (
        <div className="history-content">
          <div className="history-notice">
            Stores a limited amount of recent files. Do not use this as an alternative to making backups.
          </div>
          <div className="history-list">
            {historyItems.map(item => (
              <div
                key={item.hash}
                className="history-item"
                onClick={() => handleLoad(item)}
                onContextMenu={(e) => handleRemove(e, item.hash)}
                title="Click to load · Right-click to remove"
              >
                <div className="history-item-name">{item.fileName}</div>
                <div className="history-item-meta">
                  <span className="history-hash">ID: {item.hash}</span>
                  <span className="history-date">{humanTime(item.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPanel
