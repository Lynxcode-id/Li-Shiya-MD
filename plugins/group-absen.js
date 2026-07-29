let handler = async (m, { conn, usedPrefix, command, isAdmin, isOwner }) => {
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    let chat = global.db.data.chats[m.chat]
    chat.absen = chat.absen || { status: false, data: [], date: '' }

    let now = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Makassar' })

    if (chat.absen.date !== now) {
        chat.absen = { status: false, data: [], date: now }
    }

    let cmd = command.toLowerCase()

    if (cmd === 'mulaiabsen' || cmd === 'startabsen') {
        if (!isAdmin && !isOwner) return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AKSES DITOLAK* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Hanya Admin yang bisa memulai absen!\n╰────────────────────── ⋆ ✧')
        if (chat.absen.status) return m.reply('╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Absen sudah aktif di grup ini!\n╰────────────────────── ⋆ ✧')
        
        chat.absen.status = true
        chat.absen.data = []
        chat.absen.date = now
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ABSEN DIMULAI* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Admin telah memulai sesi absen!\n┊ ☁️ Ketik *${usedPrefix}absen* untuk absen.\n╰────────────────────── ⋆ ✧`)
    }

    if (cmd === 'absen') {
        if (!chat.absen.status) return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Sesi absen belum dimulai oleh Admin.\n┊ ☁️ Minta Admin ketik *${usedPrefix}mulaiabsen*\n╰────────────────────── ⋆ ✧`)
        
        if (chat.absen.data.includes(m.sender)) return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Kamu sudah absen hari ini!\n╰────────────────────── ⋆ ✧`)
        
        chat.absen.data.push(m.sender)
        
        let list = chat.absen.data.map((v, i) => `┊ ${i + 1}. @${v.split('@')[0]}`).join('\n')
        let text = `╭── ⋆ ✧ ꒰ 🎀 *LIST ABSEN* 🎀 ꒱ ✧ ⋆ ──\n┊ 📅 *Tanggal:* ${now}\n┊ 👥 *Total:* ${chat.absen.data.length}\n┊\n${list}\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Absensi* 🌸`
        
        return conn.sendMessage(m.chat, { text: text, mentions: chat.absen.data }, { quoted: m })
    }

    if (cmd === 'cekabsen' || cmd === 'listabsen') {
        if (!chat.absen.status) return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Tidak ada sesi absen yang aktif.\n╰────────────────────── ⋆ ✧`)
        
        if (chat.absen.data.length === 0) return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *LIST ABSEN* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Belum ada yang absen hari ini.\n╰────────────────────── ⋆ ✧`)
        
        let list = chat.absen.data.map((v, i) => `┊ ${i + 1}. @${v.split('@')[0]}`).join('\n')
        let text = `╭── ⋆ ✧ ꒰ 🎀 *LIST ABSEN* 🎀 ꒱ ✧ ⋆ ──\n┊ 📅 *Tanggal:* ${now}\n┊ 👥 *Total:* ${chat.absen.data.length}\n┊\n${list}\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Absensi* 🌸`
        
        return conn.sendMessage(m.chat, { text: text, mentions: chat.absen.data }, { quoted: m })
    }

    if (cmd === 'hapusabsen' || cmd === 'stopabsen') {
        if (!isAdmin && !isOwner) return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AKSES DITOLAK* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Hanya Admin yang bisa menghentikan absen!\n╰────────────────────── ⋆ ✧')
        if (!chat.absen.status) return m.reply('╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Tidak ada absen yang sedang berjalan.\n╰────────────────────── ⋆ ✧')
        
        chat.absen.status = false
        chat.absen.data = []
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ABSEN DITUTUP* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Sesi absen telah dihentikan oleh Admin.\n╰────────────────────── ⋆ ✧`)
    }
}

handler.help = ['mulaiabsen', 'absen', 'cekabsen', 'stopabsen']
handler.tags = ['group']
handler.command = /^(mulaiabsen|startabsen|absen|cekabsen|listabsen|hapusabsen|stopabsen)$/i
handler.group = true

export default handler