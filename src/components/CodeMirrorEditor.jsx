import React, { useCallback, useRef, useEffect, useMemo } from 'react'
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, rectangularSelection, crosshairCursor, highlightSpecialChars, dropCursor } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { json, jsonParseLinter } from '@codemirror/lang-json'
import { linter, lintGutter } from '@codemirror/lint'
import { search, highlightSelectionMatches, searchKeymap, openSearchPanel } from '@codemirror/search'
import { foldGutter, indentOnInput, bracketMatching, foldKeymap, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { autocompletion, completionKeymap, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'

// Theme compartments for dark/light switching
const themeCompartment = new Compartment()

const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#1a1a2e',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  '.cm-content': {
    caretColor: '#1a1a2e',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#1a1a2e',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#b4d5fe !important',
  },
  '.cm-gutters': {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    border: 'none',
    borderRight: '1px solid #dee2e6',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#e9ecef',
  },
  '.cm-activeLine': {
    backgroundColor: '#f1f3f5',
  },
  '.cm-foldGutter': {
    color: '#6c757d',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#e9ecef',
    border: '1px solid #dee2e6',
    color: '#6c757d',
  },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    textDecoration: 'wavy underline #e74c3c',
  },
  '.cm-tooltip': {
    backgroundColor: '#fff',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li': {
      padding: '4px 8px',
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: '#4361ee',
      color: '#fff',
    },
  },
  '.cm-searchMatch': {
    backgroundColor: '#fff3bf',
    outline: '1px solid #ffd43b',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#ffe066',
  },
  '.cm-panels': {
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
  },
  '.cm-panels input, .cm-panels button': {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
  },
}, { dark: false })

const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1a1a2e',
    color: '#e0e0e0',
    fontSize: '13px',
    fontFamily: "'JetBrains Mono', monospace",
  },
  '.cm-content': {
    caretColor: '#748ffc',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#748ffc',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#364fc7 !important',
  },
  '.cm-gutters': {
    backgroundColor: '#16213e',
    color: '#495057',
    border: 'none',
    borderRight: '1px solid #2d3a5c',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#1e2d4a',
  },
  '.cm-activeLine': {
    backgroundColor: '#1e2d4a',
  },
  '.cm-foldGutter': {
    color: '#495057',
  },
  '.cm-foldPlaceholder': {
    backgroundColor: '#16213e',
    border: '1px solid #2d3a5c',
    color: '#495057',
  },
  '.cm-lintRange-error': {
    backgroundImage: 'none',
    textDecoration: 'wavy underline #ff6b6b',
  },
  '.cm-tooltip': {
    backgroundColor: '#16213e',
    border: '1px solid #2d3a5c',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    color: '#e0e0e0',
  },
  '.cm-tooltip-autocomplete': {
    '& > ul > li': {
      padding: '4px 8px',
    },
    '& > ul > li[aria-selected]': {
      backgroundColor: '#4361ee',
      color: '#fff',
    },
  },
  '.cm-searchMatch': {
    backgroundColor: '#3d2d00',
    outline: '1px solid #e8a317',
  },
  '.cm-searchMatch.cm-searchMatch-selected': {
    backgroundColor: '#5c3d00',
  },
  '.cm-panels': {
    backgroundColor: '#16213e',
    borderBottom: '1px solid #2d3a5c',
    color: '#e0e0e0',
  },
  '.cm-panels input, .cm-panels button': {
    fontFamily: "'Inter', sans-serif",
    fontSize: '13px',
  },
  '.cm-panels input': {
    backgroundColor: '#1a1a2e',
    border: '1px solid #2d3a5c',
    color: '#e0e0e0',
  },
}, { dark: true })

export default function CodeMirrorEditor({ value, onChange, theme, jsonValid }) {
  const editorRef = useRef(null)
  const viewRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)

  // Keep refs in sync
  onChangeRef.current = onChange
  valueRef.current = value

  const jsonLinter = useMemo(() => linter(jsonParseLinter(), { delay: 500 }), [])

  const createExtensions = useCallback((currentTheme) => [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    search({ top: true }),
    json(),
    jsonLinter,
    lintGutter(),
    autocompletion(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    themeCompartment.of(currentTheme === 'dark' ? darkTheme : lightTheme),
    EditorView.lineWrapping,
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...foldKeymap,
      ...completionKeymap,
      indentWithTab,
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newVal = update.state.doc.toString()
        onChangeRef.current(newVal)
      }
    }),
  ], [jsonLinter])

  // Create editor on mount
  useEffect(() => {
    if (!editorRef.current) return

    const state = EditorState.create({
      doc: valueRef.current,
      extensions: createExtensions(theme),
    })

    const view = new EditorView({
      state,
      parent: editorRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update theme when it changes
  useEffect(() => {
    if (!viewRef.current) return
    viewRef.current.dispatch({
      effects: themeCompartment.reconfigure(theme === 'dark' ? darkTheme : lightTheme),
    })
  }, [theme])

  // Update editor content from external changes (reset, file load, etc.)
  useEffect(() => {
    if (!viewRef.current) return
    const currentDoc = viewRef.current.state.doc.toString()
    if (currentDoc !== value) {
      viewRef.current.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      })
    }
  }, [value])

  // Public API: expose view for search, go-to-line, etc.
  const focusEditor = useCallback(() => {
    viewRef.current?.focus()
  }, [])

  const openSearch = useCallback(() => {
    if (!viewRef.current) return
    viewRef.current.focus()
    openSearchPanel(viewRef.current)
  }, [])

  const goToLine = useCallback((line) => {
    if (!viewRef.current) return
    const pos = viewRef.current.state.doc.line(Math.min(line, viewRef.current.state.doc.lines)).from
    viewRef.current.dispatch({
      selection: { anchor: pos },
      scrollIntoView: true,
    })
    viewRef.current.focus()
  }, [])

  // Expose methods
  React.useImperativeHandle?.(React.useRef(null), () => ({
    focusEditor,
    openSearch,
    goToLine,
    getView: () => viewRef.current,
  }))

  return (
    <div className={`cm-editor-container ${jsonValid ? '' : 'has-error'}`}>
      <div ref={editorRef} className="cm-editor-inner" />
    </div>
  )
}
