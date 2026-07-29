import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan nama grup yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} jagoan project*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const { data } = await axios.get("https://api.jagoanproject.com/api/search/group", {
            params: { q: text.trim() },
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        if (!data?.status || !data?.result) {
            throw new Error("Grup tidak ditemukan.");
        }

        let info = '';
        const result = data.result;
        const list = Array.isArray(result) ? result : (result.data || result.rows || result.list || result.results || null);

        if (Array.isArray(list) && list.length > 0) {
            info = `╭── ⋆ ✧ ꒰ 🎀 *GROUP SEARCH* 🎀 ꒱ ✧ ⋆ ──\n`;
            list.slice(0, 10).forEach((res, i) => {
                info += `┊ 🏷️ *Judul* : ${res.title || '-'}\n` +
                        `┊ 👥 *Member* : ${res.count_members || res.members || 0}\n` +
                        `┊ 🔗 *Slug* : ${res.slug || '-'}\n`;
                if (i < list.slice(0, 10).length - 1) {
                    info += `┊ ──────────────────────\n`;
                }
            });
            info += `╰────────────────────── ⋆ ✧\n\n> 🌸 *Li Shiya MD - Search Tools* 🌸`;
        } else if (typeof result === 'object' && result && (result.title || result.description)) {
            info = `╭── ⋆ ✧ ꒰ 🎀 *GROUP SEARCH* 🎀 ꒱ ✧ ⋆ ──\n` +
                   `┊ 🏷️ *Judul* : ${result.title || '-'}\n` +
                   `┊ 👥 *Member* : ${result.count_members || 0}\n` +
                   `┊ 📍 *Lokasi* : ${result.location || '-'}\n` +
                   `┊ 📅 *Dibuat* : ${result.creation_date || '-'}\n` +
                   `┊ 🌐 *Bahasa* : ${result.language || '-'}\n` +
                   `┊ 📝 *Deskripsi* : ${result.description || '-'}\n` +
                   `╰────────────────────── ⋆ ✧\n\n`;

            if (result.similar && result.similar.length > 0) {
                info += `*Grup Mirip Yang Ditemukan:*\n`;
                result.similar.forEach((g) => {
                    info += `• *${g.title || 'Unknown'}* (${g.slug || '-'})\n`;
                });
                info += `\n`;
            }

            info += `> 🌸 *Li Shiya MD - Search Tools* 🌸`;
        } else {
            throw new Error("Grup tidak ditemukan.");
        }

        await m.reply(info.trim());
        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mencari grup.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['searchgrup <nama>'];
handler.tags = ['search'];
handler.command = /^grupsearch$/i;
handler.limit = true;

export default handler;