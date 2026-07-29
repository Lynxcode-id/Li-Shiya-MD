import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan jumlah nominal untuk Fake Dana!\n┊ ☁️ Contoh: *${usedPrefix + command} 500000*\n╰────────────────────── ⋆ ✧`);
    }

    const amount = text.replace(/[^0-9]/g, '');
    if (!amount) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Harap masukkan nominal berupa angka saja!\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const response = await axios.get(`https://api.azbry.com/api/maker/fakedana`, {
            params: { amount },
            responseType: 'arraybuffer' 
        });

        const imageBuffer = response.data;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *FAKE DANA MAKER* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Maker Tools* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: imageBuffer, 
            caption: caption 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat fake dana.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['fakedana <nominal>'];
handler.tags = ['maker'];
handler.command = /^(fakedana)$/i;
handler.limit = true;

export default handler;