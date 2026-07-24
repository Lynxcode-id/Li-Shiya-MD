import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🕌 *INFO* 🕌 ꒱ ✧ ⋆ ──\n┊ ✨ Masukkan nama nabi yang ingin dicari!\n┊ ☁️ Contoh: *${usedPrefix + command} muhammad*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let res = await fetch(`https://api.ikyyxd.my.id/islamic/kisahnabi?nabi=${encodeURIComponent(text.toLowerCase())}`);
        let json = await res.json();

        if (!json.status || !json.result) throw new Error("Data tidak ditemukan.");

        let data = json.result;
        let mukjizat = data.mukjizat.map((m, i) => `┊ ${i + 1}. ${m}`).join('\n');
        
        let txt = `╭── ⋆ ✧ ꒰ 🕌 *KISAH NABI* 🕌 ꒱ ✧ ⋆ ──\n`;
        txt += `┊\n`;
        txt += `┊ 👤 *Nama:* ${data.nama}\n`;
        txt += `┊ 📍 *Kelahiran:* ${data.kelahiran}\n┊\n`;
        txt += `┊ 📜 *Kisah:*\n┊ ${data.kisah}\n┊\n`;
        txt += `┊ ✨ *Mukjizat:*\n${mukjizat}\n`;
        txt += `┊\n╰────────────────────── ⋆ ✧\n> ✨ *Li Shiya MD - Islamic* ✨`;

        await m.reply(txt);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ ⚠️ *ERROR* ⚠️ ꒱ ✧ ⋆ ──\n┊ ❌ Kisah nabi tidak ditemukan atau API sedang down.\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['kisahnabi <nama>'];
handler.tags = ['islamic'];
handler.command = /^(kisahnabi)$/i;

export default handler;