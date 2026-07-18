/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Wattpad Read Chapter
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan URL Chapter Wattpad yang ingin dibaca!\n┊ ☁️ Contoh: *${usedPrefix + command} https://www.wattpad.com/34439656-taking-whats-his-chapter-eighteen*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/baca/wattpad-baca?url=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal memuat isi chapter atau URL salah.");
        }

        const data = json.data;
        const paragraphs = data.content || [];
        const storyContent = paragraphs.join('\n\n');

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *WATTPAD READER* 🎀 ꒱ ✧ ⋆ ──
┊ 📖 *Story* : ${data.story_title || '-'}
┊ 📑 *Chapter* : ${data.chapter_title || '-'} (No. ${data.chapter_number || '-'})
┊ 👤 *Author* : ${data.author || '-'}
╰────────────────────── ⋆ ✧

${storyContent}

╭────────────────────── ⋆ ✧
┊ 🔗 *Source:* ${data.url || text}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Wattpad* 🌸`.trim();

        // Menggunakan conn.reply atau sendMessage terpisah jika teks terlalu panjang
        await conn.reply(m.chat, caption, m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membaca chapter Wattpad.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['wattpadread <url_chapter>'];
handler.tags = ['baca'];
handler.command = /^(wattpadread|wabaca|waread)$/i;
handler.limit = true;

export default handler;