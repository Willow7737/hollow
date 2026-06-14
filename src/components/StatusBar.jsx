import React from 'react'

function StatusBar({ jsonValid, jsonError, changes, gameFileName, line, col, totalLines }) {
  return (
    <div className="status-bar">
      <div className="status-left">
        <span className={`status-indicator ${jsonValid ? 'status-valid' : 'status-invalid'}`}>
          {jsonValid ? '✓ Valid JSON' : '✗ Invalid JSON'}
        </span>
        {jsonError && (
          <span className="status-error" title={jsonError.error}>
            {jsonError.errorLine ? `Error at line ${jsonError.errorLine}` : 'Parse error'}
          </span>
        )}
      </div>
      <div className="status-center">
        {gameFileName && <span className="status-filename">{gameFileName}</span>}
      </div>
      <div className="status-right">
        {changes.length > 0 && (
          <span className="status-changes">{changes.length} change{changes.length !== 1 ? 's' : ''}</span>
        )}
        {totalLines > 0 && (
          <span className="status-position">Ln {line}, Col {col}</span>
        )}
        <span className="status-lines">{totalLines} lines</span>
      </div>
    </div>
  )
}

export default StatusBar
