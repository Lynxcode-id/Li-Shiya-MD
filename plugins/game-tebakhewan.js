import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {}
    let id = m.chat
    
    if (id in conn.tebakhewan) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.tebakhewan[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/tebakhewan', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TEBAK HEWAN* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Soal:* Hewan apakah ini?\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await conn.sendMessage(m.chat, { image: { url: data.img }, caption: caption }, { quoted: m })
        
        conn.tebakhewan[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.tebakhewan[id]) {
                    let txt = `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n`
                    txt += `┊ 🌸 *Jawaban:* ${data.jawaban}\n`
                    if (data.deskripsi && data.deskripsi.toLowerCase() !== data.jawaban.toLowerCase()) {
                        txt += `┊ 💡 *Deskripsi:* ${data.deskripsi}\n`
                    }
                    txt += `╰────────────────────── ⋆ ✧`
                    
                    conn.reply(m.chat, txt, conn.tebakhewan[id][0])
                    delete conn.tebakhewan[id]
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
    conn.tebakhewan = conn.tebakhewan ? conn.tebakhewan : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TEBAK HEWAN/i.test(m.quoted.text)) return false
    if (!(id in conn.tebakhewan)) return false
    
    if (m.quoted.id == conn.tebakhewan[id][0].id) {
        let json = conn.tebakhewan[id][1]
        if (m.text.toLowerCase().trim() === json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.tebakhewan[id][2]
            
            let txt = `╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n`
            txt += `┊ 🎉 *Jawaban:* ${json.jawaban}\n`
            if (json.deskripsi && json.deskripsi.toLowerCase() !== json.jawaban.toLowerCase()) {
                txt += `┊ 💡 *Deskripsi:* ${json.deskripsi}\n`
            }
            txt += `┊ 🎁 *Bonus:* +${conn.tebakhewan[id][2]} XP\n`
            txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
            
            m.reply(txt)
            clearTimeout(conn.tebakhewan[id][3])
            delete conn.tebakhewan[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['tebakhewan']
handler.tags = ['game']
handler.command = /^(tebakhewan)$/i

export default handler