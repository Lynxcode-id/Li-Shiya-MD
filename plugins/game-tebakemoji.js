let timeout = 120000

const soalEmoji = [
    { soal: '🕷️ 👨 🕸️ 🏙️', jawaban: 'Spider-Man' },
    { soal: '🚢 🧊 🥶 💔', jawaban: 'Titanic' },
    { soal: '👦 ⚡ 👓 🧙‍♂️', jawaban: 'Harry Potter' },
    { soal: '🐼 🥋 🍜 🐉', jawaban: 'Kungfu Panda' },
    { soal: '🏴‍☠️ 👒 ⚓ 🌊', jawaban: 'One Piece' },
    { soal: '🦊 👦 🍥 🥷', jawaban: 'Naruto' },
    { soal: '🦖 🦕 🏞️ 🚙', jawaban: 'Jurassic Park' },
    { soal: '👽 🚲 🌕 🌌', jawaban: 'ET' },
    { soal: '🦁 👑 🐗 🏜️', jawaban: 'Lion King' },
    { soal: '🤖 🚗 🚛 💥', jawaban: 'Transformers' },
    { soal: '👨‍🚀 🌌 🪐 ⏳', jawaban: 'Interstellar' },
    { soal: '🦸‍♂️ 🦇 🌃 🦇', jawaban: 'Batman' },
    { soal: '🤡 🎈 🌧️ 🛶', jawaban: 'IT' },
    { soal: '🐒 👑 ☁️ 🦯', jawaban: 'Kera Sakti' },
    { soal: '🧞‍♂️ 🐒 🐅 🕌', jawaban: 'Aladdin' }
]

let handler = async (m, { conn, usedPrefix }) => {
    conn.tebakemoji = conn.tebakemoji ? conn.tebakemoji : {}
    let id = m.chat
    
    if (id in conn.tebakemoji) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.tebakemoji[id][0])
    }
    
    let data = soalEmoji[Math.floor(Math.random() * soalEmoji.length)]
    let poin = Math.floor(Math.random() * 100) + 1
    
    let caption = `╭── ⋆ ✧ ꒰ 🎀 *TEBAK EMOJI* 🎀 ꒱ ✧ ⋆ ──\n`
    caption += `┊ 🌸 *Soal:* ${data.soal}\n`
    caption += `┊ 💡 *Clue:* Tebak judul film / anime!\n`
    caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
    caption += `┊ 🎁 *Hadiah:* ${poin} XP\n`
    caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n`
    caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game Offline* 🌸`
    
    let msg = await m.reply(caption)
    
    conn.tebakemoji[id] = [
        msg,
        data,
        poin,
        setTimeout(() => {
            if (conn.tebakemoji[id]) {
                conn.reply(m.chat, `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Jawaban:* ${data.jawaban}\n╰────────────────────── ⋆ ✧`, conn.tebakemoji[id][0])
                delete conn.tebakemoji[id]
            }
        }, timeout)
    ]
    
    await m.react('✅')
}

handler.before = async function (m, { conn }) {
    conn.tebakemoji = conn.tebakemoji ? conn.tebakemoji : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/TEBAK EMOJI/i.test(m.quoted.text)) return false
    if (!(id in conn.tebakemoji)) return false
    
    if (m.quoted.id == conn.tebakemoji[id][0].id) {
        let json = conn.tebakemoji[id][1]
        
        if (m.text.toLowerCase().trim() === json.jawaban.toLowerCase().trim()) {
            global.db.data.users[m.sender].exp += conn.tebakemoji[id][2]
            
            let txt = `╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n`
            txt += `┊ 🎉 *Jawaban:* ${json.jawaban}\n`
            txt += `┊ 🎁 *Bonus:* +${conn.tebakemoji[id][2]} XP\n`
            txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game Offline* 🌸`
            
            m.reply(txt)
            clearTimeout(conn.tebakemoji[id][3])
            delete conn.tebakemoji[id]
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['tebakemoji']
handler.tags = ['game']
handler.command = /^(tebakemoji)$/i

export default handler