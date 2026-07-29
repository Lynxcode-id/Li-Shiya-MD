/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Twitter/X Downloader (Li Shiya UI)
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link Twitter/X yang ingin diunduh!\n┊ ☁️ Contoh: *${usedPrefix + command} https://x.com/user/status/xxxx*\n╰────────────────────── ⋆ ✧`);
    }

    if (!/twitter\.com|x\.com/i.test(args[0])) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ URL tidak valid!\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://api.jagoanproject.com/api/downloader/twitter?url=${encodeURIComponent(args[0])}`;
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (!json.status || !json.data) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil data dari Twitter.\n╰────────────────────── ⋆ ✧');
        }

        const data = json.data;
        const media = data.media;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *TWITTER DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Author* : ${data.author.name} (@${data.author.username})
┊ ❤️ *Likes* : ${data.stats.likes}
┊ 🔁 *Retweets* : ${data.stats.retweets}
┊ 💬 *Replies* : ${data.stats.replies}
┊ 🔗 *Source* : ${data.sourceUrl}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Twitter Downloader* 🌸`.trim();

        if (media && media.length > 0) {
            if (media[0].type === 'video') {
                await conn.sendMessage(m.chat, { 
                    video: { url: media[0].url }, 
                    caption: caption 
                }, { quoted: m });
            } else {
                for (let item of media) {
                    await conn.sendMessage(m.chat, { image: { url: item.url } }, { quoted: m });
                }
                await conn.reply(m.chat, caption, m);
            }
        } else {
            throw new Error("Media tidak ditemukan.");
        }

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses link.\n┊ _${e.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['twitter <url>', 'x <url>'];
handler.tags = ['downloader'];
handler.command = /^(twitter|x)$/i;
handler.limit = true;

export default handler;