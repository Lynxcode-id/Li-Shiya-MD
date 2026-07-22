import fetch from 'node-fetch'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, usedPrefix, command, args, text }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link yang ingin diunduh!\n┊ ☁️ Contoh: *${usedPrefix + command} https://vt.tiktok.com/... mp4*\n╰────────────────────── ⋆ ✧`)
    }

    let url = args[0]
    let format = text.toLowerCase().includes('mp3') ? 'mp3' : 'mp4'

    await m.react('⏳')

    try {
        let apiUrl = `https://api.azbry.com/api/download/allinonev2?url=${encodeURIComponent(url)}&format=${format}`
        let response = await fetch(apiUrl)
        let json = await response.json()

        if (!json.status || !json.result || !json.result.downloads) {
            throw new Error("Gagal mengambil data dari server. Pastikan link valid dan postingan tidak diprivate.")
        }

        let data = json.result
        let downloads = data.downloads
        let mediaToSend = []

        if (format === 'mp3') {
            let mp3Data = downloads.find(v => v.label.toLowerCase().includes('mp3') || v.label.toLowerCase().includes('audio'))
            if (mp3Data) mediaToSend.push({ type: 'audio', url: mp3Data.url })
        } else {
            let mp4Data = downloads.filter(v => !v.label.toLowerCase().includes('mp3') && !v.label.toLowerCase().includes('audio'))
            
            for (let v of mp4Data) {
                let mediaType = 'video'
                try {
                    let res = await fetch(v.url, { method: 'HEAD', timeout: 3000 })
                    let cType = res.headers.get('content-type')
                    if (cType && cType.includes('image')) {
                        mediaType = 'image'
                    }
                } catch (e) {
                    if (v.url.match(/\.(jpeg|jpg|png|webp)/i) || v.label.toLowerCase().match(/(image|photo|gambar)/i)) {
                        mediaType = 'image'
                    }
                }
                mediaToSend.push({ type: mediaType, url: v.url })
            }
        }

        if (mediaToSend.length === 0) {
            throw new Error("Media tidak ditemukan sesuai format yang diminta.")
        }

        for (let media of mediaToSend) {
            if (media.type === 'audio') {
                await conn.sendMessage(m.chat, { audio: { url: media.url }, mimetype: 'audio/mpeg' }, { quoted: m })
            } else if (media.type === 'video') {
                await conn.sendMessage(m.chat, { video: { url: media.url } }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { image: { url: media.url } }, { quoted: m })
            }
            await sleep(1500)
        }

        let captionText = `╭── ⋆ ✧ ꒰ 🎀 *AIO DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──\n`
        if (data.title) captionText += `┊ 📝 *Title:* ${data.title}\n`
        if (data.owner) captionText += `┊ 👤 *Owner:* ${data.owner}\n`
        captionText += `╰────────────────────── ⋆ ✧\n\n`
        captionText += `> 🌸 *Li Shiya MD - Downloader* 🌸`

        await conn.sendMessage(m.chat, { text: captionText.trim() }, { quoted: m })

        await m.react('✅')
    } catch (err) {
        console.error(err)
        await m.react('❌')
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses tautan.\n┊ _${err.message || 'API Sedang Down'}_\n╰────────────────────── ⋆ ✧`)
    }
}

handler.help = ['aio2 <url> [mp4/mp3]']
handler.tags = ['downloader']
handler.command = /^(aio2)$/i
handler.limit = true

export default handler