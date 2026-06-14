// Custom Base64 encode/decode for Uint8Array (Hollow Knight save format)

const BASE64_ARRAY = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('').map(c => c.charCodeAt(0))
const BASE64_ENCODE_TABLE = new Map(BASE64_ARRAY.map((ord, i) => [i, ord]))
const BASE64_DECODE_TABLE = new Map(BASE64_ARRAY.map((ord, i) => [ord, i]))

export function encode(buffer) {
  buffer = new Uint8Array(buffer).slice()
  const output = new Uint8Array(Math.ceil(Math.ceil(buffer.length * 4 / 3) / 4) * 4)
  const continuous = Math.floor(buffer.length / 3) * 3

  for (let i = 0; i < continuous; i += 3) {
    const k = 4 * i / 3
    output[k]     = BASE64_ENCODE_TABLE.get(buffer[i] >> 2)
    output[k + 1] = BASE64_ENCODE_TABLE.get((buffer[i] & 0x03) << 4 | buffer[i + 1] >> 4)
    output[k + 2] = BASE64_ENCODE_TABLE.get((buffer[i + 1] & 0x0F) << 2 | buffer[i + 2] >> 6)
    output[k + 3] = BASE64_ENCODE_TABLE.get(buffer[i + 2] & 0x3F)
  }

  if (buffer[continuous] !== undefined) {
    const k = 4 * continuous / 3
    output[k] = BASE64_ENCODE_TABLE.get(buffer[continuous] >> 2)
    if (buffer[continuous + 1] === undefined) {
      output[k + 1] = BASE64_ENCODE_TABLE.get((buffer[continuous] & 0x03) << 4)
      output[k + 2] = BASE64_ENCODE_TABLE.get(64)
    } else {
      output[k + 1] = BASE64_ENCODE_TABLE.get((buffer[continuous] & 0x03) << 4 | buffer[continuous + 1] >> 4)
      output[k + 2] = BASE64_ENCODE_TABLE.get((buffer[continuous + 1] & 0x0F) << 2)
    }
    output[k + 3] = BASE64_ENCODE_TABLE.get(64)
  }

  return output
}

export function decode(buffer) {
  buffer = new Uint8Array(buffer).slice()
  buffer = buffer.map(v => BASE64_DECODE_TABLE.get(v))
  {
    const p = buffer.indexOf(64)
    buffer = buffer.subarray(0, p !== -1 ? p : buffer.length)
  }
  const output = new Uint8Array(3 * buffer.length / 4)
  const continuous = Math.floor(buffer.length / 4) * 4
  for (let i = 0; i < continuous; i += 4) {
    const k = 3 * i / 4
    output[k]     = buffer[i] << 2 | buffer[i + 1] >> 4
    output[k + 1] = (buffer[i + 1] & 0x0F) << 4 | buffer[i + 2] >> 2
    output[k + 2] = (buffer[i + 2] & 0x03) << 6 | buffer[i + 3]
  }
  if (buffer[continuous] !== undefined) {
    const k = 3 * continuous / 4
    output[k] = buffer[continuous] << 2 | buffer[continuous + 1] >> 4
    if (buffer[continuous + 2] !== undefined) {
      output[k + 1] = (buffer[continuous + 1] & 0x0F) << 4 | buffer[continuous + 2] >> 2
    }
  }
  return output
}
