/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Gemini 3.1 Flash AI
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let txt = text || (q.text ? q.text : '');

    if (!txt) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan pertanyaan untuk Gemini!\n┊ ☁️ Contoh: *${usedPrefix + command} halo*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const query = encodeURIComponent(txt);
        const apiUrl = `https://api.cmnty.web.id/ai/gemini-3-1-flash?text=${query}&image=`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (!json.status || !json.result) {
            throw new Error("API tidak merespon dengan benar.");
        }

        const aiResponse = json.result.split('\n').join('\n┊ ');

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *GEMINI 3.1 FLASH* 🎀 ꒱ ✧ ⋆ ──
┊ ✨ *Pertanyaan :* 
┊ ${txt}
┊ 
┊ 🎀 *Jawaban :*
┊ ${aiResponse}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - AI* 🌸`.trim();

        await conn.reply(m.chat, caption, m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['gemini <teks>'];
handler.tags = ['ai'];
handler.command = /^(gemini)$/i;
handler.limit = true;

export default handler;