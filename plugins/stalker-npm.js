/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : NPM Package Stalker
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan nama package NPM yang ingin di-stalk!\n┊ ☁️ Contoh: *${usedPrefix + command} nebu*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const apiUrl = `https://bintangapi.my.id/api/stalker/npm?name=${encodeURIComponent(text.trim())}`;
        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.success || !json.data) {
            throw new Error("Gagal mengambil data atau package tidak ditemukan.");
        }

        const data = json.data;
        
        const firstPublish = data.first_published_at ? data.first_published_at.split('T')[0] : '-';
        const lastPublish = data.last_published_at ? data.last_published_at.split('T')[0] : '-';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *NPM PACKAGE STALK* 🎀 ꒱ ✧ ⋆ ──
┊ 📦 *Package Name* : ${data.package_name || '-'}
┊ 🏷️ *Latest Version* : v${data.latest_version || '-'}
┊ 🛡️ *First Version* : v${data.first_version || '-'}
┊ 🔢 *Total Versions* : ${data.total_versions || '0'}
┊ 🔗 *Latest Deps* : ${data.latest_dependencies || '0'} dependencies
┊ ⛓️ *First Deps* : ${data.first_dependencies || '0'} dependencies
┊ 📅 *First Published* : ${firstPublish}
┊ 🔄 *Last Published* : ${lastPublish}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Stalker* 🌸`.trim();

        await conn.reply(m.chat, caption, m);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melakukan stalk package NPM.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['npmstalk <package_name>'];
handler.tags = ['stalker'];
handler.command = /^npmstalk$/i;
handler.limit = true;

export default handler;