import axios from 'axios';
import uploadImage from '../lib/uploadImage.js';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    
    if (!mime) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Kirim/balas gambar dengan perintah *${usedPrefix + command} nama|bio*\n╰────────────────────── ⋆ ✧`);
    }
    if (!/image\/(jpe?g|png)/.test(mime)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Media yang dikirim harus berupa gambar (JPG/PNG)!\n╰────────────────────── ⋆ ✧`);
    }
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan nama dan bio dengan pemisah | \n┊ ☁️ Contoh: *${usedPrefix + command} Lynx|Nothing*\n╰────────────────────── ⋆ ✧`);
    }

    let [name, bio] = text.split('|');
    if (!name) return m.reply('⚠️ Masukkan nama kamu!');
    if (!bio) bio = '-';

    await m.react('⏳');

    try {
        let img = await q.download();
        let upUrl = await uploadImage(img);
        
        const response = await axios.get("https://api.azbry.com/api/maker/fakedev", {
            params: {
                img: upUrl,
                name: name.trim(),
                bio: bio.trim()
            },
            responseType: 'arraybuffer'
        });

        const imageBuffer = response.data;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *FAKE DEV DONE* 🎀 ꒱ ✧ ⋆ ──\n`;
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
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat fake dev.\n┊ _${errMsg}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['fakedev <nama|bio>'];
handler.tags = ['maker'];
handler.command = /^(fakedev)$/i;
handler.limit = true;

export default handler;