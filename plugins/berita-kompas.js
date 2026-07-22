import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan kata kunci berita yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} politik*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let apiUrl = `https://api-xemoz-official.my.id/api/news/news-kompas.php?search=${encodeURIComponent(text)}`;
        let response = await fetch(apiUrl);
        let json = await response.json();

        if (!json.status || !json.result || !json.result.data || !json.result.data.latestNews || json.result.data.latestNews.length === 0) {
            throw new Error("Berita tidak ditemukan.");
        }

        let headlines = json.result.data.latestNews;
        
        let caption = `╭── ⋆ ✧ ꒰ 🎀 *KOMPAS NEWS* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `┊ 🌸 *Pencarian:* ${text}\n`;
        caption += `┊ ☁️ *Sumber:* ${json.result.source}\n`;
        caption += `╰────────────────────── ⋆ ✧\n\n`;

        // Ambil maksimal 5 berita terbaru
        headlines.slice(0, 5).forEach((news, index) => {
            caption += `> 🎀 *${index + 1}. ${news.title}*\n`;
            if (news.category && news.date) caption += `> 📅 *${news.category}* - ${news.date}\n`;
            caption += `> 🔗 *Link:* ${news.link}\n\n`;
        });

        caption += `> 🌸 *Li Shiya MD - Portal Berita* 🌸`;

        let firstImage = headlines[0].image;

        if (firstImage) {
            await conn.sendMessage(m.chat, { 
                image: { url: firstImage }, 
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

handler.help = ['kompas <pencarian>'];
handler.tags = ['berita'];
handler.command = /^(kompas)$/i;
handler.limit = true;

export default handler;