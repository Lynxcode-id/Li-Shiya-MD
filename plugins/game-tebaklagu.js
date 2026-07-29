import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {}
    let id = m.chat
    
    if (id in conn.tebaklagu) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.tebaklagu[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/tebaklagu', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TEBAK LAGU* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Penyanyi / Artis:* ${data.artis}\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        // Kirim teksnya dulu biar bisa di-reply pengguna
        let msg = await m.reply(caption)
        
        // Baru kirim audionya dengan nge-quote pesan teks tadi
        await conn.sendMessage(m.chat, { audio: { url: data.lagu }, mimetype: 'audio/mpeg' }, { quoted: msg })
        
        conn.tebaklagu[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.tebaklagu[id]) {
                    conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.judul}\n╰────────────────────── ⋆ ✧`, conn.tebaklagu[id][0])
                    delete conn.tebaklagu[id]
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
    conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TEBAK LAGU/i.test(m.quoted.text)) return false
    if (!(id in conn.tebaklagu)) return false
    
    if (m.quoted.id == conn.tebaklagu[id][0].id) {
        let json = conn.tebaklagu[id][1]
        if (m.text.toLowerCase().trim() === json.judul.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.tebaklagu[id][2]
            
            let txt = `╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n`
            txt += `┊ 🎉 *Jawaban:* ${json.judul}\n`
            txt += `┊ 👤 *Artis:* ${json.artis}\n`
            txt += `┊ 🎁 *Bonus:* +${conn.tebaklagu[id][2]} XP\n`
            txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
            
            m.reply(txt)
            clearTimeout(conn.tebaklagu[id][3])
            delete conn.tebaklagu[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['tebaklagu']
handler.tags = ['game']
handler.command = /^(tebaklagu)$/i

export default handler