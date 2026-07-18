import axios from 'axios';

const handler = async (m, { conn }) => {
    await m.react('⏳');

    try {
        const response = await axios.get("https://api.azbry.com/api/random/meme", { 
            responseType: 'arraybuffer' 
        });
        
        const contentType = response.headers['content-type'] || '';
        let mediaInput;

        if (contentType.includes('application/json')) {
            const jsonString = response.data.toString('utf-8');
            const json = JSON.parse(jsonString);
            
            if (json.status && json.result) {
                mediaInput = { url: json.result.url || json.result.meme || json.result };
            } else {
                mediaInput = { url: json.url || json.meme };
            }
            
            if (!mediaInput.url || typeof mediaInput.url === 'object') {
                throw new Error("Gagal mendapatkan URL gambar dari JSON API.");
            }
        } else if (contentType.includes('image')) {
            mediaInput = response.data;
        } else {
            throw new Error("Format respon API tidak dikenal.");
        }

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *RANDOM MEME* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Random Tools* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: mediaInput, 
            caption: caption 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan meme random.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['meme'];
handler.tags = ['random'];
handler.command = /^(randommeme)$/i;
handler.limit = true;

export default handler;