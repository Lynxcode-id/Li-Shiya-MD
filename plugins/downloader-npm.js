/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : NPM Downloader & Searcher (Li Shiya UI)
 */

import fetch from 'node-fetch';

function formatBytes(bytes, decimals = 2) {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan nama package NPM yang dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} axios*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const packageName = text.trim().toLowerCase();
        const apiUrl = `https://api.jagoanproject.com/api/downloader/npm?package=${encodeURIComponent(packageName)}`;

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
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Package tidak ditemukan atau terjadi kesalahan pada API.\n╰────────────────────── ⋆ ✧');
        }

        const res = json.result;
        const caption = `╭── ⋆ ✧ ꒰ 🎀 *NPM DETAIL INFO* 🎀 ꒱ ✧ ⋆ ──
┊ 📦 *Nama* : ${res.nama || '-'}
┊ 📝 *Deskripsi* : ${res.deskripsi || '-'}
┊ 🏷️ *Versi Terbaru* : v${res.versi || '-'}
┊ 🔢 *Total Versi* : ${res.total_versi || 0} rilis
┊ 👤 *Pembuat* : ${res.pembuat || '-'}
┊ ⚖️ *Lisensi* : ${res.lisensi || '-'}
┊ 🌐 *Website* : ${res.website || '_Tidak ada_'}
┊ 📁 *Unpacked Size* : ${formatBytes(res.unpacked_size)}
┊ 🔗 *NPM Link* : ${res.npm || '-'}
╰────────────────────── ⋆ ✧
> 📥 *Mengirim berkas .tgz package...*
> 🌸 *Li Shiya MD - NPM Downloader* 🌸`.trim();

        await conn.reply(m.chat, caption, m);

        if (res.download) {
            await conn.sendMessage(m.chat, {
                document: { url: res.download },
                fileName: `${res.nama}-${res.versi}.tgz`,
                mimetype: 'application/gzip'
            }, { quoted: m });
        }

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses informasi package NPM.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['npm <package>'];
handler.tags = ['downloader'];
handler.command = /^npm$/i;
handler.limit = true;

export default handler;