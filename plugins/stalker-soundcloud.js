/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : SoundCloud Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username SoundCloud yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} justin bieber*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/soundcloud?username=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau artis tidak ditemukan.");
        }

        const data = json.data;
        const cleanBio = data.description ? data.description.split('\n').join('\n┊ ') : 'Tidak ada deskripsi';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *SOUNDCLOUD STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 🆔 *User ID* : ${data.id || '-'}
┊ 👤 *Username* : ${data.username || '-'}
┊ 📛 *Nama Lengkap* : ${data.full_name || '-'}
┊ 📍 *Asal* : ${data.city || '-'}, ${data.country_code || '-'}
┊ 👥 *Followers* : ${data.followers_count ? data.followers_count.toLocaleString('id-ID') : '0'}
┊ 🤝 *Following* : ${data.followings_count ? data.followings_count.toLocaleString('id-ID') : '0'}
┊ ❤️ *Likes* : ${data.likes_count ? data.likes_count.toLocaleString('id-ID') : '0'}
┊ 🎵 *Total Track* : ${data.track_count || '0'}
┊ 📋 *Total Playlist* : ${data.playlist_count || '0'}
┊ 🛡️ *Verified* : ${data.verified ? 'Ya' : 'Tidak'}
┊ 💎 *Pro Unlimited* : ${data.pro_unlimited ? 'Ya' : 'Tidak'}
┊ 🕒 *Modifikasi Terakhir* : ${data.last_modified ? data.last_modified.split('T')[0] : '-'}
┊ 
┊ 📝 *Deskripsi :*
┊ ${cleanBio}
┊ 
┊ 🔗 *Profil* : ${data.permalink_url || '-'}
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk SoundCloud.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['scstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(scstalk|soundcloudstalk|scstalker)$/i;
handler.limit = true;

export default handler;