import moment from 'moment-timezone';
import * as levelling from '../lib/levelling.js';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { generateWAMessageFromContent, prepareWAMessageMedia } from 'baileys';

const handler = async (m, { conn, usedPrefix: _p, isOwner, args }) => {
	const plugins = Object.values(global.plugins).filter((p) => !p.disabled);

	const rawTags = [...new Set(plugins.flatMap((p) => p.tags || []))].filter(Boolean);

	const priority = ['main', 'ai', 'downloader', 'tools', 'rpg', 'fun', 'group', 'xp', 'info'];
	rawTags.sort((a, b) => {
		if (a === 'owner') return 1; 
		if (b === 'owner') return -1;
		let idxA = priority.indexOf(a);
		let idxB = priority.indexOf(b);
		idxA = idxA === -1 ? 99 : idxA; 
		idxB = idxB === -1 ? 99 : idxB;
		return idxA - idxB || a.localeCompare(b);
	});

	const allTags = {};
	rawTags.forEach(tag => {
		const formatName = tag.charAt(0).toUpperCase() + tag.slice(1) + ' Menu';
		allTags[tag] = formatName;
	});

	let teks = (args[0] || '').toLowerCase();
	let tags = {};

	if (!Object.keys(allTags).includes(teks) && !Object.values(allTags).some((v) => v.toLowerCase().includes(teks))) {
		teks = 'all';
	}

	tags = teks === 'all' ? { ...allTags } : Object.fromEntries(Object.entries(allTags).filter(([k, v]) => k === teks || v.toLowerCase().includes(teks)));

	if (!isOwner) delete tags.owner;
	if (!m.isGroup) delete tags.group;

	const defaultMenu = {
		before: `╭── ⋆ ✧ ꒰ 🎀 *%me* 🎀 ꒱ ✧ ⋆ ──
┊ ⋆ ˚✿ *${ucapan()}, %name!* ✿˚ ⋆
┊ Semoga harimu menyenangkan~
┊ 
┊ ꒰ 👤 ꒱ *P R O F I L E* ┊ 🌸 ɴᴀᴍᴀ   : %name
┊ 🌸 ʟɪᴍɪᴛ  : %limit
┊ 🌸 ʟᴇᴠᴇʟ  : %level (%exp / %maxexp)
┊ 🌸 ʀᴏʟᴇ   : %role
┊ 🌸 sᴛᴀᴛᴜs : [%xp4levelup]
┊
┊ ꒰ 🖥️ ꒱ *S Y S T E M* ┊ ☁️ ᴀᴄᴛɪᴠᴇ : %uptime
┊ ☁️ ᴅᴀᴛᴇ   : %week, %date
┊ ☁️ ᴜsᴇʀs  : %rtotalreg
╰────────────────────── ⋆ ✧
%readmore`.trim(),
		header: '╭── ꒰ 🎀 *%category* 🎀 ꒱',
		body: '┊ ➭ %cmd %flags',
		footer: '╰────────────── ⋆ ✧\n',
		after: '> 🎧 *Audio Li Shiya sedang dimainkan~* 🌸',
	};

	try {
		const help = plugins.map((p) => ({
			help: Array.isArray(p.help) ? p.help : [p.help],
			tags: Array.isArray(p.tags) ? p.tags : [p.tags],
			prefix: 'customPrefix' in p,
			limit: p.limit ? '🄻' : '',
			premium: p.premium ? '🄿' : '',
			owner: p.owner ? '🄾' : '',
		}));

		const textBuilder = [
			defaultMenu.before,
			...Object.keys(tags).map((tag) => {
				const items = help
					.filter((p) => p.tags.includes(tag))
					.flatMap((p) =>
						p.help.map((h) => {
							const cmd = p.prefix ? h : `${_p}${h}`;
							const flags = [p.limit, p.premium, p.owner, p.rowner].filter(Boolean).join(' ');
							return defaultMenu.body
								.replace(/%cmd/g, cmd)
								.replace(/%flags/g, flags)
								.trim();
						})
					)
					.join('\n');
				return `${defaultMenu.header.replace(/%category/g, tags[tag].toUpperCase())}\n${items}\n${defaultMenu.footer}`;
			}),
			defaultMenu.after,
		].join('\n');

		let { exp, limit, money, level, role, registered } = global.db.data.users[m.sender];
		let { min, xp, max } = levelling.xpRange(level, global.multiplier);
		let name = registered ? global.db.data.users[m.sender].name : conn.getName(m.sender);
		let _uptime = process.uptime() * 1000;
		let uptime = clockString(_uptime);
		let totalreg = Object.keys(global.db.data.users).length;
		let rtotalreg = Object.values(global.db.data.users).filter((user) => user.registered == true).length;
		let d = new Date(new Date() + 3600000);
		let locale = 'id-ID';
		let week = d.toLocaleDateString(locale, { weekday: 'long' });
		let date = d.toLocaleDateString(locale, {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
		});

		let botName = global.namebot || conn.user?.name || 'Li Shiya MD';

		const replace = {
			'%': '',
			p: _p,
			uptime,
			me: botName, 
			exp: exp - min,
			maxexp: xp,
			totalexp: exp,
			xp4levelup: max - exp <= 0 ? `Siap *${_p}levelup*` : `${max - exp} XP lagi`,
			level,
			limit,
			name,
			money,
			week,
			date,
			totalreg,
			rtotalreg,
			role,
			readmore: readMore,
		};

		let finalMenuText = style(
			textBuilder.replace(
				new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'),
				(_, name) => '' + replace[name]
			)
		);

		await m.react('🌱');

		const MENU_THUMB = global.menuThumb || 'https://raw.githubusercontent.com/Lynxcode-id/picture/main/1784042847930.jpeg';
		const VID_ALL_MENU = 'https://c.termai.cc/v142/WFdf.mp4';

		const imageMedia = await prepareWAMessageMedia({ image: { url: MENU_THUMB } }, { upload: conn.waUploadToServer });
		const videoMedia = await prepareWAMessageMedia({ video: { url: VID_ALL_MENU } }, { upload: conn.waUploadToServer });

		const imgMsg = generateWAMessageFromContent(m.chat, {
			imageMessage: {
				...imageMedia.imageMessage,
				caption: finalMenuText,
				contextInfo: {
					pairedMediaType: 5,
					statusSourceType: 0,
					isForwarded: true,
					forwardedNewsletterMessageInfo: {
						newsletterJid: '120363400612665352@newsletter',
						newsletterName: botName,
						serverMessageId: 142
					}
				}
			}
		}, { quoted: m });

		await conn.relayMessage(m.chat, imgMsg.message, { messageId: imgMsg.key.id });

		await conn.relayMessage(m.chat, {
			videoMessage: {
				...videoMedia.videoMessage,
				contextInfo: {
					pairedMediaType: 6,
					statusSourceType: 0
				}
			},
			messageContextInfo: {
				messageAssociation: {
					associationType: 12,
					parentMessageKey: imgMsg.key
				}
			}
		}, {});

		let audios = global.menuaudio || global.menuAudio || [];
		let MENU_SOUND = '';

		if (Array.isArray(audios) && audios.length > 0) {
			MENU_SOUND = audios[Math.floor(Math.random() * audios.length)];
		} else if (typeof audios === 'string' && audios.trim() !== '') {
			MENU_SOUND = audios;
		}

		if (MENU_SOUND !== '') {
			try {
				console.log(`\n⏳ [AUDIO MENU] Tarik data manual dari: ${MENU_SOUND}`);
				
				let res = await fetch(MENU_SOUND);
				let audioBuffer = await res.buffer();
				await new Promise(resolve => setTimeout(resolve, 1500)); 

				await conn.sendFile(m.chat, audioBuffer, 'menu_audio.ogg', '', m, true, { mimetype: 'audio/ogg; codecs=opus' });
				console.log('✅ [AUDIO MENU] Sukses mengirim Voice Note!');
			} catch (err) {
				console.error('🚨 [ERROR AUDIO MENU]:', err.message);
				await conn.sendFile(m.chat, MENU_SOUND, 'audio.mp3', '', m, false, { mimetype: 'audio/mpeg' });
			}
		}

		await m.react('✨');

	} catch (e) {
		console.error(e);
		m.reply('Terjadi kesalahan saat menampilkan menu.');
	}
};

handler.help = ['menu'];
handler.command = /^menu$/i;
handler.exp = 3;

export default handler;

const more = String.fromCharCode(8206);
const readMore = more.repeat(4001);

function style(text, style = 1) {
	const xStr = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
	const yStr = {
		1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890',
	}[style].split('');
	return text
		.toLowerCase()
		.split('')
		.map((char) => {
			const i = xStr.indexOf(char);
			return i !== -1 ? yStr[i] : char;
		})
		.join('');
}

function clockString(ms) {
	let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
	let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
	let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
	return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}

function ucapan() {
	const time = moment.tz('Asia/Jakarta').format('HH');
	let res = 'Selamat dinihari 🌙';
	if (time >= 4) {
		res = 'Selamat pagi 🌤️';
	}
	if (time > 10) {
		res = 'Selamat siang ☀️';
	}
	if (time >= 15) {
		res = 'Selamat sore 🌇';
	}
	if (time >= 18) {
		res = 'Selamat malam 🌌';
	}
	return res;
}