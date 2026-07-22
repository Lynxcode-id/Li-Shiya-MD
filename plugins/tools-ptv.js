// © INF PROJECT - Erine-MD
// Developed by INF PROJECT | Lynx

let handler = async (m, { conn, command, usedPrefix }) => {
    let video = null

    try {
        if (m.quoted && m.quoted.mtype === 'videoMessage') {
            video = await m.quoted.download()
        } else if (m.mtype === 'videoMessage') {
            video = await m.download()
        }
    } catch (e) {
        return m.reply('❌ Gagal mengambil video')
    }

    if (!video) {
        return m.reply(
            `⚠️ *CARA PAKAI*\n\n` +
            `Reply atau kirim video lalu ketik:\n` +
            `*${usedPrefix}ptv* (Untuk kirim di chat)\n` +
            `*${usedPrefix}ptvch* (Untuk upload ke Channel)`
        )
    }

    await m.react('⏳')
    await m.reply('🕕 Sedang membuat PTV...')

    try {
        let isChannel = command.toLowerCase() === 'ptvch'
        let targetJid = isChannel ? '120363400612665352@newsletter' : m.chat

        await conn.sendMessage(targetJid, {
            video: video,
            mimetype: 'video/mp4',
            gifPlayback: true,
            ptv: true
        }, isChannel ? {} : { quoted: m })

        if (isChannel) {
            await m.reply(`✅ *Sukses mengunggah PTV ke Channel!*\n🔗 *Cek disini:* https://whatsapp.com/channel/`)
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        return m.reply(`❌ Gagal: ${e.message}`)
    }
}

handler.help = ['ptv', 'ptvch']
handler.tags = ['tools']
handler.command = /^(ptv|ptvch|pvideo|circlevideo)$/i
handler.limit = true 
handler.admin = true

export default handler