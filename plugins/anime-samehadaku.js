import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, args }) => {
    let action = args[0]?.toLowerCase();
    
    if (!action || !['latest', 'search', 'detail', 'dl'].includes(action)) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Penggunaan:* ${usedPrefix + command} <opsi> <query/url>\n┊\n┊ ☁️ *Opsi Tersedia:*\n┊ ➭ *latest* (Daftar rilis terbaru)\n┊ ➭ *search* <judul> (Cari anime)\n┊ ➭ *detail* <url> (Info detail anime)\n┊ ➭ *dl* <url> (Link download episode)\n┊\n┊ ☁️ *Contoh:* *${usedPrefix + command} search naruto*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        if (action === 'latest') {
            let res = await fetch('https://api-xemoz-official.my.id/api/library/anime/samehadaku/samehadaku-latest.php');
            let json = await res.json();
            
            if (!json.result?.status || !json.result?.data?.anime) throw new Error('Data tidak ditemukan.');
            
            let caption = `╭── ⋆ ✧ ꒰ 🎀 *SAMEHADAKU LATEST* 🎀 ꒱ ✧ ⋆ ──\n╰────────────────────── ⋆ ✧\n\n`;
            json.result.data.anime.slice(0, 10).forEach((v, i) => {
                caption += `> 🎀 *${i + 1}. ${v.title}*\n`;
                caption += `> 🌸 *Episode:* ${v.episode}\n`;
                caption += `> 📅 *Rilis:* ${v.release}\n`;
                caption += `> 🔗 *Link:* ${v.link}\n\n`;
            });
            caption += `> 🌸 *Li Shiya MD - Anime Info* 🌸`;
            
            let thumb = json.result.data.anime[0]?.thumbnail;
            if (thumb) {
                try {
                    await conn.sendMessage(m.chat, { image: { url: thumb }, caption: caption.trim() }, { quoted: m });
                } catch (e) {
                    await conn.sendMessage(m.chat, { text: caption.trim() }, { quoted: m });
                }
            } else {
                await m.reply(caption.trim());
            }
            
        } else if (action === 'search') {
            let query = args.slice(1).join(' ');
            if (!query) return m.reply(`⚠️ Masukkan judul anime! Contoh: *${usedPrefix + command} search naruto*`);
            
            let res = await fetch(`https://api-xemoz-official.my.id/api/library/anime/samehadaku/samehadaku-search.php?query=${encodeURIComponent(query)}`);
            let json = await res.json();
            
            if (!json.result?.status || !json.result?.data || json.result.data.length === 0) throw new Error('Anime tidak ditemukan.');
            
            let caption = `╭── ⋆ ✧ ꒰ 🎀 *SAMEHADAKU SEARCH* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 *Pencarian:* ${query}\n╰────────────────────── ⋆ ✧\n\n`;
            json.result.data.slice(0, 5).forEach((v, i) => {
                caption += `> 🎀 *${i + 1}. ${v.title}*\n`;
                caption += `> ⭐ *Rating:* ${v.star}\n`;
                caption += `> 🎭 *Genre:* ${v.genre.join(', ')}\n`;
                caption += `> 🔗 *Link:* ${v.link}\n\n`;
            });
            caption += `> 🌸 *Li Shiya MD - Anime Info* 🌸`;
            
            let thumb = json.result.data[0]?.thumbnail;
            if (thumb) {
                try {
                    await conn.sendMessage(m.chat, { image: { url: thumb }, caption: caption.trim() }, { quoted: m });
                } catch (e) {
                    await conn.sendMessage(m.chat, { text: caption.trim() }, { quoted: m });
                }
            } else {
                await m.reply(caption.trim());
            }
            
        } else if (action === 'detail') {
            let url = args[1];
            if (!url) return m.reply(`⚠️ Masukkan link anime! Contoh: *${usedPrefix + command} detail https://v2.samehadaku.how/...*`);
            
            let res = await fetch(`https://api-xemoz-official.my.id/api/library/anime/samehadaku/samehadaku-detail.php?link=${encodeURIComponent(url)}`);
            let json = await res.json();
            
            if (!json.result?.status || !json.result?.data) throw new Error('Detail anime tidak ditemukan.');
            
            let d = json.result.data;
            let caption = `╭── ⋆ ✧ ꒰ 🎀 *SAMEHADAKU DETAIL* 🎀 ꒱ ✧ ⋆ ──\n`;
            caption += `┊ 🌸 *Judul:* ${d.title}\n`;
            caption += `┊ ⭐ *Rating:* ${d.rating}\n`;
            caption += `┊ 🎭 *Genre:* ${d.genres.join(', ')}\n`;
            caption += `╰────────────────────── ⋆ ✧\n\n`;
            caption += `> 📝 *Deskripsi:*\n${d.description}\n\n`;
            
            if (d.episodes && d.episodes.length > 0) {
                caption += `> 🎬 *Daftar Episode:*\n`;
                d.episodes.slice(0, 5).forEach(v => {
                    caption += `> ➭ ${v.title} (${v.date})\n`;
                    caption += `> 🔗 ${v.link}\n`;
                });
                if (d.episodes.length > 5) caption += `> _...dan ${d.episodes.length - 5} episode lainnya._\n`;
            }
            caption += `\n> 🌸 *Li Shiya MD - Anime Info* 🌸`;
            
            if (d.thumbnail) {
                try {
                    await conn.sendMessage(m.chat, { image: { url: d.thumbnail }, caption: caption.trim() }, { quoted: m });
                } catch (e) {
                    await conn.sendMessage(m.chat, { text: caption.trim() }, { quoted: m });
                }
            } else {
                await m.reply(caption.trim());
            }
            
        } else if (action === 'dl') {
            let url = args[1];
            if (!url) return m.reply(`⚠️ Masukkan link episode! Contoh: *${usedPrefix + command} dl https://v1.samehadaku.how/...*`);
            
            let res = await fetch(`https://api-xemoz-official.my.id/api/library/anime/samehadaku/samehadaku-download.php?url=${encodeURIComponent(url)}`);
            let json = await res.json();
            
            if (!json.result?.status || !json.result?.data) throw new Error('Link download tidak ditemukan.');
            
            let d = json.result.data;
            let caption = `╭── ⋆ ✧ ꒰ 🎀 *SAMEHADAKU DOWNLOAD* 🎀 ꒱ ✧ ⋆ ──\n`;
            caption += `┊ 🌸 *Episode:* ${d.title}\n`;
            caption += `╰────────────────────── ⋆ ✧\n\n`;
            
            if (d.downloads && d.downloads.length > 0) {
                d.downloads.forEach(v => {
                    caption += `> 📥 *${v.name}*\n`;
                    caption += `> 🔗 ${v.link}\n\n`;
                });
            } else {
                caption += `> ⚠️ _Link download belum tersedia._\n\n`;
            }
            caption += `> 🌸 *Li Shiya MD - Anime Info* 🌸`;
            
            await m.reply(caption.trim());
        }

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses permintaan.\n┊ _${err.message || 'API Sedang Down'}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['samehadaku <opsi>'];
handler.tags = ['anime'];
handler.command = /^(samehadaku)$/i;
handler.limit = true;

export default handler;