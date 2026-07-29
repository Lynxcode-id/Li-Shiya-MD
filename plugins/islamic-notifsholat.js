import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    global.db.data.chats = global.db.data.chats || {};
    let chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    chat.notifsholat = chat.notifsholat || false;

    let args = text.toLowerCase().trim();

    if (args === 'on' || args === 'enable') {
        if (chat.notifsholat) return m.reply('╭── ⋆ ✧ ꒰ 🕌 *NOTIF SHOLAT* 🕌 ꒱ ✧ ⋆ ──\n┊ ✨ Notifikasi waktu sholat sudah *AKTIF* di grup ini!\n╰────────────────────── ⋆ ✧');
        chat.notifsholat = true;
        return m.reply('╭── ⋆ ✧ ꒰ 🕌 *NOTIF SHOLAT* 🕌 ꒱ ✧ ⋆ ──\n┊ ✅ Berhasil *MENGAKTIFKAN* notifikasi sholat!\n┊ ⏰ Akan dikirim otomatis tepat waktu (Makassar / WITA).\n╰────────────────────── ⋆ ✧');
    } else if (args === 'off' || args === 'disable') {
        if (!chat.notifsholat) return m.reply('╭── ⋆ ✧ ꒰ 🕌 *NOTIF SHOLAT* 🕌 ꒱ ✧ ⋆ ──\n┊ 🌸 Notifikasi waktu sholat sudah *MATI* di grup ini.\n╰────────────────────── ⋆ ✧');
        chat.notifsholat = false;
        return m.reply('╭── ⋆ ✧ ꒰ 🕌 *NOTIF SHOLAT* 🕌 ꒱ ✧ ⋆ ──\n┊ 💤 Berhasil *MEMATIKAN* notifikasi sholat.\n╰────────────────────── ⋆ ✧');
    }

    return m.reply(`╭── ⋆ ✧ ꒰ 🕌 *INFO* 🕌 ꒱ ✧ ⋆ ──\n┊ 🌸 Ketik *${usedPrefix + command} on* untuk menghidupkan\n┊ 💤 Ketik *${usedPrefix + command} off* untuk mematikan\n╰────────────────────── ⋆ ✧`);
};

if (typeof global.notifSholatInterval === 'undefined') {
    global.notifSholatInterval = true;
    global.jadwalSholatCache = { date: '', data: {} };
    global.lastNotifSholat = '';

    setInterval(async () => {
        let conn = global.conn;
        if (!conn) return;

        let now = new Date();
        let dateStr = now.toLocaleDateString('en-US', { timeZone: 'Asia/Makassar' });
        let timeStr = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Makassar', hour12: false, hour: '2-digit', minute: '2-digit' }); 

        if (global.jadwalSholatCache.date !== dateStr) {
            try {
                let res = await fetch(`https://api.ikyyxd.my.id/download/jadwalsholat?apikey=kyzz&kota=makassar`);
                let json = await res.json();
                if (json.status && json.result) {
                    global.jadwalSholatCache.date = dateStr;
                    global.jadwalSholatCache.data = json.result.waktu;
                }
            } catch (e) {
                console.error("Gagal update API jadwal sholat", e);
            }
        }

        let jadwal = global.jadwalSholatCache.data;
        if (!jadwal || Object.keys(jadwal).length === 0) return;

        let isWaktuSholat = false;
        let namaSholat = '';

        for (let [sholat, waktu] of Object.entries(jadwal)) {
            if (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(sholat)) {
                if (timeStr === waktu && global.lastNotifSholat !== timeStr) {
                    isWaktuSholat = true;
                    namaSholat = sholat === 'Fajr' ? 'Subuh' : sholat === 'Dhuhr' ? 'Dzuhur' : sholat === 'Asr' ? 'Ashar' : sholat === 'Maghrib' ? 'Maghrib' : 'Isya';
                    break;
                }
            }
        }

        if (isWaktuSholat) {
            global.lastNotifSholat = timeStr; 
            
            let chats = Object.entries(global.db.data.chats).filter(([id, chat]) => chat.notifsholat);
            if (chats.length === 0) return;

            let caption = `╭── ⋆ ✧ ꒰ 🕌 *WAKTU SHOLAT* 🕌 ꒱ ✧ ⋆ ──\n`;
            caption += `┊\n`;
            caption += `┊ 🌸 Telah masuk waktu sholat *${namaSholat}*\n`;
            caption += `┊ 📍 Wilayah *Makassar* dan sekitarnya.\n`;
            caption += `┊ ⏱️ Pukul: *${timeStr} WITA*\n`;
            caption += `┊\n`;
            caption += `┊ _"Marilah sejenak kita tinggalkan aktivitas_\n`;
            caption += `┊ _dan mendirikan sholat."_\n`;
            caption += `┊\n╰────────────────────── ⋆ ✧\n> ✨ *Li Shiya MD - Islamic* ✨`;

            let imgUrl = 'https://raw.githubusercontent.com/Lynxcode-id/picture/main/1784860961026.jpeg';

            for (let [id] of chats) {
                try {
                    await conn.sendMessage(id, { 
                        image: { url: imgUrl }, 
                        caption: caption 
                    });
                } catch (e) {}
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }, 1000 * 30);
}

handler.help = ['notifsholat <on/off>'];
handler.tags = ['islamic'];
handler.command = /^(notifsholat)$/i;

export default handler;