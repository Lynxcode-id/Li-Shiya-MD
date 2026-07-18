/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Wattpad Search
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan judul cerita Wattpad yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} girls*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/baca/wattpad-searc?q=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data || !json.data.stories || json.data.stories.length === 0) {
            throw new Error("Cerita tidak ditemukan atau gagal mengambil data.");
        }

        const stories = json.data.stories;
        let txt = `╭── ⋆ ✧ ꒰ 🎀 *WATTPAD SEARCH* 🎀 ꒱ ✧ ⋆ ──\n`;
        txt += `┊ 🔍 *Hasil Pencarian untuk:* "${text}"\n┊\n`;

        stories.forEach((str, i) => {
            txt += `┊ 📂 *[${i + 1}] ${str.title}*\n`;
            txt += `┊ 👤 *Author:* ${str.author || '-'}\n`;
            txt += `┊ 👥 *Reads:* ${str.reads ? str.reads.toLocaleString('id-ID') : '0'} | ⭐ *Votes:* ${str.votes ? str.votes.toLocaleString('id-ID') : '0'}\n`;
            txt += `┊ 📑 *Parts:* ${str.parts || '0'} | 🏷️ *Status:* ${str.status || 'Ongoing'}\n`;
            txt += `┊ 🔗 *URL Detail:* \n┊   ${str.url}\n`;
            txt += `┊──────────────────────\n`;
        });

        txt += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Wattpad* 🌸`;

        await conn.reply(m.chat, txt.trim(), m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mencari cerita di Wattpad.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['wattpadsearch <judul>'];
handler.tags = ['baca'];
handler.command = /^(wattpadsearch|wasearch)$/i;
handler.limit = true;

export default handler;