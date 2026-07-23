import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakpahlawan = conn.tebakpahlawan ? conn.tebakpahlawan : {}
    let id = m.chat
    
    if (id in conn.tebakpahlawan) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.tebakpahlawan[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/tebakpahlawan', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TEBAK PAHLAWAN* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Soal:* Siapakah pahlawan ini?\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await conn.sendMessage(m.chat, { image: { url: data.img }, caption: caption }, { quoted: m })
        
        conn.tebakpahlawan[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.tebakpahlawan[id]) {
                    conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.nama}\n╰────────────────────── ⋆ ✧`, conn.tebakpahlawan[id][0])
                    delete conn.tebakpahlawan[id]
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
    conn.tebakpahlawan = conn.tebakpahlawan ? conn.tebakpahlawan : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TEBAK PAHLAWAN/i.test(m.quoted.text)) return false
    if (!(id in conn.tebakpahlawan)) return false
    
    if (m.quoted.id == conn.tebakpahlawan[id][0].id) {
        let json = conn.tebakpahlawan[id][1]
        // Ingat, key nya json.nama
        if (m.text.toLowerCase().trim() === json.nama.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.tebakpahlawan[id][2]
            
            let txt = `╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n`
            txt += `┊ 🎉 *Jawaban:* ${json.nama}\n`
            txt += `┊ 🎁 *Bonus:* +${conn.tebakpahlawan[id][2]} XP\n`
            txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
            
            m.reply(txt)
            clearTimeout(conn.tebakpahlawan[id][3])
            delete conn.tebakpahlawan[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['tebakpahlawan']
handler.tags = ['game']
handler.command = /^(tebakpahlawan)$/i

export default handler