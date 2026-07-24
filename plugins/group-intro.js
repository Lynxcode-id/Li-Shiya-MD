let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isOwner }) => {
    global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    let chat = global.db.data.chats[m.chat]

    let cmd = command.toLowerCase()

    if (cmd === 'setintro') {
        if (!isAdmin && !isOwner) {
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AKSES DITOLAK* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Hanya Admin atau Owner yang bisa mengatur intro!\n╰────────────────────── ⋆ ✧')
        }
        if (chat.intro) {
            return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Intro grup sudah terpasang!\n┊ ☁️ Hapus intro lama terlebih dahulu dengan mengetik *${usedPrefix}delintro*\n╰────────────────────── ⋆ ✧`)
        }
        if (!text) {
            return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan teks untuk intro grup!\n┊ ☁️ Contoh: *${usedPrefix}setintro* Halo semua, namaku...\n╰────────────────────── ⋆ ✧`)
        }
        
        chat.intro = text
        return m.reply('╭── ⋆ ✧ ꒰ 🎀 *SET INTRO* 🎀 ꒱ ✧ ⋆ ──\n┊ ✨ Intro grup berhasil disimpan!\n┊ ☁️ Anggota sekarang bisa mengetik /intro untuk melihatnya.\n╰────────────────────── ⋆ ✧')
    }

    if (cmd === 'delintro' || cmd === 'hapusintro') {
        if (!isAdmin && !isOwner) {
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AKSES DITOLAK* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Hanya Admin atau Owner yang bisa menghapus intro!\n╰────────────────────── ⋆ ✧')
        }
        if (!chat.intro) {
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Grup ini belum memiliki intro yang di-set.\n╰────────────────────── ⋆ ✧')
        }
        
        delete chat.intro
        return m.reply('╭── ⋆ ✧ ꒰ 🎀 *DEL INTRO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🗑️ Intro grup lama berhasil dihapus!\n┊ ☁️ Silakan set intro baru dengan /setintro\n╰────────────────────── ⋆ ✧')
    }

    if (cmd === 'intro') {
        if (!chat.intro) {
            return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Admin belum mengatur intro untuk grup ini.\n╰────────────────────── ⋆ ✧`)
        }
        
        let txt = `╭── ⋆ ✧ ꒰ 🎀 *INTRO GRUP* 🎀 ꒱ ✧ ⋆ ──\n`
        txt += `┊\n`
        txt += `${chat.intro.split('\n').map(v => `┊ ${v}`).join('\n')}\n`
        txt += `┊\n`
        txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Group Management* 🌸`
        
        return m.reply(txt)
    }
}

handler.help = ['intro', 'setintro <teks>', 'delintro']
handler.tags = ['group']
handler.command = /^(setintro|delintro|hapusintro|intro)$/i
handler.group = true

export default handler