/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : WhatsApp Channel Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link channel WhatsApp yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} https://whatsapp.com/channel/xxxx*\n╰────────────────────── ⋆ ✧`);
    }

    if (!/whatsapp\.com\/channel\//i.test(args[0])) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Link tidak valid! Pastikan memasukkan tautan channel WhatsApp.\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const query = encodeURIComponent(args[0]);
        const apiUrl = `https://bintangapi.my.id/api/stalker/channelwa?url=${query}`;
        
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data dari API.");
        }

        const data = json.data;
        const cleanBio = data.bio ? data.bio.split('\n').join('\n┊ ') : 'Tidak ada bio';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *WA CHANNEL STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 📛 *Nama* : ${data.name || 'Tidak diketahui'}
┊ 🆔 *ID* : ${data.channel_id || '-'}
┊ 👥 *Followers* : ${data.followers ? data.followers.toLocaleString('id-ID') : '0'}
┊ 🔗 *Link* : ${data.channel_url || args[0]}
┊ 
┊ 📝 *Bio :*
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk channel:\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['stalkchannel <link>'];
handler.tags = ['stalker'];
handler.command = /^(stalkchannel|chstalk)$/i;
handler.limit = true;

export default handler;