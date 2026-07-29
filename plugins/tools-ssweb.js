/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Web Screenshot (Li Shiya UI)
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──
┊ 🌸 Masukkan URL website yang ingin di-screenshot!
┊ ☁️ Contoh Desktop: *${usedPrefix + command} https://example.com*
┊ 📱 Contoh Mobile: *${usedPrefix + command} https://example.com --mobile*
╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let mode = 'desktop';
        let input = text.trim();
        if (/hp|mobile|phone/i.test(command) || input.includes('--mobile') || input.includes('-m')) {
            mode = 'mobile';
            input = input.replace(/--mobile|-m/g, '').trim();
        } else if (/pc|desktop|lap/i.test(command) || input.includes('--desktop') || input.includes('-d')) {
            mode = 'desktop';
            input = input.replace(/--desktop|-d/g, '').trim();
        }

        let targetUrl = input;
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = 'https://' + targetUrl;
        }

        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
        if (!urlRegex.test(targetUrl)) {
            await m.react('❌');
            return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ URL tidak valid! Harap masukkan alamat website yang benar.\n╰────────────────────── ⋆ ✧`);
        }

        const apikey = 'Lynxdecode';
        const apiUrl = `https://api.jagoanproject.com/api/tools/screenshot-web?url=${encodeURIComponent(targetUrl)}&mode=${mode}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apikey}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });

        const json = await response.json();

        if (!json.status || !json.result) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil screenshot. Pastikan website dapat diakses publik.\n╰────────────────────── ⋆ ✧');
        }

        const res = json.result;
        const finalMode = (res.mode || mode).toUpperCase();

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *SCREENSHOT WEB* 🎀 ꒱ ✧ ⋆ ──
┊ 🌐 *Target* : ${res.sourceUrl || targetUrl}
┊ 🖥️ *Mode Tampilan* : ${finalMode}
┊ ⚙️ *Status* : Sukses Terbuka
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Web Screenshot* 🌸`.trim();

        if (res.imageUrl) {
            await conn.sendMessage(m.chat, { 
                image: { url: res.imageUrl }, 
                caption: caption 
            }, { quoted: m });
            await m.react('✅');
        } else {
            throw new Error("Image URL tidak ditemukan pada response API.");
        }

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses screenshot website tersebut.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['ssweb <url>', 'sspc <url>', 'sshp <url>', 'ssdesktop <url>', 'ssmobile <url>'];
handler.tags = ['tools'];
handler.command = /^(ssweb|ssdesktop|ssmobile)$/i;
handler.limit = true;

export default handler;