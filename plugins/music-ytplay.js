import fetch from 'node-fetch';
import yts from 'yt-search';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan judul lagu yang ingin diputar!\n┊ ☁️ Contoh: ${usedPrefix + command} everything u are hindia\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const searchResults = await yts(text);
        const video = searchResults.videos[0];

        if (!video) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Video tidak ditemukan di YouTube.\n╰────────────────────── ⋆ ✧');
        }

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *Y T - P L A Y* 🎀 ꒱ ✧ ⋆ ──
┊ 🌸 *Judul*   : ${video.title}
┊ 👤 *Channel* : ${video.author.name}
┊ 🕒 *Durasi*  : ${video.timestamp}
┊ 👁️ *Views*   : ${formatNumber(video.views)}
╰────────────────────── ⋆ ✧
> 🎧 *Li Shiya MD - Sedang mengunduh audio...* 🌸`.trim();

        await conn.sendMessage(m.chat, { image: { url: video.thumbnail }, caption: caption }, { quoted: m });

        const apikey = 'x34J0'; 
        const apiUrl = `https://api.blckrose.my.id/download/ytmp3/v2?url=${encodeURIComponent(video.url)}&bitrate=128&apikey=${apikey}`;

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.result || !json.result.url) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengonversi video ke MP3.\n╰────────────────────── ⋆ ✧');
        }

        const audioUrl = json.result.url;
        const filename = json.result.filename || `${video.title}.mp3`;

        await conn.sendFile(m.chat, audioUrl, filename, '', m, false, { mimetype: 'audio/mpeg' });
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat mengunduh atau mengirim audio.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['play <judul>'];
handler.tags = ['music'];
handler.command = /^(play|ytplay)$/i;
handler.limit = true;

export default handler;

function formatNumber(num) {
    if (!num) return '0';
    const suffixes = ['', 'k', 'M', 'B', 'T'];
    const numString = Math.abs(num).toString();
    const numDigits = numString.length;
  
    if (numDigits <= 3) return numString;
  
    const suffixIndex = Math.floor((numDigits - 1) / 3);
    let formattedNum = (num / Math.pow(1000, suffixIndex)).toFixed(1);
    
    if (formattedNum.endsWith('.0')) {
      formattedNum = formattedNum.slice(0, -2);
    }
  
    return formattedNum + suffixes[suffixIndex];
}