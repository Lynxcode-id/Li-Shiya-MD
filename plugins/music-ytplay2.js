/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : YouTube Music Player (Li Shiya UI - No AdReply)
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan judul lagu yang ingin diputar!\n┊ ☁️ Contoh: *${usedPrefix + command} Alan Walker Alone*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const query = encodeURIComponent(args.join(" "));
        const apiUrl = `https://api.jagoanproject.com/api/search/play?query=${query}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const json = await response.json();

        if (!json.status || !json.result) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Lagu tidak ditemukan atau API bermasalah.\n╰────────────────────── ⋆ ✧');
        }

        const data = json.result;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *MUSIC PLAYER* 🎀 ꒱ ✧ ⋆ ──
┊ 🎵 *Judul* : ${data.title}
┊ 👤 *Artist* : ${data.author}
┊ ⏱️ *Durasi* : ${data.duration}
┊ 🔗 *Source* : ${data.url}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Music Player* 🌸`.trim();

        // 1. Kirim Thumbnail dan Caption
        await conn.sendMessage(m.chat, {
            image: { url: data.thumbnail },
            caption: caption
        }, { quoted: m });

        // 2. Kirim Audio (Tanpa AdReply)
        await conn.sendMessage(m.chat, {
            audio: { url: data.download.url },
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: data.filename
        }, { quoted: m });

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n┊ _${e.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['play2 <query>', 'ytplay2 <query>'];
handler.tags = ['music'];
handler.command = /^(play2|ytplay2)$/i;
handler.limit = true;

export default handler;