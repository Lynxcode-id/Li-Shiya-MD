import { createHash } from 'crypto';
import { AIRich } from '../lib/nixcode.js'; // Pastikan path ini sesuai dengan letak lib lu

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i;
let handler = async function (m, { conn, text, usedPrefix, command }) {
	let user = global.db.data.users[m.sender];
	
	if (user.registered === true) throw `🌸 Kamu sudah terdaftar di database Li Shiya!\nMau daftar ulang? Ketik: *${usedPrefix}unreg*`;
	if (!Reg.test(text)) return m.reply(`🌸 Masukkan Nama dan Umur kamu ya!\nContoh: *${usedPrefix + command} LiShiya.18*`);
	
	let [_, name, _splitter, age] = text.match(Reg);
	if (!name) throw '❌ Nama tidak boleh kosong cuy!';
	if (!age) throw '❌ Umur tidak boleh kosong ya!';
	
	age = parseInt(age);
	if (age > 50) throw '❌ Astaga udah sepuh, tua banget amjir 😭';
	if (age < 12) throw '❌ Adek bocil dilarang masuk yaa~ 🌸';
	
	await m.react('⏳');

	user.name = name.trim();
	user.age = age;
	user.regTime = Date.now();
	user.registered = true;
	
	// Starter Pack RPG
	user.axe = 1;
	user.axedurability = 30;
	user.pickaxe = 1;
	user.pickaxedurability = 40;
	
	let sn = createHash('md5').update(m.sender).digest('hex');
	let totalReg = Object.values(global.db.data.users).filter((v) => v.registered == true).length;

	// Ambil Foto Profil (Jika di privasi, pakai default avatar)
	let ppUrl;
	try {
		ppUrl = await conn.profilePictureUrl(m.sender, 'image');
	} catch (e) {
		ppUrl = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'; // Avatar default
	}

	try {
		await new AIRich(conn)
			.addProduct({
				title: `🌸 ID CARD: ${user.name}`, 
				brand: 'Li Shiya ESM', 
				price: `Age: ${user.age} Years`, 
				sale_price: `User Ke-${totalReg}`, 
				product_url: 'https://whatsapp.com/channel/0029VbAnuii6GcGCu73oep1i', 
				icon_url: ppUrl, // Thumbnail pakai PP User
				image_url: ppUrl  // Gambar utama pakai PP User
			})
			.addText(`╭── ꒰ 🎀 *R E G I S T E R  S U C C E S S* 🎀 ꒱\n┊ ➭ 🌸 *Name* : ${user.name}\n┊ ➭ 🌸 *Age* : ${user.age} Years\n┊ ➭ 🔗 *SN* : ${sn}\n╰────────────── ⋆ ✧\n\n╭── ꒰ 🍓 *S T A R T E R  P A C K* 🍓 ꒱\n┊ ➭ ⛏️ *Pickaxe* : 1 (40 Durability)\n┊ ➭ 🪓 *Axe* : 1 (30 Durability)\n╰────────────── ⋆ ✧`)
			.setTitle('🌸 𝗥𝗲𝗴𝗶𝘀𝘁𝗿𝗮𝘁𝗶𝗼𝗻 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹 🌸')
			.setFooter('© ʟɪ sʜɪʏᴀ ᴍᴅ ᴇsᴍ | Lynx Decode') 
			.addSuggest(['🌸 Menu Utama', '🎀 Profilku', '🍓 Claim Harian'])
			.send(m.chat, { quoted: m });

		await m.react('✅');
	} catch (e) {
		console.error('[AIRICH REG ERROR]', e);
		await m.react('❌');
		m.reply(`⚠️ *Gagal menampilkan kartu UI:*\n_${e.message || e}_`);
	}
};

handler.help = ['daftar <nama>.<umur>'];
handler.tags = ['xp'];
handler.command = /^(daftar|verify|reg(ister)?)$/i;

export default handler;