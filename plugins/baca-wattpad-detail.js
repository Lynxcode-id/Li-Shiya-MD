/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Wattpad Detail & Chapters
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan URL Story Wattpad yang ingin dilihat!\n┊ ☁️ Contoh: *${usedPrefix + command} https://www.wattpad.com/story/357658780-arya-pierre*\n╰────────────────────── ⋆ ✧`);
    }

    if (!text.includes('wattpad.com/story/')) {
        return m.reply('╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ URL yang dimasukkan harus merupakan tautan detail novel/story Wattpad!\n╰────────────────────── ⋆ ✧');
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/baca/wattpad-det?url=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil detail novel atau URL salah.");
        }

        const data = json.data;
        const stats = data.stats || {};
        const cleanDesc = data.description ? data.description.split('\n').join('\n┊ ') : 'Tidak ada deskripsi';

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *WATTPAD DETAIL* 🎀 ꒱ ✧ ⋆ ──
┊ 📛 *Judul* : ${data.title || '-'}
┊ 👤 *Author* : ${data.author || '-'}
┊ 🧬 *Genre* : ${data.genre || '-'}
┊ 🛡️ *Status* : ${data.status || '-'}
┊ 📊 *Statistik* : ${stats.parts || '0'} Parts
┊ 
┊ 📝 *Sinopsis :*
┊ ${cleanDesc}
┊ 
┊ 📑 *DAFTAR CHAPTER :*
`.trim();

        if (data.chapters && data.chapters.length > 0) {
            data.chapters.forEach((ch, idx) => {
                caption += `\n┊ ${idx + 1}. ${ch.title || 'Chapter'}\n┊ 🔗 Link: ${ch.url}`;
            });
        } else {
            caption += `\n┊ (Tidak ada daftar chapter)`;
        }

        caption += `\n╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Wattpad* 🌸`;

        if (data.cover) {
            await conn.sendMessage(m.chat, { image: { url: data.cover }, caption }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil informasi detail novel.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['wattpaddetail <url_story>'];
handler.tags = ['baca'];
handler.command = /^(wattpaddetail|wadetail|wadet)$/i;
handler.limit = true;

export default handler;