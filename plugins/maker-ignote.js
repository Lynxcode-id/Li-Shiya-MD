import axios from 'axios';
import uploadImage from '../lib/uploadImage.js';  // sesuaikan sama uploader masing masing ya

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan pesan untuk IG Note!\n┊ ☁️ Contoh: *${usedPrefix + command} jadilah manusia berkualitas*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    let avatar;
    try {
        if (/image/.test(mime)) {
            let media = await q.download();
            avatar = await uploadImage(media);
        } else {
            let ppUrl = await conn.profilePictureUrl(m.sender, 'image');
            let ppBuffer = await (await axios.get(ppUrl, { responseType: 'arraybuffer' })).data;
            avatar = await uploadImage(ppBuffer);
        }
    } catch (e) {
        avatar = 'https://i.pravatar.cc/150?img=11'; 
    }

    let name = m.pushName || 'Li Shiya';

    try {
        const response = await axios.get("https://api.cmnty.web.id/canvas/ignote", {
            params: {
                name: name,
                message: text.trim(),
                avatar: avatar
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            responseType: 'arraybuffer'
        });

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *IG NOTE MAKER* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Maker Tools* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: response.data, 
            caption: caption 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat IG Note.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['ignote <teks>'];
handler.tags = ['maker'];
handler.command = /^ignote$/i;
handler.limit = true;

export default handler;