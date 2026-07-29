import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan kata kunci berita yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} teknologi*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let apiUrl = `https://api-xemoz-official.my.id/api/news/news-detik.php?search=${encodeURIComponent(text)}`;
        let response = await fetch(apiUrl);
        let json = await response.json();

        if (!json.status || !json.result || !json.result.data || !json.result.data.headline || json.result.data.headline.length === 0) {
            throw new Error("Berita tidak ditemukan.");
        }

        let headlines = json.result.data.headline;
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *DETIK NEWS* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `┊ 🌸 *Pencarian:* ${text}\n`;
        caption += `┊ ☁️ *Sumber:* ${json.result.source}\n`;
        caption += `╰────────────────────── ⋆ ✧\n\n`;

        // Ambil maksimal 5 berita teratas agar tidak kepanjangan
        let validImage = null;

        headlines.slice(0, 5).forEach((news, index) => {
            caption += `> 🎀 *${index + 1}. ${news.title}*\n`;
            if (news.date) caption += `> 📅 *Tanggal:* ${news.date}\n`;
            caption += `> 🔗 *Link:* ${news.link}\n\n`;
            
            // Cari gambar pertama yang valid/tidak null untuk dijadikan thumbnail
            if (!validImage && news.image) {
                validImage = news.image;
            }
        });

        caption += `> 🌸 *Li Shiya MD - Portal Berita* 🌸`;

        if (validImage) {
            await conn.sendMessage(m.chat, { 
                image: { url: validImage }, 
                caption: caption.trim() 
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, { text: caption.trim() }, { quoted: m });
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil berita.\n┊ _${err.message || 'API Sedang Down'}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['detik <pencarian>'];
handler.tags = ['berita'];
handler.command = /^(detik)$/i;
handler.limit = true;

export default handler;