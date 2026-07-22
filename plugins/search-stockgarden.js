import axios from 'axios';

const handler = async (m, { conn }) => {
    await m.react('🌼');

    try {
        const { data } = await axios.get("https://api.jagoanproject.com/api/search/growgarden-stock", {
            headers: {
                'Authorization': 'Bearer Lynxdecode',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });

        if (!data?.status || !data?.result) {
            throw new Error("Gagal mengambil data stock Garden.");
        }

        const res = data.result;
        const weather = res.weather || {};
        
        let info = `╭── ⋆ ✧ ꒰ 🎀 *GARDEN STOCK* 🎀 ꒱ ✧ ⋆ ──\n` +
                   `┊ 💬 *Info* : ${res.message || '-'}\n` +
                   `┊ ⏳ *Restock* : ${res.restockInLabel || '-'}\n` +
                   `┊ 🌤️ *Cuaca* : ${weather.type || '-'} (${weather.active ? 'Aktif' : 'Tidak Aktif'})\n`;

        if (weather.effects && weather.effects.length > 0) {
            info += `┊ 🔮 *Efek* : ${weather.effects.join(', ')}\n`;
        }

        info += `┊ ──────────────────────\n┊ 🌱 *SEEDS (BIJI-BIJIAN)* :\n`;
        if (res.seeds && res.seeds.length > 0) {
            res.seeds.forEach(seed => {
                info += `┊ • ${seed.name} (x${seed.quantity})\n`;
            });
        } else {
            info += `┊ • Kosong\n`;
        }

        info += `┊ ──────────────────────\n┊ ⚙️ *GEAR (PERALATAN)* :\n`;
        if (res.gear && res.gear.length > 0) {
            res.gear.forEach(g => {
                info += `┊ • ${g.name} (x${g.quantity})\n`;
            });
        } else {
            info += `┊ • Kosong\n`;
        }

        info += `┊ ──────────────────────\n┊ 📦 *CRATES (PETI)* :\n`;
        if (res.crates && res.crates.length > 0) {
            res.crates.forEach(crate => {
                info += `┊ • ${crate.name} (x${crate.quantity})\n`;
            });
        } else {
            info += `┊ • Kosong\n`;
        }

        info += `╰────────────────────── ⋆ ✧\n\n> 🌸 *Li Shiya MD - Garden Tools* 🌸`;

        await m.reply(info.trim());
        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal memuat data stock.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['stockgarden'];
handler.tags = ['search'];
handler.command = /^stockgarden$/i;
handler.limit = true;

export default handler;