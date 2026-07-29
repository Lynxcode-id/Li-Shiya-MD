import { AIRich } from '../lib/nixcode.js';

let handler = async (m, { conn }) => {
	await m.react('⏳');

	let stats = Object.entries(global.db.data.stats)
		.map(([key, val]) => {
			let name = Array.isArray(global.plugins[key]?.help) ? global.plugins[key]?.help.join(' , ') : global.plugins[key]?.help || key;
			if (/exec/.test(name)) return;
			return { name, ...val };
		})
		.filter(Boolean);
	stats = stats.sort((a, b) => b.total - a.total);

	let handlers = stats
		.slice(0, 50)
		.map(({ name, total, last, success, lastSuccess }, i) => {
			return `┊ ➭ 🌸 *${i + 1}. ${name.toUpperCase()}*\n┊    📈 Hits: ${total} | ✅ Success: ${success}\n┊    ⏱️ Last: ${getTime(last)}`;
		})
		.join('\n┊\n');

	let bodyText = `╭── ꒰ 🎀 *D A S H B O A R D* 🎀 ꒱\n${handlers}\n╰────────────── ⋆ ✧`;

	// Fix pakai gambar dari link lu, no get PP orang lagi 🗿
	let thumbUrl = 'https://raw.githubusercontent.com/Lynxcode-id/picture/main/1784101352607.jpeg';

	try {
		await new AIRich(conn)
			.addProduct({
				title: `🌸 Global Dashboard 🌸`, 
				brand: 'Li Shiya ESM', 
				price: `Top 50 Features`, 
				sale_price: `Stats Info`, 
				product_url: 'https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i', 
				icon_url: thumbUrl, 
				image_url: thumbUrl 
			})
			.addText(bodyText)
			.setTitle('🌸 𝗕𝗼𝘁 𝗗𝗮𝘀𝗵𝗯𝗼𝗮𝗿𝗱 𝗦𝘁𝗮𝘁𝘀 🌸')
			.setFooter('© ʟɪ sʜɪʏᴀ ᴍᴅ ᴇsᴍ | Lynx Decode') 
			.addSuggest(['🌸 Menu Utama', '🎀 Total Fitur'])
			.send(m.chat, { quoted: m });

		await m.react('✅');
	} catch (e) {
		console.error('[AIRICH DASHBOARD ERROR]', e);
		await m.react('❌');
		m.reply(`⚠️ *Gagal menampilkan UI:*\n_${e.message || e}_`);
	}
};

handler.help = ['dashboard'];
handler.command = ['dashboard', 'dash'];
handler.tags = ['info'];
export default handler;

function formatTime(time) {
	const date = new Date(time);
	const month = getMonthName(date.getMonth());
	const day = date.getDate();
	const year = date.getFullYear();

	return `${month} ${day}, ${year}`;
}

function getMonthName(month) {
	const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	return months[month];
}

function getTime(ms) {
	var now = parseMs(+new Date() - ms);
	if (now.days) return `${now.days} days ago`;
	else if (now.hours) return `${now.hours} hours ago`;
	else if (now.minutes) return `${now.minutes} minutes ago`;
	else return `a few seconds ago`;
}

function parseMs(ms) {
	if (typeof ms !== 'number') throw 'Parameters must be filled with numbers';
	return {
		days: Math.trunc(ms / 86400000),
		hours: Math.trunc(ms / 3600000) % 24,
		minutes: Math.trunc(ms / 60000) % 60,
		seconds: Math.trunc(ms / 1000) % 60,
		milliseconds: Math.trunc(ms) % 1000,
		microseconds: Math.trunc(ms * 1000) % 1000,
		nanoseconds: Math.trunc(ms * 1e6) % 1000,
	};
}