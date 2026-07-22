import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan query video yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} cewe sad brutal*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const { data } = await axios.get("https://api.jagoanproject.com/api/search/douyinsearch", {
            params: { q: text.trim() },
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        if (!data?.status || !data?.response || data.response.length === 0) {
            throw new Error("Video tidak ditemukan.");
        }

        let info = `╭── ⋆ ✧ ꒰ 🎀 *DOUYIN SEARCH* 🎀 ꒱ ✧ ⋆ ──\n`;
        const list = data.response;

        // Menampilkan top 5 hasil pencarian teratas
        list.slice(0, 5).forEach((res, i) => {
            const caption = res.desc ? res.desc.trim() : 'No Caption';
            info += `┊ 📝 *Caption* : ${caption}\n` +
                    `┊ 👤 *Kreator* : ${res.author?.nickname || '-'}\n` +
                    `┊ ❤️ *Likes* : ${res.statistics?.digg_count || 0}\n` +
                    `┊ 💬 *Komen* : ${res.statistics?.comment_count || 0}\n` +
                    `┊ 📥 *Link No WM* : ${res.video?.download_addr?.url_list?.[0] || '-'}\n`;
            
            if (i < list.slice(0, 5).length - 1) {
                info += `┊ ──────────────────────\n`;
            }
        });

        info += `╰────────────────────── ⋆ ✧\n\n> 🌸 *Li Shiya MD - Search Tools* 🌸`;

        await m.reply(info.trim());
        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mencari video Douyin.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['douyinsearch <query>', 'douyins <query>'];
handler.tags = ['search'];
handler.command = /^(douyinsearch|douyins)$/i;
handler.limit = true;

export default handler;