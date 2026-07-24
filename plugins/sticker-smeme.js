/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Sticker Meme Maker
 */

import axios from 'axios';
import FormData from 'form-data';
import { create } from '@itsliaaa/starseal';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image\/(jpe?g|png)/.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Balas atau kirim gambar untuk dijadikan meme!\n┊ ☁️ Contoh: *${usedPrefix + command} text atas | text bawah*\n╰────────────────────── ⋆ ✧`);
    }

    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan teks untuk memenya!\n┊ ☁️ Contoh: *${usedPrefix + command} text atas | text bawah*\n╰────────────────────── ⋆ ✧`);
    }

    let [top, bottom] = text.split('|');
    top = top ? top.trim() : '';
    bottom = bottom ? bottom.trim() : '';

    await m.react('⏳');

    try {
        let media = await q.download();
        let filename = `LiShiya_Smem_${Date.now()}.jpg`;

        let formData = new FormData();
        formData.append('reqtype', 'fileupload');
        formData.append('time', '1h');
        formData.append('fileToUpload', media, filename);

        const uploadRes = await axios.post("https://litterbox.catbox.moe/resources/internals/api.php", formData, {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            }
        });

        const resultUrl = uploadRes.data;

        if (!resultUrl || !resultUrl.startsWith('http')) {
            throw new Error("Gagal mengupload gambar ke Litterbox.");
        }

        let memeApiUrl = `https://api.kaicloud.my.id/api/maker/smeme?url=${encodeURIComponent(resultUrl)}&top=${encodeURIComponent(top)}&bottom=${encodeURIComponent(bottom)}`;

        let { data: memeBuffer } = await axios.get(memeApiUrl, {
            responseType: 'arraybuffer'
        });

        const stickerBuffer = await create(memeBuffer, {
            packName: global.stickpack || 'Li Shiya',
            publisherName: global.stickauth || 'Meme Maker'
        }).toBuffer();

        await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
        await m.react('✅');
        
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat sticker meme.\n┊ _${err.message || 'Server sedang down'}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['smeme <teks atas|teks bawah>'];
handler.tags = ['maker'];
handler.command = /^(smeme|stickermeme)$/i; 
handler.limit = true;

export default handler;