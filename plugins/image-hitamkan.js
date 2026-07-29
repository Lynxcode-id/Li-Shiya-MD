import axios from 'axios';
import uploadImage from '../lib/uploadImage.js';

const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!mime) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Kirim atau balas gambar dengan perintah *${usedPrefix + command}*\n╰────────────────────── ⋆ ✧`);
    }
    if (!/image\/(jpe?g|png)/.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Media yang dikirim harus berupa gambar (JPG/PNG)!\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let img = await q.download();
        let upUrl = await uploadImage(img);
        
        const response = await axios.get("https://axlyapi.qzz.io/maker/tohitam", {
            params: {
                url: upUrl
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            responseType: 'arraybuffer'
        });

        const imageBuffer = response.data;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *TO HITAM DONE* 🎀 ꒱ ✧ ⋆ ──\n`;
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses efek gambar.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['tohitam'];
handler.tags = ['image'];
handler.command = /^(tohitam|hitamkan)$/i;
handler.limit = true;

export default handler;