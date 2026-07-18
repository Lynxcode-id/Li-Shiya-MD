/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : GitHub Downloader
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link GitHub yang ingin diunduh!\n┊ ☁️ Contoh: *${usedPrefix + command} https://github.com/octocat/Spoon-Knife*\n╰────────────────────── ⋆ ✧`);
    }

    const url = args[0];
    if (!/^https?:\/\/(www\.)?github\.com\//.test(url)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Link tidak valid. Harap berikan URL GitHub yang benar!\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const query = encodeURIComponent(url);
        const apiUrl = `https://api.cmnty.web.id/downloader/github?url=${query}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (!json.status || !json.result) {
            throw new Error(json.message || "Gagal mengambil data dari API.");
        }

        const data = json.result;
        const repoName = data.name;
        const branch = data.default_branch || 'main';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *GITHUB DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 📁 *Repository* : ${data.full_name}
┊ 👤 *Owner* : ${data.owner.login}
┊ 📝 *Language* : ${data.language || 'Tidak diketahui'}
┊ ⭐ *Stars* : ${data.stargazers_count}
┊ 🍴 *Forks* : ${data.forks_count}
┊ 📅 *Created* : ${data.created_at.split('T')[0]}
┊ 🔄 *Updated* : ${data.updated_at.split('T')[0]}
┊ 🔗 *Link* : ${data.html_url}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Downloader* 🌸`.trim();

        await conn.sendMessage(m.chat, {
            document: { url: data.zip_download_url },
            fileName: `${repoName}-${branch}.zip`,
            mimetype: 'application/zip',
            caption: caption
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses permintaan.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['gitclone <link>', 'githubdl <link>'];
handler.tags = ['downloader'];
handler.command = /^(gitclone|githubdl)$/i;
handler.limit = true;

export default handler;