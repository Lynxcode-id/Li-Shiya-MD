/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : HD Image Upscaler (Li Shiya UI)
 */

import fetch from 'node-fetch';
import uploadImage from '../lib/uploadImage.js';

const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image/i.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Balas gambar dengan caption *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const mediaBuffer = await q.download();
        const link = await uploadImage(mediaBuffer);

        const apiUrl = `https://api-faa.my.id/faa/hdv4?image=${encodeURIComponent(link)}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.result?.image_upscaled) {
            throw new Error("Gagal melakukan upscaling gambar.");
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *IMAGE UPSCALE* 🎀 ꒱ ✧ ⋆ ──
┊ ✨ *Upscaling berhasil!*
┊ 
┊ 🔗 *Link* : ${json.result.image_upscaled}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Upscaler* 🌸`.trim();

        await conn.sendMessage(m.chat, { 
            image: { url: json.result.image_upscaled }, 
            caption: caption 
        }, { quoted: m });
        
        await m.react('✅');
    } catch (err) {
        console.error('[UPSCALER ERROR]', err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses gambar:\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['hd2'];
handler.tags = ['image'];
handler.command = /^hd2$/i;
handler.limit = true;

export default handler;