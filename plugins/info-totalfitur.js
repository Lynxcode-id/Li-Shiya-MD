import { AIRich } from '../lib/nixcode.js';

let handler = async (m, { conn }) => {
	await m.react('⏳');
	let total = Object.values(global.plugins).filter((v) => v.help && v.tags).length;

	// Ambil Foto Profil (Jika di privasi, pakai default avatar)
	let ppUrl;
	try {
		ppUrl = await conn.profilePictureUrl(m.sender, 'image');
	} catch (e) {
		ppUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Avatar default Li Shiya
	}

	try {
		await new AIRich(conn)
			.addProduct({
				title: `🌸 Total Cintaku Padamu 🌸`, 
				brand: 'Li Shiya ESM', 
				price: `${total} Fitur`, 
				sale_price: `Aktif & Ready`, 
				product_url: 'https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i', 
				icon_url: ppUrl, // Pakai PP User
				image_url: ppUrl // Pakai PP User
			})
			.addText(`╭── ꒰ 🎀 *S Y S T E M  I N F O* 🎀 ꒱\n┊ ➭ 🌸 *Total Fitur* : ${total} Commands\n┊ ➭ 🌸 *Status* : All Systems Online 🚀\n╰────────────── ⋆ ✧\n\n> Terima kasih sudah menggunakan Li Shiya~ (๑ ˃̵ᴗ˂̵) ♡`)
			.setTitle('🌸 𝗜𝗻𝗳𝗼𝗿𝗺𝗮𝘀𝗶 𝗙𝗶𝘁𝘂𝗿 𝗕𝗼𝘁 🌸')
			.setFooter('© ʟɪ sʜɪʏᴀ ᴍᴅ ᴇsᴍ | Lynx Decode') 
			.addSuggest(['🌸 Menu Utama', '🎀 Script Bot', '🍓 Dashboard'])
			.send(m.chat, { quoted: m });

		await m.react('✅');
	} catch (e) {
		console.error('[AIRICH TOTALFITUR ERROR]', e);
		await m.react('❌');
		m.reply(`⚠️ *Gagal menampilkan UI:*\n_${e.message || e}_`);
	}
};

handler.help = ['totalfitur'];
handler.tags = ['info'];
handler.command = ['totalfitur'];

export default handler;