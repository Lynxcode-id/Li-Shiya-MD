/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : GitHub Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username GitHub yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} Lynxcode-id*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/github?username=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (json.status !== "success" || !json.result) {
            throw new Error("Gagal mengambil data atau username tidak ditemukan.");
        }

        const data = json.result;
        const caption = `╭── ⋆ ✧ ꒰ 🎀 *GITHUB STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Username* : ${data.username || '-'}
┊ 📛 *Nama* : ${data.name || '-'}
┊ 💼 *Bio* : ${data.bio || 'Tidak ada bio'}
┊ 👥 *Followers* : ${data.followers ? data.followers.toLocaleString('id-ID') : '0'}
┊ 🤝 *Following* : ${data.following ? data.following.toLocaleString('id-ID') : '0'}
┊ 📦 *Public Repo* : ${data.public_repo || '0'}
┊ 📍 *Lokasi* : ${data.location || '-'}
┊ 🌐 *Blog/Web* : ${data.blog || '-'}
┊ 📅 *Dibuat* : ${data.created_at ? data.created_at.split('T')[0] : '-'}
┊ 🔗 *Profil* : ${data.profile_url || '-'}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Stalker* 🌸`.trim();

        if (data.profile) {
            await conn.sendMessage(m.chat, { image: { url: data.profile }, caption }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk GitHub.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['githubstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(githubstalk|ghstalk)$/i;
handler.limit = true;

export default handler;