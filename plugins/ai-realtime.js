/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Faa AI Realtime (Li Shiya UI)
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Mau nanya apa nih sama AI?\n┊ ☁️ Contoh: *${usedPrefix + command} sekarang hari apa?*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const query = encodeURIComponent(text);
        const apiUrl = `https://api-faa.my.id/faa/ai-realtime?text=${query}`;
        
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.result) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ AI sedang sibuk atau API bermasalah.\n╰────────────────────── ⋆ ✧');
        }

        // Rapihin baris baru dari AI biar nyatu sama border Li Shiya
        const aiResponse = json.result.split('\n').join('\n┊ ');

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *FAA AI REALTIME* 🎀 ꒱ ✧ ⋆ ──
┊ ✨ *Pertanyaan :* 
┊ ${text}
┊ 
┊ 🎀 *Jawaban :*
┊ ${aiResponse}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - AI* 🌸`.trim();

        await conn.reply(m.chat, caption, m);
        await m.react('✅');

    } catch (e) {
        console.error('[AI FAA ERROR]', e);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n┊ _${e.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['airealtime <teks>', 'ai <teks>'];
handler.tags = ['ai'];
handler.command = /^(airealtime|ai)$/i;
handler.limit = true;

export default handler;