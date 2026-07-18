/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : Mobile Legends Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan User ID dan Zone ID Mobile Legends!\n┊ ☁️ Contoh: *${usedPrefix + command} 88242375 2178*\n╰────────────────────── ⋆ ✧`);
    }

    let [userId, zoneId] = text.split(/[\s|]+/);
    if (!userId || !zoneId) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Format salah! Masukkan ganjil User ID beserta Zone ID.\n┊ ☁️ Contoh: *${usedPrefix + command} 88242375 2178*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/ml?user_id=${encodeURIComponent(userId.trim())}&zone_id=${encodeURIComponent(zoneId.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau ID tidak ditemukan.");
        }

        const data = json.data;
        const caption = `╭── ⋆ ✧ ꒰ 🎀 *MOBILE LEGENDS STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 👤 *Nickname* : ${data.nickname || '-'}
┊ 🆔 *User ID* : ${data.user_id || '-'}
┊ 🌐 *Zone ID* : ${data.zone_id || '-'}
┊ 🌍 *Region* : ${data.region || '-'}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Stalker* 🌸`.trim();

        await conn.reply(m.chat, caption, m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk Mobile Legends.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['stalkml <user_id> <zone_id>'];
handler.tags = ['stalker'];
handler.command = /^(stalkml|mlstalk)$/i;
handler.limit = true;

export default handler;