/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Telegram User/Channel Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username Telegram yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} mrbeast*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/telegram?username=${encodeURIComponent(text.trim().replace('@', ''))}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau username tidak ditemukan.");
        }

        const data = json.data;
        const cleanBio = data.description ? data.description.split('\n').join('\n┊ ') : 'Tidak ada deskripsi';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *TELEGRAM STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Username* : @${data.username || '-'}
┊ 📛 *Nama* : ${data.name || '-'}
┊ 🏷️ *Tipe* : ${data.type || '-'}
┊ 👥 *Followers* : ${data.followers ? data.followers.toLocaleString('id-ID') : '0'} (${data.followers_type || 'user'})
┊ 
┊ 📝 *Deskripsi :*
┊ ${cleanBio}
┊ 
┊ 🔗 *Profil URL* : ${data.profile_url || '-'}
┊ 🌐 *Preview URL* : ${data.preview_url || '-'}
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk Telegram.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['tgstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(tgstalk|telestalk|telegramstalk)$/i;
handler.limit = true;

export default handler;