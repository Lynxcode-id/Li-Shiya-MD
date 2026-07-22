import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan teksnya!\n┊ ☁️ Contoh: *${usedPrefix + command} Hidup adalah perjuangan | Li Shiya*\n╰────────────────────── ⋆ ✧`);
    }

    let [teks, author] = text.split('|');
    if (!author) author = m.pushName || 'Li Shiya';

    await m.react('⏳');

    try {
        const response = await axios.get("https://api.cmnty.web.id/maker/rusdi", {
            params: {
                text: teks.trim(),
                author: author.trim()
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            responseType: 'arraybuffer'
        });

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *MAKER RUSDI* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Maker Tools* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: response.data, 
            caption: caption 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat gambar.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['rusdi<teks|author>'];
handler.tags = ['maker'];
handler.command = /^rusdi$/i;
handler.limit = true;

export default handler;