/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : To URL / Claidex Uploader (Li Shiya UI)
 */

import fetch from 'node-fetch';
import FormData from 'form-data';

const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!mime) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Reply atau kirim media (gambar/video/audio/dokumen)!\n┊ ☁️ Contoh: Balas media dengan caption *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const fileBuffer = await q.download();
        if (!fileBuffer) throw new Error("Gagal mengambil buffer file media.");

        const ext = mime.split('/')[1] || 'bin';
        const fileName = q.fileName || `file_${Date.now()}.${ext}`;

        const form = new FormData();
        form.append('file', fileBuffer, fileName);

        const response = await fetch("https://claidexdigital.tokyo/upload.php", {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const result = await response.json();

        if (result.status !== "success") {
            throw new Error(result.message || "Upload failed");
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *MEDIA TO URL* 🎀 ꒱ ✧ ⋆ ──
┊ ✨ *Berhasil mengunggah file!*
┊ 
┊ 📄 *Nama File* : ${result.data.filename}
┊ 📊 *Ukuran* : ${result.data.size}
┊ 🔖 *MimeType* : ${mime}
┊ 🔗 *URL* : ${result.data.url}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Media Uploader* 🌸`.trim();

        await conn.reply(m.chat, caption, m);
        await m.react('✅');

    } catch (e) {
        console.error('[TOURL ERROR]', e);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengunggah media:\n┊ _${e.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['tourl'];
handler.tags = ['uploader'];
handler.command = /^tourl$/i;
handler.limit = true;

export default handler;