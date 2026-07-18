import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    conn.ytmp4 = conn.ytmp4 || {};

    if (command === 'getvid') {
        const userId = m.sender;
        const session = conn.ytmp4[userId];

        if (!session) {
            return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Sesi tidak ditemukan.\n┊ 🌸 Silakan cari video terlebih dahulu menggunakan:\n┊ ☁️ *${usedPrefix}ytmp4 <url>*\n╰────────────────────── ⋆ ✧`);
        }

        if (!args[0]) {
            return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Silakan pilih resolusi yang ingin diunduh!\n┊ ☁️ Contoh: *${usedPrefix}getvid 1080*\n╰────────────────────── ⋆ ✧`);
        }

        const targetQuality = args[0].replace(/p/gi, '');
        let selected = session.video.find(v => v.quality === targetQuality);
        let isNoAudio = false;
        if (!selected) {
            selected = session.videoOnly.find(v => v.quality === targetQuality);
            if (selected) isNoAudio = true;
        }

        if (!selected) {
            const availVideo = session.video.map(v => `${v.quality}p`).join(', ') || '-';
            const availVideoOnly = session.videoOnly.map(v => `${v.quality}p`).join(', ') || '-';
            return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Resolusi *${targetQuality}p* tidak ditemukan!\n┊\n┊ 📹 *Video + Audio:* ${availVideo}\n┊ 🔇 *Video Only:* ${availVideoOnly}\n╰────────────────────── ⋆ ✧`);
        }

        await m.react('⏳');

        try {
            const caption = `╭── ⋆ ✧ ꒰ 🎀 *YT MP4 DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 🌸 *Judul* : ${session.title}
┊ 📹 *Resolusi* : ${selected.quality}p ${isNoAudio ? '(Tanpa Audio)' : ''}
╰────────────────────── ⋆ ✧
> 🎧 *Li Shiya MD - YouTube Downloader* 🌸`.trim();

            await conn.sendMessage(m.chat, { 
                video: { url: selected.url }, 
                caption: caption 
            }, { quoted: m });
            await m.react('✅');

        } catch (e) {
            console.error(e);
            await m.react('❌');
            m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat mengirim video. File mungkin terlalu besar.\n╰────────────────────── ⋆ ✧');
        }
        return;
    }
    
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan URL YouTube yang valid!\n┊ ☁️ Contoh: *${usedPrefix + command} https://youtube.com/watch?v=B33a8YkS-hU*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const url = args[0];
        const apikey = 'Lynxdecode';
        const apiUrl = `https://api.jerexd.my.id/api/downloader/ytmp4v2?apikey=${apikey}&url=${encodeURIComponent(url)}`;

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.data || json.data.length === 0) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil data video dari API.\n╰────────────────────── ⋆ ✧');
        }

        const videoData = json.data[0];
        const { title, duration, thumb, video, videoOnly } = videoData;
        conn.ytmp4[m.sender] = {
            title,
            video: video || [],
            videoOnly: videoOnly || []
        };

        const listVideo = video && video.length > 0 
            ? video.map(v => `• *${v.quality}p*`).join('\n') 
            : '_Tidak tersedia_';
            
        const listVideoOnly = videoOnly && videoOnly.length > 0 
            ? videoOnly.map(v => `• *${v.quality}p* (Size: ${v.size || 'N/A'})`).join('\n') 
            : '_Tidak tersedia_';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *YT MP4 SELECTOR* 🎀 ꒱ ✧ ⋆ ──
┊ 🌸 *Judul* : ${title || '-'}
┊ 🕒 *Durasi* : ${duration || '-'}
┊ 
┊ 📹 *Resolusi Video + Audio:*
${listVideo.split('\n').map(line => `┊ ${line}`).join('\n')}
┊ 
┊ 🔇 *Resolusi Video Only (HD / No Audio):*
${listVideoOnly.split('\n').map(line => `┊ ${line}`).join('\n')}
╰────────────────────── ⋆ ✧
> 💡 *Silakan pilih resolusi dengan mengetik:*
> *${usedPrefix}getvid [resolusi]*
> *Contoh:* *${usedPrefix}getvid 1080*`.trim();

        if (thumb) {
            await conn.sendMessage(m.chat, { image: { url: thumb }, caption: caption }, { quoted: m });
        } else {
            await conn.reply(m.chat, caption, m);
        }
        await m.react('✅');

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['ytmp4 <url>', 'getvid <quality>'];
handler.tags = ['downloader'];
handler.command = /^(ytmp4|ytv|getvid)$/i;
handler.limit = true;

export default handler;