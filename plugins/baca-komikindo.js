import fetch from 'node-fetch'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, usedPrefix, command, args, text }) => {
    let action = args[0]?.toLowerCase()

    const showMenu = () => {
        let txt = `╭── ⋆ ✧ ꒰ 🎀 *KOMIKINDO API* 🎀 ꒱ ✧ ⋆ ──\n`
        txt += `┊ 🌸 *Daftar Perintah:*\n`
        txt += `┊ ➭ *${usedPrefix + command} search <judul>* (Cari komik)\n`
        txt += `┊ ➭ *${usedPrefix + command} detail <url>* (Cek detail & chapter komik)\n`
        txt += `┊ ➭ *${usedPrefix + command} read <url_chapter>* (Baca komik per chapter)\n`
        txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Baca Komik* 🌸`
        return m.reply(txt)
    }

    if (!action) return showMenu()
    await m.react('⏳')

    try {
        if (action === 'search') {
            let query = args.slice(1).join(' ')
            if (!query) return m.reply(`⚠️ Masukkan judul komik! Contoh: *${usedPrefix + command} search solo leveling*`)

            let res = await fetch(`https://api.siputzx.my.id/api/anime/komikindo-search?query=${encodeURIComponent(query)}`)
            let json = await res.json()

            if (!json.status || !json.data || json.data.length === 0) throw new Error('Komik tidak ditemukan.')

            let txt = `╭── ⋆ ✧ ꒰ 🎀 *KOMIKINDO SEARCH* 🎀 ꒱ ✧ ⋆ ──\n`
            txt += `┊ 🔍 *Pencarian:* ${query}\n`
            txt += `╰────────────────────── ⋆ ✧\n\n`

            json.data.slice(0, 10).forEach((v, i) => {
                let judul = v.title || v.href.split('/komik/')[1].replace(/\//g, '').replace(/-/g, ' ')
                txt += `> 🎀 *${i + 1}. ${judul.toUpperCase()}*\n`
                txt += `> ⭐ *Rating:* ${v.rating || 'N/A'}\n`
                txt += `> 🔗 *URL:* ${v.href}\n\n`
            })
            txt += `> 🌸 *Gunakan perintah detail untuk melihat chapter komik.*`

            let img = json.data[0]?.image
            if (img && img.startsWith('http')) {
                await conn.sendMessage(m.chat, { image: { url: img }, caption: txt.trim() }, { quoted: m })
            } else {
                await m.reply(txt.trim())
            }

        } else if (action === 'detail') {
            let url = args[1]
            if (!url) return m.reply(`⚠️ Masukkan link komik! Contoh: *${usedPrefix + command} detail https://komikindo.ch/komik/...*`)

            let res = await fetch(`https://api.siputzx.my.id/api/anime/komikindo-detail?url=${encodeURIComponent(url)}`)
            let json = await res.json()

            if (!json.status || !json.data) throw new Error('Detail komik tidak ditemukan.')

            let d = json.data
            let txt = `╭── ⋆ ✧ ꒰ 🎀 *KOMIKINDO DETAIL* 🎀 ꒱ ✧ ⋆ ──\n`
            txt += `┊ 🌸 *Judul:* ${d.title.replace(/\n\s+/g, ' ')}\n`
            txt += `┊ 👤 *Author:* ${d.author || '-'}\n`
            txt += `┊ 📊 *Status:* ${d.status || '-'}\n`
            txt += `┊ 🎭 *Genre:* ${d.genre ? d.genre.join(', ') : '-'}\n`
            txt += `╰────────────────────── ⋆ ✧\n\n`
            txt += `> 📝 *Sinopsis:*\n${d.description.replace(/\n\s+/g, ' ')}\n\n`

            if (d.chapters && d.chapters.length > 0) {
                txt += `> 📖 *Daftar Chapter Terakhir:*\n`
                d.chapters.slice(0, 7).forEach(v => {
                    txt += `> ➭ ${v.chapter}\n`
                    txt += `> 🔗 ${v.url}\n\n`
                })
                if (d.chapters.length > 7) txt += `> _...dan ${d.chapters.length - 7} chapter lainnya._\n\n`
            }
            txt += `> 🌸 *Gunakan perintah read untuk membaca chapter.*`

            if (d.imageUrl && d.imageUrl.startsWith('http')) {
                await conn.sendMessage(m.chat, { image: { url: d.imageUrl }, caption: txt.trim() }, { quoted: m })
            } else {
                await m.reply(txt.trim())
            }

        } else if (action === 'read') {
            let url = args[1]
            if (!url) return m.reply(`⚠️ Masukkan link chapter! Contoh: *${usedPrefix + command} read https://komikindo.ch/solo-leveling-chapter-1/*`)

            let res = await fetch(`https://api.siputzx.my.id/api/anime/komikindo-download?url=${encodeURIComponent(url)}`)
            let json = await res.json()

            if (!json.status || !json.data || json.data.length === 0) throw new Error('Gagal mengambil gambar chapter.')

            await m.reply(`⏳ _Sedang mendownload ${json.data.length} gambar chapter... (Mohon tunggu)_`)

            for (let i = 0; i < json.data.length; i++) {
                let imgUrl = json.data[i]
                try {
                    await conn.sendMessage(m.chat, { image: { url: imgUrl } }, { quoted: m })
                    await sleep(1500) 
                } catch (e) {
                    console.error(`Gagal mengirim gambar ${i+1}:`, e)
                }
            }
            
            await m.reply(`✅ Selesai mengirim ${json.data.length} gambar chapter.`)

        } else {
            showMenu()
        }

        await m.react('✅')
    } catch (err) {
        console.error(err)
        await m.react('❌')
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses permintaan.\n┊ _${err.message || 'API Sedang Down'}_\n╰────────────────────── ⋆ ✧`)
    }
}

handler.help = ['komikindo <opsi>']
handler.tags = ['baca']
handler.command = /^(komikindo)$/i
handler.limit = true

export default handler