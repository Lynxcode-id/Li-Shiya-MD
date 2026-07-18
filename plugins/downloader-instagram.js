/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Instagram Downloader (Li Shiya UI)
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan URL Instagram yang valid!\n┊ ☁️ Contoh: *${usedPrefix + command} https://www.instagram.com/reel/xxxx/*\n╰────────────────────── ⋆ ✧`);
    }

    if (!/instagram\.com/i.test(args[0])) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ URL tidak valid! Harap masukkan link Instagram yang benar.\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const url = args[0];
        const apiUrl = `https://api.jagoanproject.com/api/downloader/instagram?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (!json.status || !json.result) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil data dari Instagram. Pastikan postingan tidak di-private.\n╰────────────────────── ⋆ ✧');
        }

        const { metadata, author, media } = json.result;
        const captionText = metadata.caption || '_Tanpa Caption_';
        const username = author.username || 'Unknown';
        const fullName = author.fullName || 'No Name';
        const likeCount = metadata.likeCount || 0;
        const commentCount = metadata.commentCount || 0;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *INSTAGRAM DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Uploader* : ${fullName} (@${username})
┊ 📝 *Caption* : ${captionText}
┊ ❤️ *Likes* : ${likeCount.toLocaleString()}
┊ 💬 *Comments* : ${commentCount.toLocaleString()}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Instagram Downloader* 🌸`.trim();

        if (metadata.isVideo && media.videos && media.videos.length > 0) {
            const videoUrl = media.videos[0].url;
            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: caption 
            }, { quoted: m });
        } else if (media.thumbnail) {
            await conn.sendMessage(m.chat, { 
                image: { url: media.thumbnail }, 
                caption: caption 
            }, { quoted: m });
        } else {
            throw new Error("Media url tidak ditemukan.");
        }

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses link Instagram tersebut.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['instagram <url>', 'ig <url>', 'igreels <url>'];
handler.tags = ['downloader'];
handler.command = /^(instagram|ig|igreels)$/i;
handler.limit = true;

export default handler;