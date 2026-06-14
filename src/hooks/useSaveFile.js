import { useState, useCallback, useRef } from 'react'
import { decode, encode, hash, downloadData, validateJson, computeDiff } from '../utils/crypto.js'

const HISTORY_KEY = 'bloodorca@hollow'

export function useSaveFile() {
  const [gameFile, setGameFile] = useState('')
  const [gameFileOriginal, setGameFileOriginal] = useState('')
  const [gameFileName, setGameFileName] = useState('')
  const [editing, setEditing] = useState(false)
  const [switchMode, setSwitchMode] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [jsonError, setJsonError] = useState(null)
  const [jsonValid, setJsonValid] = useState(true)
  const [changes, setChanges] = useState([])
  const fileInputRef = useRef(null)

  const updateValidation = useCallback((str) => {
    const result = validateJson(str)
    setJsonValid(result.valid)
    setJsonError(result.valid ? null : result)
  }, [])

  const updateChanges = useCallback((current, original) => {
    if (original && current !== original) {
      setChanges(computeDiff(original, current))
    } else {
      setChanges([])
    }
  }, [])

  const handleEditorChange = useCallback((newVal) => {
    setGameFile(newVal)
    updateValidation(newVal)
    updateChanges(newVal, gameFileOriginal)
  }, [gameFileOriginal, updateValidation, updateChanges])

  const setGameFileFromJson = useCallback((jsonString, name) => {
    const formatted = JSON.stringify(JSON.parse(jsonString), undefined, 2)
    setGameFile(formatted)
    setGameFileOriginal(formatted)
    setGameFileName(name || 'save.dat')
    setEditing(true)
    setJsonValid(true)
    setJsonError(null)
    setChanges([])
  }, [])

  const handleFileChange = useCallback((files) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const reader = new FileReader()

    if (switchMode) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }

    reader.addEventListener('load', () => {
      try {
        let decrypted = ''
        if (switchMode) {
          decrypted = reader.result
        } else {
          decrypted = decode(new Uint8Array(reader.result))
        }
        const jsonString = JSON.stringify(JSON.parse(decrypted), undefined, 2)
        const h = hash(jsonString)
        removeFromHistory(h)
        addToHistory(jsonString, file.name, h)
        syncHistoryToStorage()
        setGameFileFromJson(jsonString, file.name)
      } catch (err) {
        window.alert(`The file could not be decrypted.\n\nError: ${err.message}`)
        console.warn(err)
      }
      if (fileInputRef.current) fileInputRef.current.value = null
    })
  }, [switchMode, setGameFileFromJson])

  const handleReset = useCallback(() => {
    setGameFile(gameFileOriginal)
    setJsonValid(true)
    setJsonError(null)
    setChanges([])
  }, [gameFileOriginal])

  const handleDownloadEncrypted = useCallback(() => {
    try {
      const data = JSON.stringify(JSON.parse(gameFile))
      const encrypted = encode(data)
      downloadData(encrypted, gameFileName || 'user1.dat')
    } catch (err) {
      window.alert(`Could not parse valid JSON. Reset or fix.\n\nError: ${err.message}`)
    }
  }, [gameFile, gameFileName])

  const handleDownloadSwitch = useCallback(() => {
    try {
      const data = JSON.stringify(JSON.parse(gameFile))
      downloadData(data, 'plain.dat')
    } catch (err) {
      window.alert(`Could not parse valid JSON. Reset or fix.\n\nError: ${err.message}`)
    }
  }, [gameFile])

  const handleFormat = useCallback(() => {
    try {
      const formatted = JSON.stringify(JSON.parse(gameFile), undefined, 2)
      setGameFile(formatted)
      updateValidation(formatted)
      updateChanges(formatted, gameFileOriginal)
    } catch {
      // Can't format invalid JSON
    }
  }, [gameFile, gameFileOriginal, updateValidation, updateChanges])

  const handleMinify = useCallback(() => {
    try {
      const minified = JSON.stringify(JSON.parse(gameFile))
      setGameFile(minified)
      updateValidation(minified)
      updateChanges(minified, gameFileOriginal)
    } catch {
      // Can't minify invalid JSON
    }
  }, [gameFile, gameFileOriginal, updateValidation, updateChanges])

  return {
    gameFile,
    gameFileOriginal,
    gameFileName,
    editing,
    switchMode,
    dragging,
    jsonError,
    jsonValid,
    changes,
    fileInputRef,
    setDragging,
    setSwitchMode,
    handleEditorChange,
    handleFileChange,
    handleReset,
    handleDownloadEncrypted,
    handleDownloadSwitch,
    handleFormat,
    handleMinify,
    setGameFileFromJson,
    setGameFile,
    updateValidation,
    updateChanges,
  }
}

// ——— History helpers ———

function getHistory() {
  const res = localStorage.getItem(HISTORY_KEY)
  const history = res ? JSON.parse(res).history : []
  history.forEach(item => { item.date = new Date(item.date) })
  return history
}

function saveHistory(history) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify({ history }))
  } catch {
    const departed = history[history.length - 1]
    console.error(`localStorage quota reached! Removing "${departed.hash}", the least recent file.`)
    history.pop()
    saveHistory(history)
  }
}

function addToHistory(jsonString, fileName, h) {
  const history = getHistory()
  history.unshift({ date: new Date(), fileName, jsonString, hash: h })
  saveHistory(history)
}

function removeFromHistory(h) {
  const history = getHistory().filter(item => item.hash !== h)
  saveHistory(history)
}

function syncHistoryToStorage() {
  // Already handled by saveHistory
}

export { getHistory, removeFromHistory, addToHistory }
