import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link TikTok yang ingin diunduh!\n┊ ☁️ Contoh: *${usedPrefix + command} https://vt.tiktok.com/ZSY12345/*\n╰────────────────────── ⋆ ✧`);
    }

    let isTiktok = /tiktok\.com/i.test(text);
    if (!isTiktok) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Link yang kamu berikan bukan link TikTok yang valid!\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let { data } = await axios.get(`https://lynxdecode.my.id/api/downloader/tiktok?url=${encodeURIComponent(text)}`);
        
        if (!data.status || !data.result) {
            throw new Error('Gagal mengambil data dari API.');
        }

        let { author, username, caption, videoUrl, stats } = data.result;

        let txt = `╭── ⋆ ✧ ꒰ 🎀 *TIKTOK DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──\n`;
        txt += `┊ 👤 *Author:* ${author} (@${username})\n`;
        txt += `┊ ❤️ *Likes:* ${stats.diggCount}\n`;
        txt += `┊ 💬 *Comments:* ${stats.commentCount}\n`;
        txt += `┊ 🔁 *Shares:* ${stats.shareCount}\n`;
        txt += `┊ 👁️ *Views:* ${stats.playCount}\n┊\n`;
        txt += `┊ 📝 *Caption:*\n┊ ${caption ? caption.split('\n').join('\n┊ ') : '-'}\n`;
        txt += `╰────────────────────── ⋆ ✧`;

        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl }, 
            caption: txt 
        }, { quoted: m });

        await m.react('✅');
    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat mengunduh video.\n┊ _${e.message || 'Silakan coba beberapa saat lagi.'}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['tthd <url>'];
handler.tags = ['downloader'];
handler.command = /^(tthd)$/i;
handler.limit = true;

export default handler;