import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link Threads!\n┊ ☁️ Contoh: *${usedPrefix + command} https://www.threads.net/@rakyat_plus_62/post/Da_aaS_k5yG*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const { data } = await axios.get("https://api.jerexd.my.id/api/downloader/threads", {
            params: {
                apikey: 'Lynxdecode',
                url: text.trim()
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        if (!data?.status || !data?.media || data.media.length === 0) {
            throw new Error("Gagal mengambil data atau media tidak ditemukan.");
        }

        const medias = data.media;

        for (const media of medias) {
            if (media.type === 'video') {
                await conn.sendMessage(m.chat, { video: { url: media.url } }, { quoted: m });
            } else if (media.type === 'image') {
                await conn.sendMessage(m.chat, { image: { url: media.url } }, { quoted: m });
            }
        }

        const info = `╭── ⋆ ✧ ꒰ 🎀 *THREADS DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──\n` +
                     `┊ 👤 *Author* : ${data.author?.full_name || 'Unknown'} (@${data.author?.username || 'unknown'})\n` +
                     `┊ ❤️ *Likes* : ${data.likes || 0}\n` +
                     `┊ 📅 *Published* : ${data.publish_time || '-'}\n` +
                     `┊ 📝 *Caption* :\n` +
                     `┊ ${data.caption || '-'}\n` +
                     `╰────────────────────── ⋆ ✧\n` +
                     `> 🌸 *Li Shiya MD - Downloader Tools* 🌸`;

        await conn.sendMessage(m.chat, { text: info.trim() }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendownload media.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['threadsdl <url>'];
handler.tags = ['downloader'];
handler.command = /^threadsdl$/i;
handler.limit = true;

export default handler;