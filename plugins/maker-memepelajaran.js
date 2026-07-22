import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan dua teks dengan pemisah '|'!\n┊ ☁️ Contoh: *${usedPrefix + command} teks1|teks2*\n╰────────────────────── ⋆ ✧`);
    }

    let [text1, text2] = text.split('|').map(v => v.trim());
    
    if (!text1 || !text2) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Pastikan kedua teks sudah diisi dengan benar!\n┊ ☁️ Contoh: *${usedPrefix + command} teks1|teks2*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const { data } = await axios.get("https://api.cuki.biz.id/api/canvas/meme/pelajaran", {
            params: {
                text1: text1,
                text2: text2,
                apikey: 'cuki-x'
            },
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 25000
        });

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *MEME PELAJARAN* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `╰────────────────────── ⋆ ✧\n` +
                        `> 🌸 *Li Shiya MD - Canvas Tools* 🌸`;

        await conn.sendMessage(m.chat, {
            image: Buffer.from(data, 'binary'),
            caption: caption.trim()
        }, { quoted: m });

        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat maker meme.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['memepelajaran <teks1>|<teks2>'];
handler.tags = ['maker'];
handler.command = /^memepelajaran$/i;
handler.limit = true;

export default handler;