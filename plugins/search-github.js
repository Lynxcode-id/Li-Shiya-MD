import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan query repository yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} ERINE-AI*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const { data } = await axios.get("https://api.jagoanproject.com/api/search/githubsearch", {
            params: { text: text.trim() },
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        if (!data?.status || !data?.result || data.result.length === 0) {
            throw new Error("Repository tidak ditemukan.");
        }

        let info = `╭── ⋆ ✧ ꒰ 🎀 *GITHUB SEARCH* 🎀 ꒱ ✧ ⋆ ──\n`;
        
        data.result.slice(0, 5).forEach((repo, i) => {
            info += `┊ 📁 *Repo* : ${repo.full_name || '-'}\n` +
                    `┊ 🌟 *Stars* : ${repo.stars || 0}  |  🍴 *Forks* : ${repo.forks || 0}\n` +
                    `┊ 📅 *Dibuat* : ${repo.created_at || '-'}\n` +
                    `┊ 📝 *Deskripsi* : ${repo.description || '-'}\n` +
                    `┊ 🔗 *Link* : ${repo.html_url || '-'}\n` +
                    `┊ 📥 *Clone* : \`git clone ${repo.clone_url || '-'}\`\n`;
            if (i < data.result.slice(0, 5).length - 1) {
                info += `┊ ──────────────────────\n`;
            }
        });
        
        info += `╰────────────────────── ⋆ ✧\n\n> 🌸 *Li Shiya MD - Search Tools* 🌸`;

        await m.reply(info.trim());
        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mencari repository.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['githubsearch <query>'];
handler.tags = ['search'];
handler.command = /^githubsearch$/i;
handler.limit = true;

export default handler;