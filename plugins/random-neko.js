import axios from 'axios';

const handler = async (m, { conn }) => {
    await m.react('⏳');

    try {
        const response = await axios.get("https://api.kyzzz.eu.cc/api/image/neko", {
            params: {
                apikey: 'kyzz824425738250'
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            responseType: 'arraybuffer'
        });

        const imageBuffer = response.data;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *RANDOM NEKO* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Random Tools* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: caption 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan gambar neko.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['neko'];
handler.tags = ['random'];
handler.command = /^(neko|randomneko)$/i;
handler.limit = true;

export default handler;