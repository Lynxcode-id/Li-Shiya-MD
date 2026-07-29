import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🕌 *INFO* 🕌 ꒱ ✧ ⋆ ──\n┊ ✨ Masukkan nama kota yang ingin dicari jadwal sholatnya!\n┊ ☁️ Contoh: *${usedPrefix + command} makassar*\n╰────────────────────── ⋆ ✧`);
    }

    await m.react('⏳');

    try {
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        };

        // Memasukkan input kota dari user
        let url = `https://api.ikyyxd.my.id/download/jadwalsholat?apikey=kyzz&kota=${encodeURIComponent(text.toLowerCase())}`;
        let res = await fetch(url, { headers, timeout: 60000 });
        let json = await res.json();

        if (!json.status || !json.result) throw new Error("Data kota tidak ditemukan.");

        let data = json.result;
        let waktu = data.waktu;
        
        let txt = `╭── ⋆ ✧ ꒰ 🕌 *JADWAL SHOLAT* 🕌 ꒱ ✧ ⋆ ──\n`;
        txt += `┊\n`;
        txt += `┊ 📍 *Lokasi:* ${data.lokasi}\n`;
        txt += `┊ 📅 *Masehi:* ${data.tanggal}\n`;
        txt += `┊ 🌙 *Hijriah:* ${data.hijri}\n`;
        txt += `┊\n`;
        txt += `┊ ⏱️ *Imsak:* ${waktu.Imsak}\n`;
        txt += `┊ ⏱️ *Subuh (Fajr):* ${waktu.Fajr}\n`;
        txt += `┊ ⏱️ *Terbit (Sunrise):* ${waktu.Sunrise}\n`;
        txt += `┊ ⏱️ *Dzuhur:* ${waktu.Dhuhr}\n`;
        txt += `┊ ⏱️ *Ashar:* ${waktu.Asr}\n`;
        txt += `┊ ⏱️ *Maghrib:* ${waktu.Maghrib}\n`;
        txt += `┊ ⏱️ *Isya:* ${waktu.Isha}\n`;
        txt += `┊\n`;
        txt += `┊ 🌌 *1/3 Malam Pertama:* ${waktu.Firstthird}\n`;
        txt += `┊ 🌌 *Tengah Malam:* ${waktu.Midnight}\n`;
        txt += `┊ 🌌 *1/3 Malam Terakhir:* ${waktu.Lastthird}\n`;
        txt += `┊\n╰────────────────────── ⋆ ✧\n> ✨ *Li Shiya MD - Islamic* ✨`;

        await m.reply(txt);
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        m.reply(`╭── ⋆ ✧ ꒰ ⚠️ *ERROR* ⚠️ ꒱ ✧ ⋆ ──\n┊ ❌ Jadwal sholat tidak ditemukan atau API sedang gangguan.\n┊ _Pastikan nama kota ditulis dengan benar!_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['jadwalsholat <kota>', 'sholat <kota>'];
handler.tags = ['islamic'];
handler.command = /^(jadwalsholat|sholat)$/i;

export default handler;