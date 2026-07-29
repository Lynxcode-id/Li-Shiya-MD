import axios from 'axios';

const handler = async (m, { conn, usedPrefix, command }) => {
    await m.react('🌼');

    try {
        const response = await axios.get("https://api.jerexd.my.id/api/random/jomok", {
            params: { apikey: 'Lynxdecode' },
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 20000
        });

        const contentType = response.headers['content-type'] || '';
        let media;

        if (contentType.includes('application/json')) {
            const data = JSON.parse(Buffer.from(response.data).toString('utf-8'));
            if (!data.status) throw new Error("API merespon dengan status false.");
            media = { url: data.result || data.url || data.image || data.data };
        } else {
            media = Buffer.from(response.data, 'binary');
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *RANDOM JOMOK* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `╰────────────────────── ⋆ ✧\n` +
                        `> 🌸 *Li Shiya MD - Random Image* 🌸`;

        await conn.sendMessage(m.chat, {
            image: media,
            caption: caption.trim()
        }, { quoted: m });

        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil media.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['jomok'];
handler.tags = ['random'];
handler.command = /^(jomok)$/i;
handler.limit = true;

export default handler;