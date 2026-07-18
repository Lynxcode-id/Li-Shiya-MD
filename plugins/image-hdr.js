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
        
        const response = await axios.get("https://apis.snowping.eu.cc/api/imagehd/hdr", {
            params: {
                url: upUrl
            }
        });

        const resData = response.data;

        if (resData.status !== 200 || !resData.result?.image_url) {
            throw new Error("Gagal memproses gambar, API tidak mengembalikan URL hasil.");
        }

        const resultImage = resData.result.image_url;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *HDR ENHANCE DONE* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Image Tools* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: { url: resultImage }, 
            caption: caption 
        }, { quoted: m });
        
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.response?.data?.message || err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses gambar HDR.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['hdr'];
handler.tags = ['image'];
handler.command = /^hdr$/i;
handler.limit = true;

export default handler;