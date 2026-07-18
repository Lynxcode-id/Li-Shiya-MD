import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

// ==========================================
// 1️⃣ Uploader NexRay (Fast & Fresh)
// ==========================================
async function nexray(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' }
  const form = new FormData()
  form.append('file', buffer, { filename: `file.${ext}`, contentType: mime })
  
  const res = await axios.post('https://api.nexray.web.id/upload?ttl=86400', form, {
    headers: form.getHeaders()
  })
  return res.data.result.url
}

// ==========================================
// 2️⃣ Uploader Catbox (Klasik & Stabil)
// ==========================================
async function catbox(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}
  const form = new FormData()
  form.append('fileToUpload', buffer, `file.${ext || 'bin'}`)
  form.append('reqtype', 'fileupload')

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form
  })
  return await res.text()
}

// ==========================================
// 3️⃣ Uploader Uguu (Bisa file gede)
// ==========================================
async function uguu(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin' }
  const form = new FormData()
  form.append('files[]', buffer, `file.${ext}`)

  const res = await axios.post('https://uguu.se/upload', form, {
    headers: form.getHeaders()
  })
  return res.data.files[0].url
}

// ==========================================
// 4️⃣ Uploader Pic.surf
// ==========================================
async function picsurf(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' }
  const form = new FormData()
  form.append('file', buffer, { filename: `file.${ext}`, contentType: mime })
  
  const headers = { ...form.getHeaders(), 'Content-Length': form.getLengthSync() }
  const res = await axios.post('https://www.pic.surf/upload.php', form, { headers })
  return `https://www.pic.surf/${res.data.identifier}`
}

// ==========================================
// 5️⃣ Uploader Tmpfiles (Khusus function uploadFile)
// ==========================================
async function tmpfiles(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || {}
  const form = new FormData()

  form.append('file', buffer, `upload-${Date.now()}.${ext || 'bin'}`)

  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: form,
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0'
    }
  })

  const json = await res.json()
  const match = /https?:\/\/tmpfiles\.org\/(.*)/.exec(json?.data?.url)

  if (!match) throw new Error('Tmpfiles upload gagal')
  return `https://tmpfiles.org/dl/${match[1]}`
}


// 🔥 SISTEM FALLBACK AUTO-BACKUP 🔥

// Ini buat default uploadImage() -> Prioritas gambar/media ringan
async function uploadImage(buffer) {
  const uploaders = [nexray, catbox, uguu, picsurf]
  let lastError = ''

  for (let upload of uploaders) {
    try {
      const url = await upload(buffer)
      if (url && typeof url === 'string' && url.startsWith('http')) return url
    } catch (err) {
      lastError = err.response ? JSON.stringify(err.response.data) : err.message
      console.log(`[ ⚠️ UPLOADER FALLBACK ] ${upload.name} gagal. Pindah ke backup...`)
      continue 
    }
  }
  throw new Error(`Semua server image uploader mati. Error terakhir: ${lastError}`)
}

// Ini buat fungsi uploadFile() -> Prioritas file besar
async function uploadFile(buffer) {
  // Pake tmpfiles dan uguu di urutan atas karena tahan file guede
  const uploaders = [tmpfiles, uguu, catbox, nexray]
  let lastError = ''

  for (let upload of uploaders) {
    try {
      const url = await upload(buffer)
      if (url && typeof url === 'string' && url.startsWith('http')) return url
    } catch (err) {
      lastError = err.response ? JSON.stringify(err.response.data) : err.message
      console.log(`[ ⚠️ FILE FALLBACK ] ${upload.name} gagal. Pindah ke backup...`)
      continue 
    }
  }
  throw new Error(`Semua server file uploader mati. Error terakhir: ${lastError}`)
}

const uploadPomf = uploadFile

// 🚀 EXPORT BAWAAN SCRIPT LU
export default uploadImage
export { uploadFile, uploadPomf }
