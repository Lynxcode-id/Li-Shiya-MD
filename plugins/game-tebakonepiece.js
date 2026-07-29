import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakonepiece = conn.tebakonepiece ? conn.tebakonepiece : {}
    let id = m.chat
    
    if (id in conn.tebakonepiece) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.tebakonepiece[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/tebakonepiece', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TEBAK ONE PIECE* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Soal:* Siapakah karakter One Piece ini?\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await conn.sendMessage(m.chat, { image: { url: data.img }, caption: caption }, { quoted: m })
        
        conn.tebakonepiece[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.tebakonepiece[id]) {
                    conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.jawaban}\n╰────────────────────── ⋆ ✧`, conn.tebakonepiece[id][0])
                    delete conn.tebakonepiece[id]
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
    conn.tebakonepiece = conn.tebakonepiece ? conn.tebakonepiece : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TEBAK ONE PIECE/i.test(m.quoted.text)) return false
    if (!(id in conn.tebakonepiece)) return false
    
    if (m.quoted.id == conn.tebakonepiece[id][0].id) {
        let json = conn.tebakonepiece[id][1]
        if (m.text.toLowerCase().trim() === json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.tebakonepiece[id][2]
            
            let txt = `╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n`
            txt += `┊ 🎉 *Jawaban:* ${json.jawaban}\n`
            txt += `┊ 🎁 *Bonus:* +${conn.tebakonepiece[id][2]} XP\n`
            txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
            
            m.reply(txt)
            clearTimeout(conn.tebakonepiece[id][3])
            delete conn.tebakonepiece[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['tebakonepiece']
handler.tags = ['game']
handler.command = /^(tebakonepiece)$/i

export default handler