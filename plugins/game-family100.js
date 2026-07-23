import fetch from 'node-fetch'

let timeout = 120000

let handler = async (m, { conn, usedPrefix }) => {
    conn.family100 = conn.family100 ? conn.family100 : {}
    let id = m.chat
    
    if (id in conn.family100) {
        return conn.reply(m.chat, '⚠️ Masih ada soal belum terjawab di chat ini!', conn.family100[id][0])
    }
    
    await m.react('⏳')
    
    try {
        let res = await fetch('https://api.jagoanproject.com/api/game/family100', {
            headers: { 'Authorization': 'Bearer Lynxdecode' }
        })
        let json = await res.json()
        
        if (!json.status || !json.result) throw new Error('API Error')
        
        let data = json.result
        let poin = Math.floor(Math.random() * 100) + 1
        let terjawab = Array(data.jawaban.length).fill(false)
        
        let board = data.jawaban.map((_, i) => `┊ ${i + 1}. ${terjawab[i] ? data.jawaban[i] : '???'}`).join('\n')
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *FAMILY 100* 🎀 ꒱ ✧ ⋆ ──\n`
        caption += `┊ 🌸 *Soal:* ${data.soal}\n`
        caption += `┊ ⏱️ *Waktu:* ${(timeout / 1000)} detik\n`
        caption += `┊ 🎁 *Hadiah:* ${poin} XP per jawaban\n`
        caption += `┊ ☁️ *Balas pesan ini untuk menjawab!*\n┊\n`
        caption += `${board}\n`
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
        
        let msg = await m.reply(caption)
        
        conn.family100[id] = [
            msg,
            data,
            poin,
            terjawab,
            setTimeout(() => {
                if (conn.family100[id]) {
                    let ans = data.jawaban.map((v, i) => `┊ ${i + 1}. ${v}`).join('\n')
                    let txt = `╭── ⋆ ✧ ꒰ 🎀 *WAKTU HABIS* 🎀 ꒱ ✧ ⋆ ──\n`
                    txt += `┊ 🌸 *Jawaban yang benar:*\n${ans}\n`
                    txt += `╰────────────────────── ⋆ ✧`
                    conn.reply(m.chat, txt, conn.family100[id][0])
                    delete conn.family100[id]
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
    conn.family100 = conn.family100 ? conn.family100 : {}
    let id = m.chat
    
    if (!m.quoted || !m.text || !/FAMILY 100/i.test(m.quoted.text)) return false
    if (!(id in conn.family100)) return false
    
    if (m.quoted.id == conn.family100[id][0].id) {
        let data = conn.family100[id][1]
        let poin = conn.family100[id][2]
        let terjawab = conn.family100[id][3]
        
        let ansText = m.text.toLowerCase().trim()
        
        let index = data.jawaban.findIndex(v => {
            let options = v.toLowerCase().split('/').map(x => x.trim())
            return options.includes(ansText)
        })
        
        if (index >= 0) {
            if (terjawab[index]) {
                m.reply('⚠️ *Jawaban itu sudah ditebak!* Cari yang lain.')
            } else {
                terjawab[index] = true
                global.db.data.users[m.sender].exp += poin
                
                let isWin = terjawab.every(v => v)
                let board = data.jawaban.map((v, i) => `┊ ${i + 1}. ${terjawab[i] ? v : '???'}`).join('\n')
                
                if (isWin) {
                    let txt = `╭── ⋆ ✧ ꒰ 🎀 *FAMILY 100 SELESAI* 🎀 ꒱ ✧ ⋆ ──\n`
                    txt += `┊ 🎉 *Luar Biasa! Semua jawaban tertebak!*\n┊\n`
                    txt += `${board}\n┊\n`
                    txt += `┊ 🎁 *Bonus Terakhir:* +${poin} XP\n`
                    txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
                    
                    m.reply(txt)
                    clearTimeout(conn.family100[id][4])
                    delete conn.family100[id]
                } else {
                    let txt = `╭── ⋆ ✧ ꒰ 🎀 *BENAR!* 🎀 ꒱ ✧ ⋆ ──\n`
                    txt += `┊ 🎉 *Jawaban ditemukan!*\n┊\n`
                    txt += `${board}\n┊\n`
                    txt += `┊ 🎁 *Bonus:* +${poin} XP\n`
                    txt += `┊ ☁️ *Balas pesan ini untuk melanjutkan!*\n`
                    txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Game* 🌸`
                    
                    let msg = await m.reply(txt)
                    conn.family100[id][0] = msg 
                }
            }
        } else {
            m.reply('❌ *Salah!* Coba lagi.')
        }
        return true
    }
    return false
}

handler.help = ['family100']
handler.tags = ['game']
handler.command = /^(family100)$/i

export default handler