/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Google Drive Downloader (Li Shiya UI - Fixed Mimetype)
 */

import fetch from 'node-fetch';

function getMimeType(filename) {
    if (!filename) return 'application/octet-stream';
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
        'mp4': 'video/mp4',
        'mkv': 'video/x-matroska',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        '3gp': 'video/3gpp',
        'mp3': 'audio/mpeg',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'm4a': 'audio/mp4',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'pdf': 'application/pdf',
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
        'html': 'text/html',
        'json': 'application/json'
    };
    return mimeTypes[ext] || 'application/octet-stream';
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link Google Drive yang ingin diunduh!\n┊ ☁️ Contoh: *${usedPrefix + command} https://drive.google.com/file/d/xxxx/view*\n╰────────────────────── ⋆ ✧`);
    }

    if (!/drive\.google\.com/i.test(text)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ URL tidak valid! Harap masukkan link Google Drive yang benar.\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://api.jagoanproject.com/api/downloader/gdrivedl?q=${encodeURIComponent(text.trim())}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (!json.status || !json.result) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil data dari Google Drive. Pastikan file bersifat publik.\n╰────────────────────── ⋆ ✧');
        }

        const res = json.result;
        const fileName = res.name || 'gdrive_file';
        const fileSize = res.size || 'Tidak diketahui';
        const fileMimetype = res.mimetype || getMimeType(fileName);

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *GDRIVE DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 📁 *Nama* : ${fileName}
┊ 🆔 *File ID* : ${res.fileId || '-'}
┊ 📊 *Ukuran* : ${fileSize}
┊ 🏷️ *MimeType* : ${fileMimetype}
╰────────────────────── ⋆ ✧
> 📥 *Mengirimkan file, mohon tunggu...*
> 🌸 *Li Shiya MD - Google Drive Downloader* 🌸`.trim();

        await conn.reply(m.chat, caption, m);
        if (res.download) {
            await conn.sendMessage(m.chat, {
                document: { url: res.download },
                fileName: fileName,
                mimetype: fileMimetype
            }, { quoted: m });
        } else {
            throw new Error("Link download tidak ditemukan.");
        }

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses link Google Drive tersebut.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['gdrive <url>', 'gdrivedl <url>'];
handler.tags = ['downloader'];
handler.command = /^(gdrive|gdrivedl)$/i;
handler.limit = true;

export default handler;