import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan URL yang valid!\n┊ ☁️ Contoh: ${usedPrefix + command} https://vt.tiktok.com/ZSXfxk2ju/\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const url = args[0];
        const apikey = 'x34J0'; 
        const apiUrl = `https://api.blckrose.my.id/download/aio?url=${encodeURIComponent(url)}&apikey=${apikey}`;

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil data dari API.\n╰────────────────────── ⋆ ✧');
        }

        const { title, duration, platform, medias } = json.result;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *AIO DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 🌸 *Judul*    : ${title ? title.trim() : '-'}
┊ 🕒 *Durasi*   : ${duration ? duration + ' detik' : '-'}
┊ ☁️ *Platform* : ${platform ? platform.toUpperCase() : '-'}
╰────────────────────── ⋆ ✧
> 🎧 *Li Shiya MD - AIO Downloader* 🌸`.trim();

        const images = medias.filter(v => v.type === 'image');
        const videos = medias.filter(v => v.type === 'video');
        const audios = medias.filter(v => v.type === 'audio');

        if (images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                await conn.sendMessage(m.chat, { image: { url: images[i].url } }, { quoted: m });
                await new Promise(resolve => setTimeout(resolve, 1500)); 
            }
            await conn.reply(m.chat, caption, m);
            await m.react('✅');

        } else if (videos.length > 0) {
            let selectedVideo = videos.find(v => v.quality === 'hd_no_watermark') || 
                                videos.find(v => v.quality === 'no_watermark') || 
                                videos[0]; 

            await conn.sendMessage(m.chat, { 
                video: { url: selectedVideo.url }, 
                caption: caption 
            }, { quoted: m });
            await m.react('✅');

        } else if (audios.length > 0) {
            await conn.sendMessage(m.chat, { 
                audio: { url: audios[0].url }, 
                mimetype: 'audio/mpeg' 
            }, { quoted: m });
            await conn.reply(m.chat, caption, m);
            await m.react('✅');
            
        } else {
            await m.react('❌');
            m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Tidak ada media yang ditemukan atau didukung.\n╰────────────────────── ⋆ ✧');
        }

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['aio'];
handler.tags = ['downloader'];
handler.command = /^aio$/i;
handler.limit = true;

export default handler;