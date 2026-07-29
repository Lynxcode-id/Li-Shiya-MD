/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Chess.com Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username Chess.com yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} kingsbishop*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/chess?username=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau username tidak ditemukan.");
        }

        const data = json.data;
        const ratings = data.ratings || {};

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *CHESS.COM STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Username* : ${data.username || '-'}
┊ 📛 *Nama* : ${data.name || '-'}
┊ 📍 *Lokasi* : ${data.location || '-'}
┊ 💎 *Status* : ${data.status || '-'}
┊ 👥 *Followers* : ${data.followers ? data.followers.toLocaleString('id-ID') : '0'}
┊ 👀 *Views* : ${data.views ? data.views.toLocaleString('id-ID') : '0'}
┊ 📅 *Bergabung* : ${data.joined_at || '-'}
┊ 🕒 *Terakhir Online* : ${data.last_online || '-'}
┊ 
┊ 📊 *STATISTIK RATING :*
┊ 🏹 *Bullet* : ${ratings.bullet?.rating || '-'} (Best: ${ratings.bullet?.best || '-'})
┊ ⚡ *Blitz* : ${ratings.blitz?.rating || '-'} (Best: ${ratings.blitz?.best || '-'})
┊ ⏱️ *Rapid* : ${ratings.rapid?.rating || '-'} (Best: ${ratings.rapid?.best || '-'})
┊ ⏳ *Daily* : ${ratings.daily?.rating || '-'} (Best: ${ratings.daily?.best || '-'})
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk Chess.com.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['chessstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(chessstalk|stalkchess)$/i;
handler.limit = true;

export default handler;