import fetch from 'node-fetch';

let handler = async (m, { conn, command }) => {
    await m.react('⏳');

    try {
        const apikey = 'kyzz824425738250';
        
        const typeRaw = command.replace(/^pap/i, '');
        const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        const type = capitalize(typeRaw);
        
        const apiUrl = `https://api.kyzzz.eu.cc/api/cecan/${type}?apikey=${apikey}`;

        let res = await fetch(apiUrl);
        if (!res.ok) throw new Error('Server down atau API limit.');

        let contentType = res.headers.get('content-type');
        let imgUrl = apiUrl;

        if (contentType && contentType.includes('application/json')) {
            let json = await res.json();
            imgUrl = json.result || json.url || json.data || apiUrl;
        }

        let caption = `╭── ⋆ ✧ ꒰ 🎀 *RANDOM CECAN* 🎀 ꒱ ✧ ⋆ ──\n`;
        caption += `┊ 🌸 *Tipe:* ${type}\n`;
        caption += `╰────────────────────── ⋆ ✧\n> 🌸 *Li Shiya MD - Random Image* 🌸`;

        await conn.sendMessage(m.chat, { 
            image: { url: imgUrl }, 
            caption: caption 
        }, { quoted: m });

        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal mengambil gambar.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['papvietnam', 'papthailand', 'papryujin', 'papmalaysia', 'papkorea', 'papjapan', 'papindonesia', 'paphijaber', 'papchina'];
handler.tags = ['random'];
handler.command = /^(papvietnam|papthailand|papryujin|papmalaysia|papkorea|papjapan|papindonesia|paphijaber|papchina)$/i;
handler.limit = true;

export default handler;