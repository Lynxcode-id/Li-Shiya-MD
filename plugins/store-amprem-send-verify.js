import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    let action = args[0]?.toLowerCase()
    let apikey = 'dkf_51b8fbd1'
    let baseUrl = 'https://am-prem.vxz.my.id/' 

    if (!action || !['send', 'verify'].includes(action)) {
        let info = `╭── ⋆ ✧ ꒰ 🎀 *INFO AKUN PREMIUM* 🎀 ꒱ ✧ ⋆ ──\n`
        info += `┊ 🌸 *Penggunaan:* ${usedPrefix + command} <send/verify> <email> [link]\n┊\n`
        info += `┊ ☁️ *Contoh Send:* ${usedPrefix + command} send shiya@gmail.com\n`
        info += `┊ ☁️ *Contoh Verify:* ${usedPrefix + command} verify shiya@gmail.com https://...\n┊\n`
        info += `┊ ⚠️ *Catatan:* Setiap hari cuma bisa create nge premiumin akun\n`
        info += `┊ 5/menit, lebih dari itu akan terkena rate limit!\n`
        info += `╰────────────────────── ⋆ ✧`
        return m.reply(info)
    }

    await m.react('⏳')

    try {
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        }

        if (action === 'send') {
            let email = args[1]
            if (!email) return m.reply(`⚠️ Masukkan email! Contoh: *${usedPrefix + command} send shiya@gmail.com*`)

            let apiUrl = `${baseUrl}/api/send?email=${encodeURIComponent(email)}&apikey=${apikey}`
            let res = await fetch(apiUrl, { headers })
            let json = await res.json()

            let caption = `╭── ⋆ ✧ ꒰ 🎀 *PREMIUM SEND* 🎀 ꒱ ✧ ⋆ ──\n`
            caption += `┊ 📧 *Email:* ${email}\n`
            caption += `┊ 📊 *Status:* ${json.message || json.status || 'Berhasil dikirim'}\n`
            caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Premium System* 🌸`
            
            await m.reply(caption.trim())
            await m.react('✅')

        } else if (action === 'verify') {
            let email = args[1]
            let link = args.slice(2).join(' ')
            
            if (!email || !link) return m.reply(`⚠️ Masukkan email dan link! Contoh: *${usedPrefix + command} verify shiya@gmail.com https://...*`)

            let apiUrl = `${baseUrl}/api/verify?email=${encodeURIComponent(email)}&link=${encodeURIComponent(link)}&apply=true&apikey=${apikey}`
            let res = await fetch(apiUrl, { headers })
            let json = await res.json()

            let caption = `╭── ⋆ ✧ ꒰ 🎀 *PREMIUM VERIFY* 🎀 ꒱ ✧ ⋆ ──\n`
            caption += `┊ 📧 *Email:* ${email}\n`
            caption += `┊ 📊 *Status:* ${json.message || json.status || 'Berhasil diverifikasi'}\n`
            caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Premium System* 🌸`
            
            await m.reply(caption.trim())
            await m.react('✅')
        }
    } catch (err) {
        console.error(err)
        await m.react('❌')
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses permintaan.\n┊ _Mungkin kena rate limit (5/menit) atau domain belum diubah!_\n╰────────────────────── ⋆ ✧`)
    }
}

handler.help = ['amprem <send/verify>']
handler.tags = ['store']
handler.command = /^(amprem)$/i
handler.premium = true

export default handler