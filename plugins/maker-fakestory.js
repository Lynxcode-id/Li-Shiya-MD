/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Fake Story Maker
 */

import fetch from 'node-fetch';
import uploadImage from '../lib/uploadImage.js';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image/i.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Reply gambar untuk dijadikan avatar!\n┊ ☁️ Format: *${usedPrefix + command} username | caption*\n╰────────────────────── ⋆ ✧`);
    }

    let [username, ...captionArr] = text.split('|');
    let caption = captionArr.join('|') || 'Living my best life! ✨';

    if (!username) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username!\n┊ ☁️ Format: *${usedPrefix + command} username | caption*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let mediaBuffer = await q.download();
        let avatarUrl = await uploadImage(mediaBuffer);

        const apiUrl = `https://anabot.my.id/api/maker/generateFakeStory?caption=${encodeURIComponent(caption)}&username=${encodeURIComponent(username.trim())}&avatar=${encodeURIComponent(avatarUrl)}&apikey=freeApikey`;
        
        const response = await fetch(apiUrl);
        const buffer = await response.buffer();

        await conn.sendMessage(m.chat, { 
            image: buffer, 
            caption: `╭── ⋆ ✧ ꒰ 🎀 *FAKE STORY MAKER* 🎀 ꒱ ✧ ⋆ ──\n┊ ✨ *User* : ${username.trim()}\n┊ 📝 *Caption* : ${caption}\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Maker* 🌸` 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat story:\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['fakestory <username> | <caption|>'];
handler.tags = ['maker'];
handler.command = /^(fakestory)$/i;
handler.limit = true;

export default handler;