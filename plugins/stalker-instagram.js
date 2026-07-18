/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Instagram Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username Instagram yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} mrbeast*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/instagram?username=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau username tidak ditemukan.");
        }

        const data = json.data;
        const cleanBio = data.biography ? data.biography.split('\n').join('\n┊ ') : 'Tidak ada bio';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *INSTAGRAM STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Username* : ${data.username || '-'}
┊ 📦 *Posts* : ${data.posts_count_raw || data.posts_count || '0'}
┊ 👥 *Followers* : ${data.followers_count_raw || data.followers_count || '0'}
┊ 🤝 *Following* : ${data.following_count_raw || data.following_count || '0'}
┊ 
┊ 📝 *Bio :*
┊ ${cleanBio}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Stalker* 🌸`.trim();

        if (data.avatar_url) {
            await conn.sendMessage(m.chat, { image: { url: data.avatar_url }, caption }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk Instagram.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['igstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(igstalk|instagramstalk|stalkig)$/i;
handler.limit = true;

export default handler;