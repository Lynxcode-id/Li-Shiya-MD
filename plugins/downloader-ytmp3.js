import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan URL YouTube yang valid!\n┊ ☁️ Contoh: ${usedPrefix + command} https://youtube.com/watch?v=B33a8YkS-hU\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const url = args[0];
        const apikey = 'Lynxdecode';
        const apiUrl = `https://api.jerexd.my.id/api/downloader/ytmp3?apikey=${apikey}&url=${encodeURIComponent(url)}`;

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.downloadUrl) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengunduh audio dari YouTube.\n╰────────────────────── ⋆ ✧');
        }

        const { title, thumbnail, downloadUrl } = json;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *YT MP3 DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 🌸 *Judul* : ${title || '-'}
╰────────────────────── ⋆ ✧
> 🎧 *Li Shiya MD - YouTube Downloader* 🌸`.trim();

        if (thumbnail) {
            await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: caption }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }

        const filename = `${title || 'Audio'}.mp3`;

        await conn.sendFile(m.chat, downloadUrl, filename, '', m, false, { 
            mimetype: 'audio/mpeg',
            asDocument: false
        });

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['ytaudio <url>', 'ytmp3 <url>'];
handler.tags = ['downloader'];
handler.command = /^(ytaudio|ytmp3)$/i;
handler.limit = true;

export default handler;