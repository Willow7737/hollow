import React, { useState, useCallback, useMemo } from 'react'

function JsonTree({ data, originalData, onNavigate, expandedPaths, togglePath }) {
  if (data === null || data === undefined) {
    return <div className="tree-empty">No data loaded</div>
  }

  return (
    <div className="json-tree">
      <TreeNode
        name="root"
        value={data}
        originalValue={originalData}
        path=""
        onNavigate={onNavigate}
        expandedPaths={expandedPaths}
        togglePath={togglePath}
        depth={0}
      />
    </div>
  )
}

function TreeNode({ name, value, originalValue, path, onNavigate, expandedPaths, togglePath, depth }) {
  const isExpanded = expandedPaths.has(path || 'root')
  const fullPath = path || 'root'
  const isChanged = originalValue !== undefined && JSON.stringify(value) !== JSON.stringify(originalValue)
  const isRoot = path === ''

  if (value === null) {
    return (
      <TreeLine name={name} path={fullPath} isChanged={isChanged} onNavigate={onNavigate} depth={depth}>
        <span className="tree-value tree-null">null</span>
      </TreeLine>
    )
  }

  if (typeof value === 'boolean') {
    return (
      <TreeLine name={name} path={fullPath} isChanged={isChanged} onNavigate={onNavigate} depth={depth}>
        <span className={`tree-value tree-boolean ${isChanged ? 'changed' : ''}`}>{value.toString()}</span>
      </TreeLine>
    )
  }

  if (typeof value === 'number') {
    return (
      <TreeLine name={name} path={fullPath} isChanged={isChanged} onNavigate={onNavigate} depth={depth}>
        <span className={`tree-value tree-number ${isChanged ? 'changed' : ''}`}>{value}</span>
      </TreeLine>
    )
  }

  if (typeof value === 'string') {
    const display = value.length > 60 ? value.substring(0, 57) + '...' : value
    return (
      <TreeLine name={name} path={fullPath} isChanged={isChanged} onNavigate={onNavigate} depth={depth}>
        <span className={`tree-value tree-string ${isChanged ? 'changed' : ''}`}>"{display}"</span>
      </TreeLine>
    )
  }

  if (Array.isArray(value)) {
    const entries = value
    return (
      <div className="tree-node">
        <TreeLine
          name={name}
          path={fullPath}
          isChanged={isChanged}
          onNavigate={onNavigate}
          depth={depth}
          expandable
          isExpanded={isExpanded}
          onToggle={() => togglePath(fullPath)}
          count={entries.length}
          typeLabel="Array"
        />
        {isExpanded && entries.map((item, i) => (
          <TreeNode
            key={i}
            name={String(i)}
            value={item}
            originalValue={originalValue?.[i]}
            path={`${fullPath}[${i}]`}
            onNavigate={onNavigate}
            expandedPaths={expandedPaths}
            togglePath={togglePath}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value)
    return (
      <div className="tree-node">
        <TreeLine
          name={name}
          path={fullPath}
          isChanged={isChanged}
          onNavigate={onNavigate}
          depth={depth}
          expandable
          isExpanded={isExpanded}
          onToggle={() => togglePath(fullPath)}
          count={entries.length}
          typeLabel="Object"
        />
        {isExpanded && entries.map(([key, val]) => (
          <TreeNode
            key={key}
            name={key}
            value={val}
            originalValue={originalValue?.[key]}
            path={fullPath ? `${fullPath}.${key}` : key}
            onNavigate={onNavigate}
            expandedPaths={expandedPaths}
            togglePath={togglePath}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  return null
}

function TreeLine({ name, path, isChanged, onNavigate, depth, expandable, isExpanded, onToggle, count, typeLabel, children }) {
  return (
    <div
      className={`tree-line ${isChanged ? 'tree-changed' : ''} ${expandable ? 'tree-expandable' : 'tree-leaf'}`}
      style={{ paddingLeft: `${depth * 16 + 4}px` }}
    >
      {expandable ? (
        <button className="tree-toggle" onClick={onToggle} title={isExpanded ? 'Collapse' : 'Expand'}>
          <span className={`tree-arrow ${isExpanded ? 'tree-arrow-open' : ''}`}>▶</span>
        </button>
      ) : (
        <span className="tree-toggle-spacer" />
      )}
      <span className="tree-key" onClick={() => onNavigate(path)} title={`Path: ${path}`}>
        {name}
      </span>
      {expandable && (
        <span className="tree-badge">{typeLabel}({count})</span>
      )}
      {children && <span className="tree-value-container">{children}</span>}
    </div>
  )
}

// Hook to manage expanded paths
export function useJsonTree() {
  const [expandedPaths, setExpandedPaths] = useState(new Set(['root']))

  const togglePath = useCallback((path) => {
    setExpandedPaths(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }, [])

  const expandAll = useCallback((data, prefix = '') => {
    const paths = new Set(['root'])
    function walk(obj, path) {
      if (obj && typeof obj === 'object') {
        paths.add(path || 'root')
        if (Array.isArray(obj)) {
          obj.forEach((item, i) => walk(item, `${path}[${i}]`))
        } else {
          Object.entries(obj).forEach(([key, val]) => {
            const nextPath = path ? `${path}.${key}` : key
            walk(val, nextPath)
          })
        }
      }
    }
    walk(data, prefix)
    setExpandedPaths(paths)
  }, [])

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(['root']))
  }, [])

  return { expandedPaths, togglePath, expandAll, collapseAll }
}

export default JsonTree
