import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    global.db.data.chats = global.db.data.chats || {};
    let chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {};
    chat.autoai = chat.autoai || false;

    let args = text.toLowerCase().trim();

    if (args === 'on' || args === 'enable') {
        if (chat.autoai) return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AUTO AI* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Auto AI di chat ini sudah *AKTIF* dari tadi, cuy!\n╰────────────────────── ⋆ ✧');
        chat.autoai = true;
        return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AUTO AI* 🎀 ꒱ ✧ ⋆ ──\n┊ ✨ Berhasil *MENGAKTIFKAN* Auto AI di chat ini!\n┊ ☁️ Sekarang aku bakal otomatis nanggepin setiap chat yang masuk ya.\n╰────────────────────── ⋆ ✧');
    } else if (args === 'off' || args === 'disable') {
        if (!chat.autoai) return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AUTO AI* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Auto AI di chat ini emang lagi *MATI*, ih!\n╰────────────────────── ⋆ ✧');
        chat.autoai = false;
        return m.reply('╭── ⋆ ✧ ꒰ 🎀 *AUTO AI* 🎀 ꒱ ✧ ⋆ ──\n┊ 💤 Berhasil *MEMATIKAN* Auto AI di chat ini.\n╰────────────────────── ⋆ ✧');
    }

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    if (!text && !mime.startsWith('image/')) {
        return m.reply(`╭── ⋆ ✧ ꒰ 🎀 *INFO* 🎀 ꒱ ✧ ⋆ ──\n┊ 🌸 Masukkan pertanyaan, balas gambar, atau ketik *${usedPrefix + command} on / off*!\n┊ ☁️ Contoh: *${usedPrefix + command} on* (untuk aktifin auto chat)\n╰────────────────────── ⋆ ✧`);
    }

    await processAIResponse(m, conn, text, q, mime);
};

handler.before = async function (m, { conn }) {
    if (m.isBaileys || m.fromMe) return;
    if (!m.text) return;

    global.db.data.chats = global.db.data.chats || {};
    let chat = global.db.data.chats[m.chat];
    if (!chat || !chat.autoai) return;

    let prefix = /^[°•π÷×¶∆£¢€¥®™+=|~<>;,!#./?-]/;
    if (prefix.test(m.text)) return;

    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';

    await processAIResponse(m, conn, m.text, q, mime);
    return true;
};

async function processAIResponse(m, conn, text, q, mime) {
    await m.react('🌼');

    try {
        const apiKey = "AIzaSyBBgURzZMz30vQPPDL6A0VddgaupMS_Oxo";
        let parts = [];
        
        if (text) {
            parts.push({ text: text.trim() });
        } else if (mime.startsWith('image/')) {
            parts.push({ text: "Tolong jelaskan gambar ini secara detail dan menyeluruh." });
        }

        if (mime.startsWith('image/')) {
            let media = await q.download();
            parts.push({
                inline_data: {
                    mime_type: mime,
                    data: media.toString('base64')
                }
            });
        }

        const payload = {
            system_instruction: {
                parts: { 
                    text: "Kamu adalah asisten lynx super cerdas, logis, dan ahli dalam problem-solving. Berikan jawaban yang terstruktur, komprehensif, dan secepat mungkin Gunakan bahasa Indonesia kek manusia biasa bisa marah dan emosi bahagia dan senang bertingkahlah selayaknya perempuan remaja yang random." 
                }
            },
            contents: [{
                parts: parts
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 65536,
            }
        };

        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
        };

        let answer = '';
        let usedModel = 'Gemini 3.5 Flash';

        try {
            const url35 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
            const { data } = await axios.post(url35, payload, { headers, timeout: 60000 });
            
            if (!data?.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error("Respons kosong dari Gemini 3.5 Flash.");
            }
            answer = data.candidates[0].content.parts[0].text.trim();

        } catch (err35) {
            console.error("Gemini 3.5 Flash Error, Fallback ke 3.1 Flash-Lite...", err35.message);
            
            usedModel = 'Gemini 3.1 Flash-Lite';
            const url31 = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;
            const { data } = await axios.post(url31, payload, { headers, timeout: 60000 });

            if (!data?.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                throw new Error("Gagal mendapatkan respons dari semua model Gemini.");
            }
            answer = data.candidates[0].content.parts[0].text.trim();
        }

        const header = `╭── ⋆ ✧ ꒰ 🎀 *${usedModel.toUpperCase()}* 🎀 ꒱ ✧ ⋆ ──\n\n`;
        const footer = `\n\n╰────────────────────── ⋆ ✧\n\n> 🌸 *Li Shiya MD - Advanced AI Tools* 🌸`;

        await m.reply(header + answer + footer);
        await m.react('🌸');
    } catch (err) {
        console.error(err);
        await m.react('❌');
        const errorMessage = err?.response?.data?.error?.message || err.message;
        await m.reply(`╭── ⋆ ✧ ꒰ 🎀 *ERROR* 🎀 ꒱ ✧ ⋆ ──\n┊ ⚠️ AI sedang mengalami kendala.\n┊ _${errorMessage}_\n╰────────────────────── ⋆ ✧`);
    }
}

handler.help = ['liy <query/image>', 'liy on', 'lishiya off'];
handler.tags = ['ai'];
handler.command = /^(liy)$/i;
handler.limit = true;

export default handler;