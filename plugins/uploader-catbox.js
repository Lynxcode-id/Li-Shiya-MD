/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Catbox Media Uploader (Li Shiya UI)
 */

import axios from 'axios';
import FormData from 'form-data';

const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Reply atau kirim foto, video, audio, atau file yang mau di-upload!\n┊ ☁️ Contoh: Balas media dengan caption *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const fileBuffer = await q.download();
        if (!fileBuffer) throw new Error("Gagal mengambil buffer file media.");

        const ext = mime.split('/')[1] || 'bin';
        const fileName = `file.${ext === 'jpeg' ? 'jpg' : ext}`;
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('userhash', 'd6acaac8bad1ae93ddffe0dac');
        form.append('fileToUpload', fileBuffer, fileName);
        const res = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders(),
            timeout: 120000 
        });

        if (!res.data || typeof res.data !== 'string' || !res.data.includes('catbox.moe')) {
            throw new Error("Respon API tidak mengembalikan tautan Catbox yang valid.");
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *CATBOX UPLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 🎉 *Upload sukses, cuy!*
┊ 
┊ 📄 *MimeType* : ${mime}
┊ 🔗 *Link* : ${res.data.trim()}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Catbox Uploader* 🌸`.trim();

        await conn.reply(m.chat, caption, m);
        await m.react('✅');

    } catch (err) {
        console.error('[CATBOX ERROR]', err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Error pas upload cuy:\n┊ _${err.response?.data || err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['catbox'];
handler.tags = ['uploader'];
handler.command = /^catbox$/i;
handler.limit = true;

export default handler;