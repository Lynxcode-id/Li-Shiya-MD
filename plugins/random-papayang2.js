import axios from 'axios';

const handler = async (m, { conn }) => {
    await m.react('⏳');

    try {
        const { data } = await axios.get("https://api-faa.my.id/faa/papayang", {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            responseType: 'arraybuffer',
            timeout: 15000
        });

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *PAPAYANG* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `╰────────────────────── ⋆ ✧\n` +
                        `> 🌸 *Li Shiya MD - Random Image* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: data, 
            caption: caption 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil gambar.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['papayang2'];
handler.tags = ['random'];
handler.command = /^(papayang2)$/i;
handler.limit = true;

export default handler;