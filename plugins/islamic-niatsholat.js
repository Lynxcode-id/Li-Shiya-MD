import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🕌 *INFO* 🕌 ꒱ ✧ ⋆ ──\n┊ ✨ Masukkan nama sholat yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} subuh*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let res = await fetch(`https://api.ikyyxd.my.id/islamic/niatsholat?sholat=${encodeURIComponent(text.toLowerCase())}`);
        let json = await res.json();

        if (!json.status || !json.result) throw new Error("Data tidak ditemukan.");

        let data = json.result;
        
        let txt = `╭── ⋆ ✧ ꒰ 🕌 *NIAT SHOLAT ${text.toUpperCase()}* 🕌 ꒱ ✧ ⋆ ──\n`;
        txt += `┊\n`;
        txt += `┊ 🕋 *Arab:*\n┊ ${data.arab}\n┊\n`;
        txt += `┊ 📖 *Latin:*\n┊ _${data.latin}_\n┊\n`;
        txt += `┊ 🇮🇩 *Arti:*\n┊ ${data.arti}\n`;
        txt += `┊\n╰────────────────────── ⋆ ✧\n> ✨ *Li Shiya MD - Islamic* ✨`;

        await m.reply(txt);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ ⚠️ *ERROR* ⚠️ ꒱ ✧ ⋆ ──\n┊ ❌ Niat sholat tidak ditemukan atau API sedang down.\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['niatsholat <waktu>'];
handler.tags = ['islamic'];
handler.command = /^(niatsholat)$/i;

export default handler;