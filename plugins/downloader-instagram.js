import fetch from 'node-fetch'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link Instagram yang ingin diunduh!\n┊ ☁️ Contoh: *${usedPrefix + command} https://www.instagram.com/p/...*\n╰────────────────────── ⋆ ✧`)
    }

    if (!text.includes('instagram.com')) {
        return m.reply(`⚠️ Link tidak valid! Pastikan itu adalah link dari Instagram.`)
    }

    await m.react('⏳')

    try {
        let apiUrl = `https://api.jagoanproject.com/api/downloader/instagram?url=${encodeURIComponent(text)}`
        let response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer Lynxdecode'
            }
        })
        
        let json = await response.json()

        if (!json.status || !json.result || !json.result.media || !json.result.media.slides) {
            throw new Error("Gagal mengambil data dari server. Pastikan akun tidak diprivate.")
        }

        let slides = json.result.media.slides
        let metadata = json.result.metadata || {}
        let author = json.result.author || {}

        let mediaList = []
        for (let slide of slides) {
            if (slide.videos && slide.videos.length > 0) {
                mediaList.push({ type: 'video', url: slide.videos[0].url })
            } else if (slide.images && slide.images.length > 0) {
                mediaList.push({ type: 'image', url: slide.images[0].url })
            }
        }

        if (mediaList.length === 0) {
            throw new Error("Tidak ada media yang ditemukan pada postingan tersebut.")
        }

        for (let media of mediaList) {
            if (media.type === 'video') {
                await conn.sendMessage(m.chat, { video: { url: media.url } }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { image: { url: media.url } }, { quoted: m })
            }
            await sleep(1500)
        }

        let captionText = `╭── ⋆ ✧ ꒰ 🎀 *IG DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──\n`
        captionText += `┊ 👤 *Username:* @${author.username || 'unknown'}\n`
        if (metadata.likeCount !== undefined) captionText += `┊ ❤️ *Likes:* ${metadata.likeCount}\n`
        if (metadata.commentCount !== undefined) captionText += `┊ 💬 *Comments:* ${metadata.commentCount}\n`
        captionText += `╰────────────────────── ⋆ ✧\n\n`
        
        let originalCaption = metadata.caption ? metadata.caption.trim() : '-'
        captionText += `> 📝 *Caption:*\n${originalCaption}\n\n`
        captionText += `> 🌸 *Li Shiya MD - Downloader* 🌸`

        await conn.sendMessage(m.chat, { text: captionText.trim() }, { quoted: m })

        await m.react('✅')
    } catch (err) {
        console.error(err)
        await m.react('❌')
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses tautan.\n┊ _${err.message || 'API Sedang Down'}_\n╰────────────────────── ⋆ ✧`)
    }
}

handler.help = ['ig', 'instagramdl']
handler.tags = ['downloader']
handler.command = /^(ig|instagramdl)$/i
handler.limit = true

export default handler