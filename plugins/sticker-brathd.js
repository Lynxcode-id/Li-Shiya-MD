/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Brat HD Sticker (Li Shiya UI & Starseal)
 */

import fetch from 'node-fetch';
import { create } from '@itsliaaa/starseal';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let txt = text || (m.quoted ? m.quoted.text : '');
    
    if (!txt) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan teks untuk dibuat Brat!\n┊ ☁️ Contoh: *${usedPrefix + command} halo dunia*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const query = encodeURIComponent(txt);
        const apiUrl = `https://api-faa.my.id/faa/brathd?text=${query}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Gagal mengambil gambar dari API.");
        
        const rawBuffer = Buffer.from(await response.arrayBuffer());
        const stickerBuffer = await create(rawBuffer, {
            packName: global.stickpack || 'Brat HD',
            publisherName: global.stickauth || 'Li Shiya MD'
        }).toBuffer();

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
        await m.react('✅');

    } catch (err) {
        console.error('[BRAT HD ERROR]', err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses stiker Brat.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['brathd <teks>'];
handler.tags = ['sticker'];
handler.command = /^(brathd)$/i;
handler.limit = true;

export default handler;