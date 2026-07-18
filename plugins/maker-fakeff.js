/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Fake FF Lobby Maker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let lobby = 1;
    let username = args.join(' ');

    if (args.length > 1 && !isNaN(args[args.length - 1])) {
        lobby = parseInt(args[args.length - 1]);
        if (lobby < 1 || lobby > 5) lobby = 1;
        username = args.slice(0, -1).join(' ');
    }

    if (!username) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username!\n┊ ☁️ Contoh: *${usedPrefix + command} Lynx Decode 1*\n┊ 💡 Lobby tersedia: 1-5\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://api.xrizal.my.id/api/canvas/fake-ff?username=${encodeURIComponent(username)}&lobby=${lobby}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.result) {
            throw new Error(json.message || "Gagal membuat gambar.");
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *FAKE FF MAKER* 🎀 ꒱ ✧ ⋆ ──
┊ ✨ *User* : ${username}
┊ 🏢 *Lobby* : ${lobby}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Maker* 🌸`.trim();

        await conn.sendMessage(m.chat, { image: { url: json.result }, caption }, { quoted: m });
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses gambar:\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['fakeff <name> <lobby>'];
handler.tags = ['maker'];
handler.command = /^fakeff$/i;
handler.limit = true;

export default handler;