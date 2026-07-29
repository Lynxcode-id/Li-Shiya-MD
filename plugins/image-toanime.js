import axios from 'axios';
import FormData from 'form-data';

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!/image/.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Kirim atau balas gambar dengan caption!\n┊ ☁️ Contoh: *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let media = await q.download();
        
        let formData = new FormData();
        formData.append('image', media, 'image.jpg');

        const response = await axios.post("https://api.xrizal.my.id/api/image/to-anime", formData, {
            headers: {
                ...formData.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            }
        });

        const data = response.data;
        if (!data.status || !data.result || !data.result.success) {
            throw new Error("Gagal mengonversi gambar ke anime.");
        }

        const resultUrl = data.result.result;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TO ANIME MAKER* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Maker Tools* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: { url: resultUrl }, 
            caption: caption 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses gambar.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['toanime'];
handler.tags = ['image'];
handler.command = /^toanime$/i;
handler.limit = true;

export default handler;