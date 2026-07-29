import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan URL Facebook yang valid!\n┊ ☁️ Contoh: ${usedPrefix + command} https://www.facebook.com/share/r/1avNE7Tyr1/\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const url = args[0];
        const apikey = 'x34J0'; 
        const apiUrl = `https://api.blckrose.my.id/download/fb?url=${encodeURIComponent(url)}&apikey=${apikey}`;

        const response = await fetch(apiUrl);
        const json = await response.json();

        if (!json.status || !json.result) {
            await m.react('❌');
            return m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil data dari API.\n╰────────────────────── ⋆ ✧');
        }

        const { title, author, videoUrl } = json.result;

        const cleanTitle = title ? (title.length > 150 ? title.substring(0, 150) + '...' : title) : '-';

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *FB DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ 🌸 *Author* : ${author || '-'}
┊ 📝 *Title*  : ${cleanTitle.trim()}
╰────────────────────── ⋆ ✧
> 🎧 *Li Shiya MD - Facebook Downloader* 🌸`.trim();

        if (videoUrl) {
            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: caption 
            }, { quoted: m });
            await m.react('✅');
        } else {
            await m.react('❌');
            m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Video URL tidak ditemukan.\n╰────────────────────── ⋆ ✧');
        }

    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply('╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Terjadi kesalahan saat memproses permintaan.\n╰────────────────────── ⋆ ✧');
    }
};

handler.help = ['fb <url>'];
handler.tags = ['downloader'];
handler.command = /^(fb|facebookdl)$/i;
handler.limit = true;

export default handler;