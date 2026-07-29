/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Sticker Maker
 */

import { create } from '@itsliaaa/starseal';

const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image|video|webp/i.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Kirim atau balas media dengan caption *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const mediaBuffer = await q.download();
        if (!mediaBuffer) throw new Error("Gagal mengunduh media.");

        const stickerBuffer = await create(mediaBuffer, {
            packName: global.stickpack || 'Li Shiya',
            publisherName: global.stickauth || 'Sticker Maker'
        }).toBuffer();

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat stiker.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['sticker', 's', 'tosticker'];
handler.tags = ['sticker'];
handler.command = /^(s|sticker|tosticker)$/i;
handler.limit = true;

export default handler;