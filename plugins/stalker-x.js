/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : X / Twitter Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username X / Twitter yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} prabowo*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/x?username=${encodeURIComponent(text.trim().replace('@', ''))}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau username tidak ditemukan.");
        }

        const data = json.data;
        const cleanBio = data.bio ? data.bio.split('\n').join('\n┊ ') : 'Tidak ada bio';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *X / TWITTER STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Username* : @${data.username || '-'}
┊ 📛 *Nama* : ${data.display_name || '-'}
┊ 👥 *Followers* : ${data.followers ? data.followers.toLocaleString('id-ID') : '0'}
┊ 🤝 *Following* : ${data.following ? data.following.toLocaleString('id-ID') : '0'}
┊ 📝 *Tweets* : ${data.tweets ? data.tweets.toLocaleString('id-ID') : '0'}
┊ 📍 *Lokasi* : ${data.location || '-'}
┊ 🌐 *Website* : ${data.website || '-'}
┊ 📅 *Bergabung* : ${data.joined || '-'}
┊ 🛡️ *Verified* : ${data.verified ? 'Ya' : 'Tidak'}
┊ 🔒 *Privat* : ${data.protected ? 'Ya' : 'Tidak'}
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk X.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['xstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(xstalk|twitterstalk|stalkx)$/i;
handler.limit = true;

export default handler;