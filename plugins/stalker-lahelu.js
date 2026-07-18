/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Lahelu Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username Lahelu yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} bedrock*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/lahelu?username=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau username tidak ditemukan.");
        }

        const data = json.data;
        const caption = `╭── ⋆ ✧ ꒰ 🎀 *LAHELU STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Username* : ${data.username || '-'}
┊ 🆔 *ID* : ${data.id || '-'}
┊ 📦 *Posts* : ${data.posts ? data.posts.toLocaleString('id-ID') : '0'}
┊ 🔺 *Upvotes* : ${data.upvotes ? data.upvotes.toLocaleString('id-ID') : '0'}
┊ 🔻 *Downvotes* : ${data.downvotes ? data.downvotes.toLocaleString('id-ID') : '0'}
┊ 👥 *Followers* : ${data.followers ? data.followers.toLocaleString('id-ID') : '0'}
┊ 🤝 *Following* : ${data.following ? data.following.toLocaleString('id-ID') : '0'}
┊ 📅 *Dibuat* : ${data.created_at ? data.created_at.split('T')[0] : '-'}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Stalker* 🌸`.trim();

        if (data.avatar) {
            await conn.sendMessage(m.chat, { image: { url: data.avatar }, caption }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk Lahelu.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['lahelustalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(lahelustalk|lhstalk)$/i;
handler.limit = true;

export default handler;