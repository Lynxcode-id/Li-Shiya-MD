/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : IQC / iPhone Quote (Li Shiya UI)
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { generateIQC } = require('iqc-canvas');

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let mainText = text ? text : (m.quoted && m.quoted.text ? m.quoted.text : '');

    if (!mainText) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Teksnya mana cuy?\n┊ ☁️ Contoh: *${usedPrefix + command} halo dunia*\n┊ 💡 Atau balas pesan dengan perintah *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let time = new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
        }).replace(':', '.');
        
        let opts = {
            showPlusBtn: true,
            reactionEmojis: ['🤙', '🔥', '😹', '⚡', '😎', '🙈']
        };

        if (text && m.quoted && m.quoted.text) {
            opts.reply = {
                sender: conn.getName(m.quoted.sender) || m.quoted.pushName || 'User',
                text: m.quoted.text
            };
        }

        const result = await generateIQC(mainText, time, opts);

        if (!result.success) throw new Error('Gagal mengeksekusi iqc-canvas.');

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *IQC MAKER* 🎀 ꒱ ✧ ⋆ ──\n┊ ✨ *Sukses membuat quote iOS!*\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Maker* 🌸`;

        await conn.sendMessage(m.chat, { image: result.image, caption }, { quoted: m });
        await m.react('✅');
        
    } catch (error) {
        console.error('[IQC ERROR]', error);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan sistem.\n┊ _${error.message || String(error)}_\n╰────────────────────── ⋆ ✧`);
    }
}

handler.help = ['iqc <teks>'];
handler.tags = ['maker'];
handler.command = /^iqc|iphoneqc$/i;
handler.limit = true;

export default handler;