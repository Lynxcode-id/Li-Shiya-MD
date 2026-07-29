/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Spotify Card Maker
 */

import fetch from 'node-fetch';
import uploadImage from '../lib/uploadImage.js';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image/i.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Reply gambar untuk dijadikan cover!\n┊ ☁️ Format: *${usedPrefix + command} judul | artis | album*\n╰────────────────────── ⋆ ✧`);
    }

    let [title, author, album] = text.split('|');
    if (!title || !author) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan judul dan artis!\n┊ ☁️ Format: *${usedPrefix + command} judul | artis | album*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let mediaBuffer = await q.download();
        let imageUrl = await uploadImage(mediaBuffer);

        let strTitle = encodeURIComponent(title.trim());
        let strAuthor = encodeURIComponent(author.trim());
        let strAlbum = encodeURIComponent(album ? album.trim() : title.trim());

        const apiUrl = `https://anabot.my.id/api/maker/spotify?apikey=freeApikey&author=${strAuthor}&album=${strAlbum}&title=${strTitle}&timestamp=03%3A45&image=${encodeURIComponent(imageUrl)}&blur=5&overlayOpacity=0.7`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Gagal memproses gambar dari API.");
        
        const buffer = await response.buffer();

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *SPOTIFY MAKER* 🎀 ꒱ ✧ ⋆ ──
┊ 🎵 *Judul* : ${title.trim()}
┊ 👤 *Artis* : ${author.trim()}
┊ 💿 *Album* : ${album ? album.trim() : title.trim()}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Maker* 🌸`.trim();

        await conn.sendMessage(m.chat, { image: buffer, caption }, { quoted: m });
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat Spotify card:\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['spotifycard <judul> | <artis> | <album>'];
handler.tags = ['maker'];
handler.command = /^(spotifycard|spotifymaker)$/i;
handler.limit = true;

export default handler;