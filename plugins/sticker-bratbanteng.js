/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Brat Megawati Sticker
 */

import fetch from 'node-fetch';
import { create } from '@itsliaaa/starseal';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let txt = text || (m.quoted ? m.quoted.text : '');
    
    if (!txt) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan teks untuk dibuat Brat!\n┊ ☁️ Contoh: *${usedPrefix + command} menyala abangku*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const query = encodeURIComponent(txt);
        const apiUrl = `https://api.cmnty.web.id/maker/bratmegawati?text=${query}`;
        
        const response = await fetch(apiUrl);
        const contentType = response.headers.get('content-type');
        
        let rawBuffer;
        
        if (contentType && contentType.includes('application/json')) {
            const json = await response.json();
            if (!json.status && !json.result) throw new Error(json.message || "API merespon dengan error.");
            
            let imgUrl = json.url || (json.result && json.result.url) || (typeof json.result === 'string' && json.result.startsWith('http') ? json.result : null);
            
            if (imgUrl) {
                const imgRes = await fetch(imgUrl);
                rawBuffer = Buffer.from(await imgRes.arrayBuffer());
            } else {
                throw new Error("Gagal mengekstrak URL gambar dari response JSON.");
            }
        } else {
            rawBuffer = Buffer.from(await response.arrayBuffer());
        }

        const stickerBuffer = await create(rawBuffer, {
            packName: global.stickpack || 'Li Shiya',
            publisherName: global.stickauth || 'Brat Megawati'
        }).toBuffer();

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses stiker Brat.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['bratmegawati <teks>'];
handler.tags = ['sticker'];
handler.command = /^(bratmegawati|bratbanteng)$/i;
handler.limit = true;

export default handler;