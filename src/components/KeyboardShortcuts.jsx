import React, { useState } from 'react'

const SHORTCUTS = [
  { category: 'General', items: [
    { keys: ['Ctrl', 'F'], description: 'Open search' },
    { keys: ['Ctrl', 'H'], description: 'Open search & replace' },
    { keys: ['Ctrl', 'G'], description: 'Go to line' },
    { keys: ['Ctrl', 'Z'], description: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo' },
    { keys: ['Ctrl', 'S'], description: 'Download encrypted save' },
  ]},
  { category: 'Editor', items: [
    { keys: ['Tab'], description: 'Indent' },
    { keys: ['Shift', 'Tab'], description: 'Dedent' },
    { keys: ['Ctrl', 'D'], description: 'Select next occurrence' },
    { keys: ['Ctrl', '/'], description: 'Toggle comment' },
    { keys: ['Ctrl', '['], description: 'Fold code' },
    { keys: ['Ctrl', ']'], description: 'Unfold code' },
    { keys: ['Alt', 'F'], description: 'Fold all' },
    { keys: ['Alt', 'G'], description: 'Unfold all' },
    { keys: ['Ctrl', 'Space'], description: 'Autocomplete' },
  ]},
  { category: 'Selection', items: [
    { keys: ['Ctrl', 'L'], description: 'Select line' },
    { keys: ['Ctrl', 'A'], description: 'Select all' },
    { keys: ['Shift', '↑/↓'], description: 'Extend selection' },
    { keys: ['Ctrl', 'Alt', '↑/↓'], description: 'Add cursor above/below' },
  ]},
  { category: 'Navigation', items: [
    { keys: ['Ctrl', 'Home'], description: 'Go to start' },
    { keys: ['Ctrl', 'End'], description: 'Go to end' },
    { keys: ['Ctrl', 'G'], description: 'Go to line number' },
  ]},
]

function KeyboardShortcuts({ onClose }) {
  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button className="shortcuts-close" onClick={onClose}>×</button>
        </div>
        <div className="shortcuts-content">
          {SHORTCUTS.map(cat => (
            <div key={cat.category} className="shortcuts-category">
              <h3>{cat.category}</h3>
              <div className="shortcuts-list">
                {cat.items.map((item, i) => (
                  <div key={i} className="shortcut-row">
                    <span className="shortcut-keys">
                      {item.keys.map((key, ki) => (
                        <React.Fragment key={ki}>
                          {ki > 0 && <span className="shortcut-plus">+</span>}
                          <kbd>{key}</kbd>
                        </React.Fragment>
                      ))}
                    </span>
                    <span className="shortcut-desc">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ShortcutsButton({ onClick }) {
  return (
    <button className="shortcuts-btn" onClick={onClick} title="Keyboard shortcuts">
      ⌨️
    </button>
  )
}

export default KeyboardShortcuts
