import fetch from 'node-fetch'

let timeout = 120000
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
    conn.butawarna = conn.butawarna ? conn.butawarna : {}
    let id = m.chat
    
    if (id in conn.butawarna) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.butawarna[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/butawarna?random=1', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TES BUTA WARNA* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Soal:* Angka berapa yang ada pada gambar?\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await conn.sendMessage(m.chat, { image: { url: data.img }, caption: caption }, { quoted: m })
        
        conn.butawarna[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.butawarna[id]) {
                    conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.jawaban}\n╰────────────────────── ⋆ ✧`, conn.butawarna[id][0])
                    delete conn.butawarna[id]
                }
            }, timeout)
        ]
        
        await m.react('✅')
    } catch (err) {
        console.error(err)
        await m.react('❌')
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil soal.\n┊ _${err.message || 'API Sedang Down'}_\n╰────────────────────── ⋆ ✧`)
    }
}

handler.before = async function (m, { conn }) {
    conn.butawarna = conn.butawarna ? conn.butawarna : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TES BUTA WARNA/i.test(m.quoted.text)) return false
    if (!(id in conn.butawarna)) return false
    
    if (m.quoted.id == conn.butawarna[id][0].id) {
        let json = conn.butawarna[id][1]
        if (m.text.toLowerCase().trim() === json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.butawarna[id][2]
            m.reply(`╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n┊ 🎉 *Jawaban:* ${json.jawaban}\n┊ 🎁 *Bonus:* +${conn.butawarna[id][2]} XP\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`)
            clearTimeout(conn.butawarna[id][3])
            delete conn.butawarna[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['butawarna']
handler.tags = ['game']
handler.command = /^(butawarna)$/i

export default handler