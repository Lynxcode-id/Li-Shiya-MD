import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link Pinterest yang ingin didownload!\n┊ ☁️ Contoh: *${usedPrefix + command} https://pin.it/51jhggTGu*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        const { data } = await axios.get("https://api.jerexd.my.id/api/downloader/pin", {
            params: { 
                apikey: 'Lynxdecode',
                url: text.trim() 
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 20000
        });

        if (!data?.status || !data?.data?.downloads?.length) {
            throw new Error("Gagal mengambil data dari API atau media tidak ditemukan.");
        }

        const res = data.data;
        const downloads = res.downloads;

        downloads.sort((a, b) => {
            const resA = parseInt(a.quality.replace(/\D/g, '')) || 0;
            const resB = parseInt(b.quality.replace(/\D/g, '')) || 0;
            return resB - resA;
        });

        const bestQuality = downloads[0];

        // Ekstrak direct link dari parameter id agar terhindar dari error stream wrapper
        let finalUrl = bestQuality.url;
        try {
            const urlObj = new URL(finalUrl);
            const idParam = urlObj.searchParams.get('id');
            if (idParam && idParam.startsWith('http')) {
                finalUrl = idParam;
            }
        } catch (e) {
            // Abaikan jika gagal parsing, tetap gunakan url bawaan
        }

        // Fetch buffer manual menggunakan axios
        const media = await axios.get(finalUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
                'Referer': 'https://id.pinterest.com/'
            },
            timeout: 30000
        });

        const buffer = Buffer.from(media.data, 'binary');
        const ext = bestQuality.format.toLowerCase();

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *PINTEREST DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `┊ 👤 *Author* : ${res.author || 'Unknown'}\n` +
                        `┊ 📊 *Kualitas* : ${bestQuality.quality}\n` +
                        `┊ ⚖️ *Ukuran* : ${bestQuality.size}\n` +
                        `┊ 🎞️ *Format* : ${bestQuality.format}\n` +
                        `╰────────────────────── ⋆ ✧\n` +
                        `> 🌸 *Li Shiya MD - Downloader Tools* 🌸`;

        await conn.sendMessage(m.chat, {
            document: buffer,
            mimetype: ext === 'mp4' ? 'video/mp4' : (ext === 'png' ? 'image/png' : 'image/jpeg'),
            fileName: `Pinterest_HD_${bestQuality.quality}.${ext}`,
            caption: caption.trim()
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mendownload media.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['pindl <url>'];
handler.tags = ['downloader'];
handler.command = /^pindl$/i;
handler.limit = true;

export default handler;