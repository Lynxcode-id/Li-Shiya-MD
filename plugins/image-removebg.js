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
        
        const response = await axios.get("https://apis.snowping.eu.cc/api/tools/removebg", {
            params: {
                url: upUrl
            }
        });

        const resData = response.data;

        if (resData.status !== 200 || !resData.result?.url) {
            throw new Error("Gagal menghapus latar belakang, API tidak mengembalikan URL hasil.");
        }

        const resultImage = resData.result.url;
        const size = resData.result.size || '-';

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *REMOVE BG DONE* 🎀 ꒱ ✧ ⋆ ──
┊ 📦 *Ukuran File* : ${size}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - Image Tools* 🌸`.trim();

        await conn.sendMessage(m.chat, { 
            image: { url: resultImage }, 
            caption: caption 
        }, { quoted: m });
        
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        
        const errMsg = err.response?.data?.message || err.message;
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal menghapus latar belakang gambar.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['removebg'];
handler.tags = ['image'];
handler.command = /^(removebg|rmbg)$/i;
handler.limit = true;

export default handler;