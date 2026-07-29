import yts from "yt-search";
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `🌸 Mau cari apa di YouTube cuy?\nContoh: *${usedPrefix + command}* everything u are hindia`
    
    await m.react('⏳')

    try {
        let results = await yts(text)
        let tes = results.all
        
        if (!tes || tes.length === 0) throw '❌ Hasil tidak ditemukan.'

        let teks = results.all.map(v => {
            switch (v.type) {
                case "video":
                    return `╭── ꒰ 🎀 *V I D E O* 🎀 ꒱
┊ ➭ 🌸 *Title* : ${v.title}
┊ ➭ 🌸 *Channel* : ${v.author.name}
┊ ➭ 🌸 *Duration* : ${v.timestamp}
┊ ➭ 🌸 *Uploaded* : ${v.ago}
┊ ➭ 🌸 *Views* : ${formatNumber(v.views)}
┊ ➭ 🔗 *URL* : ${v.url}
╰────────────── ⋆ ✧`.trim()
                case "channel":
                case "canal":
                    return `╭── ꒰ 🎀 *C H A N N E L* 🎀 ꒱
┊ ➭ 🌸 *Name* : ${v.name}
┊ ➭ 🌸 *Subs* : ${v.subCountLabel || '-'}
┊ ➭ 🌸 *Videos* : ${v.videoCount || '-'}
┊ ➭ 🔗 *URL* : ${v.url}
╰────────────── ⋆ ✧`.trim()
            }
        }).filter(v => v).join("\n\n")

        let ytthumb = Buffer.alloc(0)
        try {
            const thumbRes = await axios.get(tes[0].thumbnail, { responseType: 'arraybuffer' })
            ytthumb = Buffer.from(thumbRes.data)
        } catch (e) {
            console.error('Gagal ambil thumbnail:', e)
        }

        let sendOptions = {
            caption: `*Y O U T U B E  S E A R C H*\n\n${teks}`,
            contextInfo: {
                mentionedJid: [m.sender],
                isForwarded: true,
                forwardingScore: 9999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: "120363400612665352@newsletter",
                    newsletterName: "🌸 ʟɪ sʜɪʏᴀ ᴍᴅ ᴇsᴍ 🌸",
                    serverMessageId: -1
                }
            }
        }

        if (ytthumb.length > 0) {
            sendOptions.image = ytthumb
        } else {
            sendOptions.image = { url: tes[0].thumbnail }
        }

        await conn.sendMessage(m.chat, sendOptions, { quoted: m })
        await m.react('✨')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Terjadi kesalahan saat mencari di YouTube.')
    }
}

handler.help = ["yts <pencarian>"]
handler.tags = ["search"]
handler.command = /^y(outubesearch|ts(earch)?)$/i
handler.register = true
handler.limit = true

export default handler

function formatNumber(num) {
  if (!num) return '0'
  const suffixes = ['', 'k', 'M', 'B', 'T'];
  const numString = Math.abs(num).toString();
  const numDigits = numString.length;

  if (numDigits <= 3) return numString;

  const suffixIndex = Math.floor((numDigits - 1) / 3);
  let formattedNum = (num / Math.pow(1000, suffixIndex)).toFixed(1);
  
  if (formattedNum.endsWith('.0')) {
    formattedNum = formattedNum.slice(0, -2);
  }

  return formattedNum + suffixes[suffixIndex];
}