// Hollow Knight save file encryption/decryption utilities
// Ported from @KayDeeTee's Hollow Knight Save Manager

import { ModeOfOperation as aes } from 'aes-js'
import * as base64 from './base64.js'

const CSHARP_HEADER = [0, 1, 0, 0, 0, 255, 255, 255, 255, 1, 0, 0, 0, 0, 0, 0, 0, 6, 1, 0, 0, 0]
const AES_KEY = stringToBytes('UKu52ePUBwetZ9wNX88o54dnfKRu0T1l')
const ecb = new aes.ecb(AES_KEY)

export function stringToBytes(string) {
  return new TextEncoder().encode(string)
}

export function bytesToString(bytes) {
  return new TextDecoder().decode(bytes)
}

// AES-ECB decrypt with PKCS7 padding removal
export function aesDecrypt(bytes) {
  let data = ecb.decrypt(bytes)
  data = data.subarray(0, -data[data.length - 1])
  return data
}

// PKCS7 pad then AES-ECB encrypt
export function aesEncrypt(bytes) {
  const padValue = 16 - bytes.length % 16
  const padded = new Uint8Array(bytes.length + padValue)
  padded.fill(padValue)
  padded.set(bytes)
  return ecb.encrypt(padded)
}

// LengthPrefixedString — https://msdn.microsoft.com/en-us/library/cc236844.aspx
function generateLengthPrefixedString(length) {
  let len = Math.min(0x7FFFFFFF, length)
  const bytes = []
  for (let i = 0; i < 4; i++) {
    if (len >> 7 !== 0) {
      bytes.push(len & 0x7F | 0x80)
      len >>= 7
    } else {
      bytes.push(len & 0x7F)
      len >>= 7
      break
    }
  }
  if (len !== 0) {
    bytes.push(len)
  }
  return bytes
}

export function addHeader(bytes) {
  const lengthData = generateLengthPrefixedString(bytes.length)
  const newBytes = new Uint8Array(bytes.length + CSHARP_HEADER.length + lengthData.length + 1)
  newBytes.set(CSHARP_HEADER)
  newBytes.subarray(CSHARP_HEADER.length).set(lengthData)
  newBytes.subarray(CSHARP_HEADER.length + lengthData.length).set(bytes)
  newBytes.subarray(CSHARP_HEADER.length + lengthData.length + bytes.length).set([11])
  return newBytes
}

export function removeHeader(bytes) {
  bytes = bytes.subarray(CSHARP_HEADER.length, bytes.length - 1)
  let lengthCount = 0
  for (let i = 0; i < 5; i++) {
    lengthCount++
    if ((bytes[i] & 0x80) === 0) {
      break
    }
  }
  bytes = bytes.subarray(lengthCount)
  return bytes
}

export function decode(bytes) {
  bytes = bytes.slice()
  bytes = removeHeader(bytes)
  bytes = base64.decode(bytes)
  bytes = aesDecrypt(bytes)
  return bytesToString(bytes)
}

export function encode(jsonString) {
  let bytes = stringToBytes(jsonString)
  bytes = aesEncrypt(bytes)
  bytes = base64.encode(bytes)
  return addHeader(bytes)
}

export function hash(string) {
  return string.split('').reduce((a, b) => {
    return ((a << 5) - a) + b.charCodeAt(0)
  }, 0)
}

function round(value, precision) {
  const multi = Math.pow(10, precision)
  return Math.round(value * multi) / multi
}

export function humanTime(date) {
  const minutes = (new Date() - date) / 1000 / 60
  const hours = minutes / 60
  const days = hours / 24
  const weeks = days / 7
  const months = weeks / 4
  const years = months / 12

  if (minutes < 1) return 'just now'
  if (minutes < 120) return `about ${round(minutes, 0)} minutes ago`
  if (hours < 48) return `about ${round(hours, 0)} hours ago`
  if (days < 14) return `about ${round(days, 0)} days ago`
  if (weeks < 8) return `about ${round(weeks, 0)} weeks ago`
  if (months < 24) return `about ${round(months, 1)} months ago`
  return `about ${round(years, 1)} years ago`
}

export function downloadData(data, fileName) {
  const a = document.createElement('a')
  a.setAttribute('href', window.URL.createObjectURL(new Blob([data], { type: 'octet/stream' })))
  a.setAttribute('download', fileName)
  a.setAttribute('style', 'position: fixed; opacity: 0; left: 0; top: 0;')
  document.body.append(a)
  a.click()
  document.body.removeChild(a)
}

// Validate that a string is parseable JSON — returns { valid, error, errorLine }
export function validateJson(str) {
  try {
    JSON.parse(str)
    return { valid: true, error: null, errorLine: null }
  } catch (e) {
    const match = e.message.match(/position (\d+)/)
    let errorLine = null
    if (match) {
      const pos = parseInt(match[1], 10)
      errorLine = str.substring(0, pos).split('\n').length
    }
    return { valid: false, error: e.message, errorLine }
  }
}

// Compute a simple diff between two JSON strings — returns array of changed paths
export function computeDiff(originalStr, currentStr) {
  const changes = []
  try {
    const original = JSON.parse(originalStr)
    const current = JSON.parse(currentStr)
    findChanges(original, current, '', changes)
  } catch {
    // If either is invalid JSON, return empty changes
  }
  return changes
}

function findChanges(original, current, path, changes) {
  if (original === current) return
  if (typeof original !== typeof current || original === null || current === null) {
    changes.push({ path, oldVal: original, newVal: current })
    return
  }
  if (Array.isArray(original)) {
    if (!Array.isArray(current)) {
      changes.push({ path, oldVal: original, newVal: current })
      return
    }
    const maxLen = Math.max(original.length, current.length)
    for (let i = 0; i < maxLen; i++) {
      const itemPath = `${path}[${i}]`
      if (i >= original.length) {
        changes.push({ path: itemPath, oldVal: undefined, newVal: current[i] })
      } else if (i >= current.length) {
        changes.push({ path: itemPath, oldVal: original[i], newVal: undefined })
      } else {
        findChanges(original[i], current[i], itemPath, changes)
      }
    }
    return
  }
  if (typeof original === 'object') {
    const allKeys = new Set([...Object.keys(original), ...Object.keys(current)])
    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : key
      if (!(key in original)) {
        changes.push({ path: keyPath, oldVal: undefined, newVal: current[key] })
      } else if (!(key in current)) {
        changes.push({ path: keyPath, oldVal: original[key], newVal: undefined })
      } else {
        findChanges(original[key], current[key], keyPath, changes)
      }
    }
    return
  }
  changes.push({ path, oldVal: original, newVal: current })
}

// Get a value at a dot-path from a parsed JSON object
export function getValueAtPath(obj, path) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = current[part]
  }
  return current
}

// Set a value at a dot-path in a parsed JSON object (returns new object)
export function setValueAtPath(obj, path, value) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  const result = Array.isArray(obj) ? [...obj] : { ...obj }

  if (parts.length === 1) {
    result[parts[0]] = value
    return result
  }

  result[parts[0]] = setValueAtPath(obj[parts[0]], parts.slice(1).join('.'), value)
  return result
}
