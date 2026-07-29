import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakalkitab = conn.tebakalkitab ? conn.tebakalkitab : {}
    let id = m.chat
    
    if (id in conn.tebakalkitab) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.tebakalkitab[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/tebakalkitab', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TEBAK ALKITAB* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Soal:* ${data.soal}\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await m.reply(caption)
        
        conn.tebakalkitab[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.tebakalkitab[id]) {
                    conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.jawaban}\n╰────────────────────── ⋆ ✧`, conn.tebakalkitab[id][0])
                    delete conn.tebakalkitab[id]
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
    conn.tebakalkitab = conn.tebakalkitab ? conn.tebakalkitab : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TEBAK ALKITAB/i.test(m.quoted.text)) return false
    if (!(id in conn.tebakalkitab)) return false
    
    if (m.quoted.id == conn.tebakalkitab[id][0].id) {
        let json = conn.tebakalkitab[id][1]
        if (m.text.toLowerCase().trim() === json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.tebakalkitab[id][2]
            m.reply(`╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n┊ 🎉 *Jawaban:* ${json.jawaban}\n┊ 🎁 *Bonus:* +${conn.tebakalkitab[id][2]} XP\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`)
            clearTimeout(conn.tebakalkitab[id][3])
            delete conn.tebakalkitab[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['tebakalkitab']
handler.tags = ['game']
handler.command = /^(tebakalkitab)$/i

export default handler