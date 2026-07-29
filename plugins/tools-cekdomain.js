import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan nama domain yang ingin dicek!\n┊ ☁️ Contoh: *${usedPrefix + command} google.com*\n╰────────────────────── ⋆ ✧`);
    }

    const domain = text.replace(/^https?:\/\//i, '').replace(/\/$/, '').trim();
    await m.react('⏳');

    try {
        const { data } = await axios.get("https://api-xemoz-official.my.id/api/tools/info-domain.php", {
            params: { domain },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        if (!data?.status || !data?.result) {
            throw new Error("Gagal mengambil informasi dari API.");
        }

        const {
            domain: resDomain,
            registered,
            registrar,
            status,
            registeredAt,
            expiresAt,
            expiration,
            nameservers,
            dns
        } = data.result;

        const caption = `╭── ⋆ ✧ ꒰ 🎀 *DOMAIN INFORMATION* 🎀 ꒱ ✧ ⋆ ──\n` +
                        `┊ 🌐 *Domain* : ${resDomain || '-'}\n` +
                        `┊ 📌 *Registered* : ${registered ? 'Ya' : 'Tidak'}\n` +
                        `┊ 🏢 *Registrar* : ${registrar || '-'}\n` +
                        `┊ 📜 *Status* : ${status?.join(', ') || '-'}\n` +
                        `┊ 📅 *Registered At* : ${registeredAt || '-'}\n` +
                        `┊ ⏳ *Expires At* : ${expiresAt || '-'}\n` +
                        `┊ ⏱️ *Sisa Hari* : ${expiration?.daysLeft ?? '-'} Hari\n` +
                        `┊ 🖥️ *Name Servers* : ${nameservers?.join(', ') || '-'}\n` +
                        `┊ 📍 *IP Address (A)* : ${dns?.A?.join(', ') || '-'}\n` +
                        `╰────────────────────── ⋆ ✧\n` +
                        `> 🌸 *Li Shiya MD - Information Tools* 🌸`;

        await m.reply(caption.trim());
        await m.react('✅');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ Gagal melacak info domain.\n┊ _${err.message}_\n╰────────────────────── ⋆ ✧`);
    }
};

handler.help = ['infodomain <domain>'];
handler.tags = ['tools'];
handler.command = /^(infodomain|cekdomain)$/i;
handler.limit = true;

export default handler;