/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : TikTok Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan username TikTok yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} officialbintangapi*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/tiktok?username=${encodeURIComponent(text.trim().replace('@', ''))}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.profil) {
            throw new Error("Gagal mengambil data atau akun tidak ditemukan.");
        }

        const profil = json.profil;
        const statistik = json.statistik || {};
        const cleanBio = profil.bio ? profil.bio.split('\n').join('\n┊ ') : 'Tidak ada bio';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *TIKTOK STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Username* : @${profil.username || '-'}
┊ 📛 *Nama* : ${profil.nama_tampilan || '-'}
┊ 👥 *Pengikut* : ${statistik.pengikut ? statistik.pengikut.toLocaleString('id-ID') : '0'}
┊ 🤝 *Mengikuti* : ${statistik.mengikuti ? statistik.mengikuti.toLocaleString('id-ID') : '0'}
┊ ❤️ *Suka* : ${statistik.suka ? statistik.suka.toLocaleString('id-ID') : '0'}
┊ 🎬 *Total Video* : ${statistik.video || '0'}
┊ 🛡️ *Verified* : ${profil.terverifikasi ? 'Ya' : 'Tidak'}
┊ 🔒 *Akun Privat* : ${profil.akun_privat ? 'Ya' : 'Tidak'}
┊ 🌐 *Link Bio* : ${profil.tautan_bio || '-'}
┊ 
┊ 📝 *Bio :*
┊ ${cleanBio}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Stalker* 🌸`.trim();

        if (profil.avatar) {
            await conn.sendMessage(m.chat, { image: { url: profil.avatar }, caption }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk TikTok.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['ttstalk <username>'];
handler.tags = ['stalker'];
handler.command = /^(ttstalk|tiktokstalk|stalktt)$/i;
handler.limit = true;

export default handler;