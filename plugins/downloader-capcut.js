/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : CapCut Downloader
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan URL template CapCut yang ingin di-download!\n┊ ☁️ Contoh: *${usedPrefix + command} https://www.capcut.com/tv2/ZSQANHeT9/*\n╰────────────────────── ⋆ ✧`);
    }

    // Validasi sederhana untuk memastikan URL dari capcut
    if (!text.includes('capcut.com/')) {
        return m.reply('╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ URL yang dimasukkan harus merupakan tautan dari CapCut!\n╰────────────────────── ⋆ ✧');
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/downloader/capcut?url=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau URL tidak valid.");
        }

        const data = json.data;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *CAPCUT DOWNLOAD* 🎀 ꒱ ✧ ⋆ ──
┊ 📝 *Judul* : ${data.title || '-'}
┊ 👤 *Kreator* : ${data.author_name || '-'}
┊ 🔗 *Link Asli* : ${data.original_url || '-'}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Downloader* 🌸`.trim();

        if (data.download_video) {
            // Mengirimkan video hasil download beserta caption detailnya
            await conn.sendMessage(m.chat, { 
                video: { url: data.download_video }, 
                caption: caption 
            }, { quoted: m });
        } else {
            throw new Error("Tautan unduhan video tidak ditemukan.");
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengunduh template CapCut.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['capcutdl <url>'];
handler.tags = ['downloader'];
handler.command = /^(capcutdl|ccdl)$/i;
handler.limit = true;

export default handler;