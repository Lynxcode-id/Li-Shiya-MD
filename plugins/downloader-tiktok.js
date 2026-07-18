/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : INF Team's x Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : TikTok Downloader V2 (AIRich - Li Shiya UI)
 */

import fetch from 'node-fetch';
import { AIRich } from '../lib/nixcode.js';

async function shortUrl(url) {
    try {
        let res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        return await res.text();
    } catch (e) {
        return url;
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan link TikTok yang ingin diunduh!\n┊ ☁️ Contoh: *${usedPrefix + command} https://vt.tiktok.com/ZSQqYFBMm/*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let res = await fetch(`https://api.jagoanproject.com/api/downloader/tiktokdl?q=${encodeURIComponent(args[0])}`, {
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        });
        
        let json = await res.json();

        if (!json.status || !json.result) throw new Error('Gagal mengambil data dari API!');

        let { video, audio } = json.result;

        let tags = ['#TikTok', '#FYP', '#LiShiya', '#LynxDecode'];
        let shortVideo = await shortUrl(video);
        let shortMusic = await shortUrl(audio);

        let captionText = `╭── ⋆ ✧ ꒰ 🎀 *TIKTOK DOWNLOADER* 🎀 ꒱ ✧ ⋆ ──
┊ ✨ *Data berhasil diproses!*
┊ 
┊ 🎥 *Video URL:* ${shortVideo}
┊ 🎵 *Audio URL:* ${shortMusic}
╰────────────────────── ⋆ ✧
> 🌸 *Li Shiya MD - TikTok V2* 🌸`.trim();

        await new AIRich(conn)
            .setTitle('🎀 𝗧𝗜𝗞𝗧𝗢𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 🎀')
            .setFooter('© Li Shiya MD - Lynx Decode') 
            .addSuggest(tags) 
            .addTip('🌸 Berhasil mendownload video TikTok!')
            .addVideo(video) 
            .addText(captionText)
            .addProduct([
                {
                    title: '🎥 Buka Video Direct Link', 
                    brand: 'TikTok', 
                    price: 'Rp 99.000', 
                    sale_price: 'Gratis', 
                    product_url: shortVideo, 
                    icon_url: 'https://files.catbox.moe/2ew0ed.jpg', 
                    image_url: 'https://files.catbox.moe/2ew0ed.jpg'
                },
                {
                    title: '🎵 Download Audio (MP3)', 
                    brand: 'Audio', 
                    price: 'Rp 50.000', 
                    sale_price: 'Gratis', 
                    product_url: shortMusic, 
                    icon_url: 'https://files.catbox.moe/bxwfne.jpg', 
                    image_url: 'https://files.catbox.moe/bxwfne.jpg'
                }
            ]) 
            .send(m.chat, { quoted: m });

        // Mengirimkan audio (lagu TikTok) secara terpisah
        if (audio) {
            await conn.sendMessage(m.chat, { 
                audio: { url: audio }, 
                mimetype: 'audio/mpeg',
                ptt: false 
            }, { quoted: m });
        }

        await m.react('✅');
    } catch (e) {
        console.error('[TIKTOK V2 AIRICH ERROR]', e);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memproses video TikTok:\n┊ _${e.message || "Internal Server Error"}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['tiktok', 'tt'];
handler.tags = ['downloader'];
handler.command = /^(tiktok|tt)$/i; 
handler.limit = true;

export default handler;