/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Pinterest Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username Pinterest yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} handsome*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/pinterest?username=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau username tidak ditemukan.");
        }

        const data = json.data;
        const cleanBio = data.bio ? data.bio.split('\n').join('\n┊ ') : 'Tidak ada bio';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *PINTEREST STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Username* : ${data.username || '-'}
┊ 📛 *Nama* : ${data.full_name || '-'}
┊ 👥 *Followers* : ${data.followers ? data.followers.toLocaleString('id-ID') : '0'}
┊ 🤝 *Following* : ${data.following ? data.following.toLocaleString('id-ID') : '0'}
┊ 📌 *Pins* : ${data.pins_count ? data.pins_count.toLocaleString('id-ID') : '0'}
┊ 📋 *Boards* : ${data.boards_count ? data.boards_count.toLocaleString('id-ID') : '0'}
┊ ❤️ *Likes* : ${data.likes ? data.likes.toLocaleString('id-ID') : '0'}
┊ 🛡️ *Verified* : ${data.is_verified ? 'Ya' : 'Tidak'}
┊ 
┊ 📝 *Bio :*
┊ ${cleanBio}
┊ 
┊ 🔗 *Profil* : ${data.profile_url || '-'}
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk Pinterest.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['pintereststalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(pintereststalk|pinstalk)$/i;
handler.limit = true;

export default handler;