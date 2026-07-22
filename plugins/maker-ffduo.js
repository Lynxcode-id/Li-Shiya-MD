import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text || !text.includes('|')) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan dua nama dengan pemisah '|'!\n┊ ☁️ Contoh: *${usedPrefix + command} lynx|dinda*\n╰────────────────────── ⋆ ✧`);
    }

    let [user1, user2] = text.split('|').map(v => v.trim());
    
    if (!user1 || !user2) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Pastikan kedua nama sudah diisi dengan benar!\n┊ ☁️ Contoh: *${usedPrefix + command} lynx|dinda*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🌼');

    try {
        const { data } = await axios.get("https://api.kyzzz.eu.cc/api/canvas/ffduo", {
            params: {
                user1: user1,
                user2: user2,
                template: 'random',
                apikey: 'kyzz824425738250'
            },
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 20000
        });

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *FF DUO CANVAS* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `┊ 👤 *Player 1* : ${user1}\n` +
                        `┊ 👤 *Player 2* : ${user2}\n` +
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
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal membuat canvas.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['ffduo <nama1>|<nama2>'];
handler.tags = ['maker'];
handler.command = /^ffduo$/i;
handler.limit = true;

export default handler;