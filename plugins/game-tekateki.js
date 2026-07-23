import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.tekateki = conn.tekateki ? conn.tekateki : {}
    let id = m.chat
    
    if (id in conn.tekateki) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.tekateki[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/tekateki', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TEKA TEKI* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Soal:* ${data.soal}\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await m.reply(caption)
        
        conn.tekateki[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.tekateki[id]) {
                    conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.jawaban}\n╰────────────────────── ⋆ ✧`, conn.tekateki[id][0])
                    delete conn.tekateki[id]
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
    conn.tekateki = conn.tekateki ? conn.tekateki : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TEKA TEKI/i.test(m.quoted.text)) return false
    if (!(id in conn.tekateki)) return false
    
    if (m.quoted.id == conn.tekateki[id][0].id) {
        let json = conn.tekateki[id][1]
        if (m.text.toLowerCase().trim() === json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.tekateki[id][2]
            
            let txt = `╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n`
            txt += `┊ 🎉 *Jawaban:* ${json.jawaban}\n`
            txt += `┊ 🎁 *Bonus:* +${conn.tekateki[id][2]} XP\n`
            txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
            
            m.reply(txt)
            clearTimeout(conn.tekateki[id][3])
            delete conn.tekateki[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['tekateki']
handler.tags = ['game']
handler.command = /^(tekateki)$/i

export default handler