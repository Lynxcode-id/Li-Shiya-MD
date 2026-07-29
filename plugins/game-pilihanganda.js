import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.pilihanganda = conn.pilihanganda ? conn.pilihanganda : {}
    let id = m.chat
    
    if (id in conn.pilihanganda) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.pilihanganda[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        }
        
        let res = await fetch('https://api.ikyyxd.my.id/games/pilihanganda', { headers })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *PILIHAN GANDA* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Kategori:* ${data.category}\n`
        caption += `┊ 📝 *Soal:* ${data.question}\n`
        caption += `┊\n`
        caption += `┊ *A.* ${data.options.a}\n`
        caption += `┊ *B.* ${data.options.b}\n`
        caption += `┊ *C.* ${data.options.c}\n`
        caption += `┊ *D.* ${data.options.d}\n`
        caption += `┊\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
        caption += `┊ ☁️ *Balas pesan ini dengan A/B/C/D untuk menjawab!*\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await m.reply(caption)
        
        conn.pilihanganda[id] = [
            msg,
            data,
            poin,
            setTimeout(() => {
                if (conn.pilihanganda[id]) {
                    conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.answer.toUpperCase()}\n╰────────────────────── ⋆ ✧`, conn.pilihanganda[id][0])
                    delete conn.pilihanganda[id]
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
    conn.pilihanganda = conn.pilihanganda ? conn.pilihanganda : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/PILIHAN GANDA/i.test(m.quoted.text)) return false
    if (!(id in conn.pilihanganda)) return false
    
    if (m.quoted.id == conn.pilihanganda[id][0].id) {
        let json = conn.pilihanganda[id][1]
        let answer = m.text.toLowerCase().trim()
        
        if (answer === json.answer.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.pilihanganda[id][2]
            m.reply(`╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n┊ 🎉 *Jawaban:* ${json.answer.toUpperCase()} (${json.options[json.answer.toLowerCase()]})\n┊ 🎁 *Bonus:* +${conn.pilihanganda[id][2]} XP\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`)
            clearTimeout(conn.pilihanganda[id][3])
            delete conn.pilihanganda[id]
        } else if (['a', 'b', 'c', 'd'].includes(answer)) {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['pilihanganda']
handler.tags = ['game']
handler.command = /^(pilihanganda)$/i

export default handler