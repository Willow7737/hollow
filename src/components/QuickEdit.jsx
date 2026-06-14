import React, { useState, useCallback, useMemo } from 'react'
import { FIELD_CATEGORIES, FIELD_MAP } from '../utils/hollowKnightFields.js'
import { getValueAtPath, setValueAtPath } from '../utils/crypto.js'

function QuickEdit({ gameFile, gameFileOriginal, onChange }) {
  const [activeCategory, setActiveCategory] = useState('player')
  const [searchQuery, setSearchQuery] = useState('')

  const parsed = useMemo(() => {
    try { return JSON.parse(gameFile) }
    catch { return null }
  }, [gameFile])

  const parsedOriginal = useMemo(() => {
    try { return JSON.parse(gameFileOriginal) }
    catch { return null }
  }, [gameFileOriginal])

  const handleFieldChange = useCallback((path, value, type) => {
    if (!parsed) return
    let typedValue = value
    if (type === 'number') {
      typedValue = value === '' ? 0 : Number(value)
      if (isNaN(typedValue)) return
    }
    if (type === 'boolean') {
      typedValue = value === 'true' || value === true
    }
    const newObj = setValueAtPath(parsed, path, typedValue)
    const newJson = JSON.stringify(newObj, undefined, 2)
    onChange(newJson)
  }, [parsed, onChange])

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return FIELD_CATEGORIES
    const q = searchQuery.toLowerCase()
    return FIELD_CATEGORIES.map(cat => ({
      ...cat,
      fields: cat.fields.filter(f =>
        f.label.toLowerCase().includes(q) || f.path.toLowerCase().includes(q) || (f.description && f.description.toLowerCase().includes(q))
      ),
    })).filter(cat => cat.fields.length > 0)
  }, [searchQuery])

  if (!parsed) {
    return (
      <div className="quick-edit">
        <div className="quick-edit-header">
          <h3>Quick Edit</h3>
        </div>
        <div className="quick-edit-invalid">
          Fix JSON errors to use Quick Edit
        </div>
      </div>
    )
  }

  return (
    <div className="quick-edit">
      <div className="quick-edit-header">
        <h3>Quick Edit</h3>
      </div>

      <div className="quick-edit-search">
        <input
          type="text"
          placeholder="Search fields..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="quick-edit-search-input"
        />
      </div>

      <div className="quick-edit-tabs">
        {filteredCategories.map(cat => (
          <button
            key={cat.id}
            className={`quick-edit-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
            title={cat.label}
          >
            <span className="tab-icon">{cat.icon}</span>
            <span className="tab-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="quick-edit-fields">
        {filteredCategories
          .filter(cat => cat.id === activeCategory)
          .map(cat => cat.fields.map(field => {
            const currentVal = getValueAtPath(parsed, field.path)
            const originalVal = parsedOriginal ? getValueAtPath(parsedOriginal, field.path) : undefined
            const isChanged = originalVal !== undefined && JSON.stringify(currentVal) !== JSON.stringify(originalVal)

            return (
              <div key={field.path} className={`quick-edit-field ${isChanged ? 'field-changed' : ''}`}>
                <div className="field-label-row">
                  <label className="field-label" title={field.description}>
                    {field.label}
                  </label>
                  {isChanged && <span className="field-changed-badge" title={`Original: ${JSON.stringify(originalVal)}`}>modified</span>}
                </div>
                {field.description && <div className="field-description">{field.description}</div>}
                <FieldInput
                  field={field}
                  value={currentVal}
                  originalValue={originalVal}
                  onChange={(val) => handleFieldChange(field.path, val, field.type)}
                />
                <div className="field-path" title="JSON path">{field.path}</div>
              </div>
            )
          }))
        }
      </div>
    </div>
  )
}

function FieldInput({ field, value, originalValue, onChange }) {
  if (field.type === 'number') {
    return (
      <div className="field-input-row">
        <input
          type="number"
          className="field-input"
          value={value ?? ''}
          min={field.min}
          max={field.max}
          step={1}
          onChange={e => onChange(e.target.value)}
        />
        {field.min !== undefined && field.max !== undefined && (
          <span className="field-range">{field.min}–{field.max}</span>
        )}
      </div>
    )
  }

  if (field.type === 'boolean') {
    return (
      <div className="field-input-row">
        <label className="field-toggle">
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => onChange(e.target.checked)}
          />
          <span className="toggle-slider" />
          <span className="toggle-label">{value ? 'Yes' : 'No'}</span>
        </label>
      </div>
    )
  }

  if (field.type === 'string') {
    return (
      <input
        type="text"
        className="field-input"
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
      />
    )
  }

  // For array/object types, show a summary with expand option
  if (field.type === 'array' || field.type === 'object') {
    const display = value === null || value === undefined
      ? 'null'
      : field.type === 'array'
        ? `Array[${Array.isArray(value) ? value.length : 0}]`
        : `Object{${typeof value === 'object' && value !== null ? Object.keys(value).length : 0}}`
    return (
      <div className="field-input-row">
        <span className="field-composite">{display}</span>
        <span className="field-hint">Edit in JSON editor</span>
      </div>
    )
  }

  return (
    <input
      type="text"
      className="field-input"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
    />
  )
}

export default QuickEdit
