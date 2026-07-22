import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan judul lagu yang dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} multo*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const { data } = await axios.get("https://api-faa.my.id/faa/lyrics", {
            params: { q: text.trim() },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        if (!data?.status || !data?.result) {
            throw new Error("Gagal mengambil lirik dari API.");
        }

        const { title, artist, album, cover, genre, lyrics, release_date } = data.result;
        const imageUrl = cover?.large || cover?.medium || cover?.small || '';
        const release = release_date ? release_date.split('T')[0] : '-';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *LYRICS FINDER* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `┊ 📌 *Judul* : ${title || '-'}\n` +
                        `┊ 👤 *Artis* : ${artist || '-'}\n` +
                        `┊ 💿 *Album* : ${album || '-'}\n` +
                        `┊ 🎶 *Genre* : ${genre || '-'}\n` +
                        `┊ 📅 *Rilis* : ${release}\n` +
                        `╰────────────────────── ⋆ ✧\n\n` +
                        `${lyrics}\n\n` +
                        `> 🌸 *Li Shiya MD - Search Tools* 🌸`;

        if (imageUrl) {
            await conn.sendMessage(m.chat, {
                image: { url: imageUrl },
                caption: caption.trim()
            }, { quoted: m });
        } else {
            await m.reply(caption.trim());
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mencari lirik lagu.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['lirik <judul>'];
handler.tags = ['search'];
handler.command = /^(lirik|lyrics)$/i;
handler.limit = true;

export default handler;