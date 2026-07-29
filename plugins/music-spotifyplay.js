import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan judul lagu!\n┊ ☁️ Contoh: ${usedPrefix + command} aftershock\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const query = args.join(' ');
        const apikey = 'x34J0'; 
        const apiUrl = `https://api.blckrose.my.id/download/spotify-play?q=${encodeURIComponent(query)}&bitrate=128k&apikey=${apikey}`;

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil data dari API.\n╰────────────────────── ⋆ ✧');
        }

        const { title, artists, album, duration, cover, spotify_url, play_url } = json.result;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *SPOTIFY PLAY* 🎀 ꒱ ✧ ⋆ ──
┊ 🌸 *Judul*  : ${title !== '-' ? title : query}
┊ 👤 *Artis*  : ${artists !== '-' ? artists : 'Unknown'}
┊ 💽 *Album*  : ${album !== '-' ? album : '-'}
┊ 🕒 *Durasi* : ${duration !== '-' ? duration : '-'}
┊ 🔗 *Link*   : ${spotify_url !== '-' ? spotify_url : '-'}
╰────────────────────── ⋆ ✧
> 🎧 *Li Shiya MD - Spotify Downloader* 🌸`.trim();

        if (cover !== '-' && cover) {
            await conn.sendMessage(m.chat, { image: { url: cover }, caption: caption }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }

        if (play_url && play_url !== '-') {
            await conn.sendMessage(m.chat, { 
                audio: { url: play_url }, 
                mimetype: 'audio/mpeg',
                fileName: `${title !== '-' ? title : 'Audio'}.mp3`
            }, { quoted: m });
            await m.react('✅');
        } else {
            await m.react('❌');
            m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Audio tidak ditemukan.\n╰────────────────────── ⋆ ✧');
        }

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['spotifyplay', 'splay'];
handler.tags = ['music'];
handler.command = /^spotifyplay|splay$/i;
handler.limit = true;

export default handler;