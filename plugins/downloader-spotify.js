import fetch from 'node-fetch';

async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fetch(url, options);
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link Spotify yang ingin didownload!\n┊ ☁️ Contoh: ${usedPrefix + command} https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT\n╰────────────────────── ⋆ ✧`);
    }

    let isSpotify = /spotify\.com/i.test(text);
    if (!isSpotify) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Link yang lu kirim bukan link Spotify yang valid wak!\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('🍃');

    try {
        const apiUrl = `https://lynxapis.my.id/api/downloader/spotify?url=${encodeURIComponent(text)}`;

        const response = await fetchWithRetry(apiUrl);
        const json = await response.json();

        if (!json.status || !json.data || !json.data.download_url) {
            await m.react('🍂');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendapatkan data dari API atau lagu tidak ditemukan.\n╰────────────────────── ⋆ ✧');
        }

        const { title, artist, duration, cover, download_url } = json.data;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *S P O T I F Y* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Judul*   : ${title}\n┊ 👤 *Artis*   : ${artist}\n┊ 🕒 *Durasi*  : ${duration}\n╰────────────────────── ⋆ ✧\n> 🎧 *Li Shiya MD - Sedang mengunduh audio...* 🌸`.trim();

        await conn.sendMessage(m.chat, { image: { url: cover }, caption: caption }, { quoted: m });

        const audioResponse = await fetchWithRetry(download_url);
        const audioBuffer = await audioResponse.buffer();

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: `${title} - ${artist}.mp3`
        }, { quoted: m });
        
        await m.react('🌸');

    } catch (e) {
        console.error(e);
        await m.react('🍂');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat mengunduh atau mengirim audio.\n┊ _${e.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['spotify <url>'];
handler.tags = ['downloader'];
handler.command = /^(spotify|spotifydl)$/i;
handler.limit = true;

export default handler;