import axios from 'axios';

const handler = async (m, { conn }) => {
    await m.react('⏳');

    try {
        const response = await axios.get("https://api.azbry.com/api/random/waifu", { 
            responseType: 'arraybuffer' 
        });

        const imageBuffer = response.data;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *RANDOM WAIFU* 🎀 ꒱ ✧ ⋆ ──\n`;
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan gambar waifu.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['ramdomwaifu'];
handler.tags = ['random'];
handler.command = /^(randomwaifu)$/i;
handler.limit = true;

export default handler;