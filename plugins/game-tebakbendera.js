import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakbendera = conn.tebakbendera ? conn.tebakbendera : {}
    let id = m.chat
    
    if (id in conn.tebakbendera) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.tebakbendera[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/tebakbendera', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TEBAK BENDERA* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Soal:* Bendera negara manakah ini?\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await conn.sendMessage(m.chat, { image: { url: data.img }, caption: caption }, { quoted: m })
        
        conn.tebakbendera[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.tebakbendera[id]) {
                    conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.name}\n╰────────────────────── ⋆ ✧`, conn.tebakbendera[id][0])
                    delete conn.tebakbendera[id]
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
    conn.tebakbendera = conn.tebakbendera ? conn.tebakbendera : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TEBAK BENDERA/i.test(m.quoted.text)) return false
    if (!(id in conn.tebakbendera)) return false
    
    if (m.quoted.id == conn.tebakbendera[id][0].id) {
        let json = conn.tebakbendera[id][1]
        // Perhatikan JSON-nya, jawaban ada di parameter "name", bukan "jawaban"
        if (m.text.toLowerCase().trim() === json.name.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.tebakbendera[id][2]
            m.reply(`╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n┊ 🎉 *Jawaban:* ${json.name}\n┊ 🎁 *Bonus:* +${conn.tebakbendera[id][2]} XP\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`)
            clearTimeout(conn.tebakbendera[id][3])
            delete conn.tebakbendera[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['tebakbendera']
handler.tags = ['game']
handler.command = /^(tebakbendera)$/i

export default handler