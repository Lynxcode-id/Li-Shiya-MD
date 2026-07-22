import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan judul lagu yang dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} surat cinta untuk starla*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const response = await axios.get("https://api.cmnty.web.id/downloader/soundcloud-play", {
            params: {
                q: text.trim()
            },
            headers: {
                'Accept': 'application/json'
            }
        });

        const data = response.data;
        if (!data.status || !data.result) throw new Error("Gagal mengambil data lagu dari API.");

        const { title, artist, duration, image_url, url, source } = data.result;

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *SOUNDCLOUD PLAY* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `┊ 📌 *Judul* : ${title}\n`;
        caption += `┊ 👤 *Artis* : ${artist}\n`;
        caption += `┊ ⏱️ *Durasi* : ${duration}\n`;
        caption += `┊ 🔗 *Source* : ${source}\n`;
        caption += `╰────────────────────── ⋆ ✧\n`;
        caption += `> 🌸 *Li Shiya MD - Downloader Tools* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: { url: image_url }, 
            caption: caption 
        }, { quoted: m });

        await conn.sendMessage(m.chat, {
            audio: { url: url },
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendownload lagu.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['soundcloudplay <judul>'];
handler.tags = ['music'];
handler.command = /^(soundcloudplay|scplay)$/i;
handler.limit = true;

export default handler;