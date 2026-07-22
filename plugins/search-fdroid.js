import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan nama aplikasi F-Droid yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} Halo Jagoan Project*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const { data } = await axios.get("https://api.jagoanproject.com/api/search/fdroid", {
            params: { text: text.trim() },
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        if (!data?.status || !data?.result || data.result.length === 0) {
            throw new Error("Aplikasi tidak ditemukan.");
        }

        let info = `╭── ⋆ ✧ ꒰ 🎀 *F-DROID SEARCH* 🎀 ꒱ ✧ ⋆ ──\n`;
        
        data.result.slice(0, 10).forEach((app, i) => {
            info += `┊ 📱 *Nama* : ${app.name || '-'}\n` +
                    `┊ 📝 *Summary* : ${app.summary || '-'}\n` +
                    `┊ 📜 *Lisensi* : ${app.license || '-'}\n` +
                    `┊ 🔗 *Link* : ${app.link || '-'}\n`;
            if (i < data.result.slice(0, 10).length - 1) {
                info += `┊ ──────────────────────\n`;
            }
        });
        
        info += `╰────────────────────── ⋆ ✧\n\n> 🌸 *Li Shiya MD - Search Tools* 🌸`;

        await m.reply(info.trim());
        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mencari aplikasi.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['fdroid <query>'];
handler.tags = ['search'];
handler.command = /^fdroid$/i;
handler.limit = true;

export default handler;