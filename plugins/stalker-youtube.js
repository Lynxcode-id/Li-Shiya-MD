/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : YouTube Channel Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan nama atau username channel YouTube!\n┊ ☁️ Contoh: *${usedPrefix + command} windah basudara*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/youtube?username=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau channel tidak ditemukan.");
        }

        const data = json.data;
        const cleanBio = data.description ? data.description.split('\n').join('\n┊ ') : 'Tidak ada deskripsi';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *YOUTUBE STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 📛 *Channel* : ${data.channel_name || '-'}
┊ 👥 *Subscribers* : ${data.subscribers || '0'}
┊ 🛡️ *Verified* : ${data.is_verified ? 'Ya' : 'Tidak'}
┊ 🔗 *Link* : ${data.channel_url || '-'}
┊ 
┊ 📝 *Deskripsi :*
┊ ${cleanBio}
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk YouTube.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['ytstalk <username/channel>'];
handler.tags = ['stalker'];
handler.command = /^(ytstalk|youtubestalk|ytcheck)$/i;
handler.limit = true;

export default handler;