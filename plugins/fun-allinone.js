/**
 * ───「 FEATURE AUTHOR 」───
 * 👤 Developer : Lynx Decode
 * ─────────────────────────
 * 📝 Plugin : All-in-One Fun Cek (Li Shiya UI)
 */

import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let name = text ? text.trim() : m.pushName || "Kamu";

    await m.react('⏳');

    try {
        const cmd = command.toLowerCase();
        const apiUrl = `https://api.jagoanproject.com/api/fun/${cmd}?name=${encodeURIComponent(name)}`;
        
        const reqHeaders = {
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'application/json'
            }
        };

        const { data } = await axios.get(apiUrl, reqHeaders);

        if (!data.status || !data.result) {
            throw new Error(data.message || "Gagal mengambil data dari API.");
        }

        let resultText = data.result.trim().split('\n');
        const cleanCommand = command.replace(/^cek/i, 'CEK ').toUpperCase();
        
        let cap = `╭── ⋆ ✧ ꒰ 🎀 *${cleanCommand}* 🎀 ꒱ ✧ ⋆ ──\n`;
        cap += `┊ 👤 *Target* : ${name}\n`;
        cap += `┊ ──────────────────────\n`;
        resultText.forEach(line => {
            cap += `┊ 🌸 ${line}\n`;
        });
        cap += `╰────────────────────── ⋆ ✧\n> 🎭 *Li Shiya MD - Fun Cek* 🌸`;

        await m.reply(cap);
        await m.react('✅');

    } catch (e) {
        console.error(`[FUN CEK ERROR - ${command}]`, e);
        await m.react('❌');
        
        let errMsg = e.response?.data?.message || e.message || "Internal Server Error";
        
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *SYSTEM ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengeksekusi fitur:\n┊ 🌸 ${errMsg}\n╰────────────────────── ⋆ ✧`);
    }
}

handler.help = [
    'cekbadut', 'cekboti', 'cekcantik', 'cekcool', 'cekfemboy', 
    'cekganteng', 'cekgila', 'cekhalu', 'cekhoki', 'cekidiot', 
    'cekimut', 'cekkebaikan', 'cekkejahatan', 'cekkeren', 
    'cekkesehatan', 'cekmager', 'cekmental', 'ceknolep', 
    'cekpinter', 'ceksifat', 'cektoxic', 'cekwibu', 'roasting'
].map(v => v + ' <nama>');

handler.tags = ['fun'];

handler.command = /^(cekbadut|cekboti|cekcantik|cekcool|cekfemboy|cekganteng|cekgila|cekhalu|cekhoki|cekidiot|cekimut|cekkebaikan|cekkejahatan|cekkeren|cekkesehatan|cekmager|cekmental|ceknolep|cekpinter|ceksifat|cektoxic|cekwibu|roasting)$/i;

export default handler;