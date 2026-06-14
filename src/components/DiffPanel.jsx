import React from 'react'

function DiffPanel({ changes, onNavigate }) {
  if (!changes || changes.length === 0) return null

  return (
    <div className="diff-panel">
      <div className="diff-header">
        <span className="diff-icon">⟳</span>
        Changes ({changes.length})
      </div>
      <div className="diff-list">
        {changes.slice(0, 50).map((change, i) => (
          <div key={i} className="diff-item" onClick={() => onNavigate(change.path)}>
            <div className="diff-path">{change.path}</div>
            <div className="diff-values">
              {change.oldVal !== undefined && (
                <span className="diff-old">-{JSON.stringify(change.oldVal)}</span>
              )}
              {change.newVal !== undefined && (
                <span className="diff-new">+{JSON.stringify(change.newVal)}</span>
              )}
            </div>
          </div>
        ))}
        {changes.length > 50 && (
          <div className="diff-more">...and {changes.length - 50} more changes</div>
        )}
      </div>
    </div>
  )
}

export default DiffPanel
