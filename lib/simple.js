import path from 'path';
import fs from 'fs';
import util from 'util';
import os from 'os';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import fetch from 'node-fetch';
import PhoneNumber from 'awesome-phonenumber';
import { fileTypeFromBuffer } from 'file-type';
import * as Jimp from 'jimp';
import decode from 'audio-decode';

import store from './store.js';
import { toAudio, toPTT } from './converter.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @type {import('baileys')}
 */
import MakeWASocket, {
	proto,
	delay,
	downloadContentFromMessage,
	jidDecode,
	areJidsSameUser,
	generateForwardMessageContent,
	generateWAMessageFromContent,
	generateWAMessage,
	getBinaryNodeChild,
	WAMessageStubType,
	extractMessageContent,
	prepareWAMessageMedia,
	toBuffer
} from 'baileys';

export function makeWASocket(connectionOptions, options = {}) {
	let conn = MakeWASocket(connectionOptions);

	if (!global.lidMap) global.lidMap = new Map();
	if (!global.pnMap) global.pnMap = new Map();
	if (!global.resolvePn) global.resolvePn = async function resolvePhoneNumber(jid = '') {
		if (!jid) return '';
		jid = String(jid).decodeJid();
		if (global.pnMap.has(jid)) return global.pnMap.get(jid);

		if (/^\d+$/.test(jid)) return jid;
		if (jid.includes('@s.whatsapp.net')) {
			const pn = jid.split('@')[0];
			global.pnMap.set(jid, pn);
			return pn;
		}

		if (conn?.chats) {
			for (let chat of Object.values(conn.chats)) {
				const p = chat?.metadata?.participants?.find(v => v.lid === jid || v.id === jid);
				if (p?.phoneNumber) {
					const pn = p.phoneNumber.replace(/[^0-9]/g, '');
					global.pnMap.set(jid, pn);
					return pn;
				}
				if (p?.id && !p.id.endsWith('@lid')) {
					const pn = p.id.split('@')[0];
					global.pnMap.set(jid, pn);
					return pn;
				}
			}
		}

		try {
			const [res] = await conn.onWhatsApp(jid).catch(() => [{}]);
			if (res?.jid && !res.jid.endsWith('@lid')) {
				const pn = res.jid.split('@')[0];
				global.pnMap.set(jid, pn);
				return pn;
			}
		} catch {}
		return jid.replace(/[^0-9]/g, '');
	};

	const OrigMsg = conn.sendMessage.bind(conn);
	let sock = Object.defineProperties(conn, {
		chats: {
			value: { ...(options.chats || {}) },
			writable: true,
		},
		sendMessage: {
			value(jid, content, options = {}) {
				const text = content?.text || content?.caption || '';

				return OrigMsg(
					jid,
					{
						...content,
						mentions: content.mentions || conn.parseMention(text),
					},
					{
						...options,
						useCachedGroupMetadata: options.useCachedGroupMetadata || true,
					}
				);
			},
		},
		decodeJid: {
			value(jid) {
				if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null;
				return jid.decodeJid();
			},
		},
		resolvePn: {
			async value(jid = '') {
				return await global.resolvePn(jid);
			},
		},
		profilePictureUrl: {
			async value(jid, type = 'image', query = 'url') {
				try {
					const result = await conn.query(
						{
							tag: 'iq',
							attrs: {
								target: jid,
								to: 's.whatsapp.net',
								type: 'get',
								xmlns: 'w:profile:picture',
							},
							content: [{ tag: 'picture', attrs: { type, query } }],
						},
						15000
					);
					const child = getBinaryNodeChild(result, 'picture');
					return child?.content || child?.attrs?.url;
				} catch {
					return query == 'buffer' ? fs.readFileSync(path.resolve(__dirname, '../media/avatar_contact.png')) : 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
				}
			},
		},
		getJid: {
			value(sender) {
				if (!conn.isLid) conn.isLid = global.isLid || {};
				if (!sender) return sender;

				let s = String(sender).decodeJid(); // decodeJid dari baileys otomatis hilangin hash device
				if (conn.isLid[s]) return conn.isLid[s];
				if (global.lidMap.has(s)) return global.lidMap.get(s);
				if (/@(s\.whatsapp\.net|g\.us|broadcast)$/.test(s)) return s;
				if (/^\d+$/.test(s)) return (conn.isLid[s] = `${s}@s.whatsapp.net`);
				if (!s.endsWith("@lid")) return s;

				for (let chat of Object.values(conn.chats)) {
					const parts = chat.metadata?.participants || [];
					if (!parts.length) continue;
					const user = parts.find(p => p?.lid === s || p?.id === s || p?.jid === s);
					if (user) {
						const resolved = (user.phoneNumber ? `${String(user.phoneNumber).replace(/[^0-9]/g, '')}@s.whatsapp.net` : null) 
							|| (user.id && !user.id.endsWith('@lid') ? user.id : null)
							|| (user.jid && !user.jid.endsWith('@lid') ? user.jid : null);

						if (resolved) {
							const final = resolved.decodeJid ? resolved.decodeJid() : String(resolved).decodeJid();
							conn.isLid[s] = final;
							global.lidMap.set(s, final);
							global.isLid = conn.isLid;
							return final;
						}
					}
				}
				return s;
			},
		},
		logger: {
			get() {
				let dates = new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
				return {
					info(...args) {
						console.log(chalk.bold.bgRgb(51, 204, 51)('INFO '), `[${chalk.rgb(255, 255, 255)(dates)}]:`, chalk.cyan(util.format(...args)));
					},
					error(...args) {
						console.log(chalk.bold.bgRgb(247, 38, 33)('ERROR '), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.rgb(255, 38, 0)(util.format(...args)));
					},
					warn(...args) {
						console.log(chalk.bold.bgRgb(255, 153, 0)('WARNING '), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.redBright(util.format(...args)));
					},
					trace(...args) {
						console.log(chalk.grey('TRACE '), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.white(util.format(...args)));
					},
					debug(...args) {
						console.log(chalk.bold.bgRgb(66, 167, 245)('DEBUG '), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]:`, chalk.white(util.format(...args)));
					},
				};
			},
			enumerable: true,
		},
		getFile: {
			async value(PATH, saveToFile = false) {
				let res, filename;
				const data = Buffer.isBuffer(PATH)
					? PATH
					: PATH instanceof ArrayBuffer
						? PATH.toBuffer()
						: /^data:.*?\/.*?;base64,/i.test(PATH)
							? Buffer.from(PATH.split`,`[1], 'base64')
							: /^https?:\/\//.test(PATH)
								? (res = Buffer.from(await (await fetch(PATH)).arrayBuffer()))
								: fs.existsSync(PATH)
									? ((filename = PATH), fs.readFileSync(PATH))
									: typeof PATH === 'string'
										? PATH
										: Buffer.alloc(0);
				if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer');
				const type = (await fileTypeFromBuffer(data)) || { mime: 'application/octet-stream', ext: '.bin' };
				if (data && saveToFile && !filename) ((filename = path.join(__dirname, '../tmp/' + new Date() * 1 + '.' + type.ext)), await fs.promises.writeFile(filename, data));
				return {
					res,
					filename,
					...type,
					data,
					deleteFile() {
						return filename && fs.promises.unlink(filename);
					},
				};
			},
			enumerable: true,
		},
        waitEvent: {
            value(eventName, is = () => true, maxTries = 25) { 
                return new Promise((resolve, reject) => {
                    let tries = 0;
                    let on = (...args) => {
                        if (++tries > maxTries) reject('Max tries reached');
                        else if (is()) {
                            conn.ev.off(eventName, on);
                            resolve(...args);
                        }
                    };
                    conn.ev.on(eventName, on);
                });
            }
        },
		sendFile: {
			async value(jid, path, filename = '', caption = '', quoted, ptt = false, options = {}) {
				let type = await conn.getFile(path, true);
				let { res, data: file, filename: pathFile } = type;
				if ((res && res.status !== 200) || file.length <= 65536) {
					try {
						throw {
							json: JSON.parse(file.toString()),
						};
					} catch (e) {
						if (e.json) throw e.json;
					}
				}
				const fileSize = fs.statSync(pathFile).size / 1024 / 1024;
				if (fileSize >= 100) throw new Error('File size is too big!');
				let opt = { filename };
				if (quoted) opt.quoted = quoted;
				if (!type) options.asDocument = true;
				let mtype = '',
					mimetype = options.mimetype || type.mime,
					convert;

				if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
				else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
				else if (/video/.test(type.mime)) mtype = 'video';
				else if (/audio/.test(type.mime)) {
					if (ptt) {
						convert = await toPTT(file, type.ext);
						file = convert.data;
						pathFile = convert.filename;
						mtype = 'audio';
						mimetype = 'audio/ogg; codecs=opus';
					} else {
						convert = await toAudio(file, type.ext);
						file = convert.data;
						pathFile = convert.filename;
						mtype = 'audio';
						mimetype = options.mimetype || 'audio/mpeg';
					}
				}
				else mtype = 'document';
				
				if (options.asDocument) mtype = 'document';

				delete options.asSticker;
				delete options.asLocation;
				delete options.asVideo;
				delete options.asDocument;
				delete options.asImage;

				let message = {
					...options,
					caption,
					ptt,
					[mtype]: ptt ? file : { url: pathFile },
					mimetype,
					fileName: filename || pathFile.split('/').pop(),
				};
				
				if (ptt) {
					try {
						const audioData = await decode(file);
						const channelData = audioData.getChannelData(0); 
						let wave = new Uint8Array(64);
						const step = Math.floor(channelData.length / 64);
						let maxAmp = 0;
						let amplitudes = [];
						for (let i = 0; i < 64; i++) {
							let sum = 0;
							for (let j = 0; j < step; j++) {
								sum += Math.abs(channelData[i * step + j]);
							}
							let amp = sum / step;
							amplitudes.push(amp);
							if (amp > maxAmp) maxAmp = amp;
						}
						
						for (let i = 0; i < 64; i++) {
							wave[i] = maxAmp === 0 ? 0 : Math.floor((amplitudes[i] / maxAmp) * 100);
						}
						
						message.waveform = wave;
					} catch (e) {
						console.log('⚠️ [WAVEFORM] Gagal nge-decode asli, fallback ke random!', e.message);
						let wave = new Uint8Array(64);
						for (let i = 0; i < 64; i++) {
							wave[i] = Math.floor(Math.random() * 80) + 20; 
						}
						message.waveform = wave;
					}
				}

				let m;
				try {
					m = await conn.sendMessage(jid, message, { ...opt, ...options });
				} catch (e) {
					console.error(e);
					m = null;
				} finally {
					if (!m) m = await conn.sendMessage(jid, { ...message, [mtype]: file }, { ...opt, ...options });
					file = null; 
				}
				return m;
			},
			enumerable: true,
		},
		sendSticker: {
			async value(jid, filePath, m, options = {}) {
				const { data, mime } = await conn.getFile(filePath);
				if (data.length === 0) throw new TypeError('File tidak ditemukan');
				const exif = { packname: options.packname || global.stickpack, author: options.packpublish || global.stickauth };
                let sticker;
                if (mime.includes('video') || mime.includes('gif')) {
                    sticker = await (await import('./exif.js')).writeExifVid(data, exif);
                } else {
                    sticker = await (await import('./exif.js')).writeExifImg(data, exif);
                }
				return conn.sendMessage(jid, { sticker }, { quoted: m, ephemeralExpiration: m?.expiration });
			},
		},
		sendMedia: {
			async value(jid, path, quoted, options = {}) {
				let { mime, data } = await conn.getFile(path);
				let messageType = mime.split('/')[0];
				let pase = messageType.replace('application', 'document') || messageType;
				return conn.sendMessage(jid, { [`${pase}`]: data, mimetype: mime, ...options }, { quoted });
			},
		},
		sendAlbum: {
			async value(jid, medias = [], options = {}) {
				if (medias.length < 2) throw new Error('Album minimal berisi 2 media.');
				const media = [];
				for (const item of medias) {
					const url = typeof item === 'string' ? item : item.url;
					const caption = typeof item === 'object' ? item.caption : '';
					let file;
					try {
						file = await conn.getFile(url);
					} catch {
						continue;
					}
					const mime = file.mime;
					const data = file.data;
					if (!mime || !data) continue;
					const type = mime.split('/')[0];
					if (type === 'image') {
						media.push({ image: data, caption });
					} else if (type === 'video') {
						media.push({ video: data, caption });
					}
				}
				return conn.sendAlbumMessage(jid, media, options);
			},
		},
		sendAlbumMessage: {
			async value(jid, medias, options = {}) {
				const userJid = conn.user?.id;
				if (!Array.isArray(medias) || medias.length < 2) throw new Error('Album minimal berisi 2 media.');

				const delayTime = options.delay || 5000;
				delete options.delay;

				const album = await generateWAMessageFromContent(
					jid,
					{
						albumMessage: {
							expectedImageCount: medias.filter((m) => m.image).length,
							expectedVideoCount: medias.filter((m) => m.video).length,
							...options,
						},
					},
					{ userJid, ...options }
				);

				await conn.relayMessage(jid, album.message, { messageId: album.key.id });

				for (const media of medias) {
					const content = media.image ? { image: media.image, ...media } : media.video ? { video: media.video, ...media } : null;
					if (!content) continue;
					const msg = await generateWAMessage(jid, content, {
						userJid,
						upload: (readStream, opts) => conn.waUploadToServer(readStream, opts),
						...options,
					});

					if (msg) {
						msg.message.messageContextInfo = {
							messageAssociation: { associationType: 1, parentMessageKey: album.key },
						};
					}
					await conn.relayMessage(jid, msg.message, { messageId: msg.key.id });
					await delay(delayTime);
				}
				return album;
			},
		},
		sendButton: {
			async value(jid, content = {}, options = {}) {
				let header = {};
				let mime = null;
				if (content.image) mime = 'image';
				else if (content.video) mime = 'video';
				else if (content.document) mime = 'document';
				else if (content.audio) mime = 'audio';

				if (mime) {
					const media = await prepareWAMessageMedia({ [mime]: content[mime] }, { upload: conn.waUploadToServer });
					header = {
						hasMediaAttachment: true,
						[`${mime}Message`]: media[`${mime}Message`],
					};
				}

				const msg = generateWAMessageFromContent(
					jid,
					{
						interactiveMessage: {
							header: { title: content.title || '', ...header },
							body: { text: content.body || content.text || content.caption },
							footer: { text: content.footer },
							nativeFlowMessage: {
								buttons: content.buttons || [],
							},
						},
						...content,
					},
					options
				);

				await conn.relayMessage(jid, msg.message, {
					messageId: msg.key.id,
					additionalNodes: [
						{
							tag: 'biz',
							attrs: {},
							content: [
								{
									tag: 'interactive',
									attrs: { type: 'native_flow', v: '1' },
									content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
								},
							],
						},
					],
				});
				return msg;
			},
		},
		sendContact: {
			async value(jid, data, quoted, options) {
				if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data];
				let contacts = [];
				for (let [number, name] of data) {
					number = number.replace(/[^0-9]/g, '');
					let njid = number + '@s.whatsapp.net';
					let biz = (await conn.getBusinessProfile(njid).catch((_) => null)) || {};
					let vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name.replace(/\n/g, '\\n')};;;
FN:${name.replace(/\n/g, '\\n')}
TEL;type=CELL;type=VOICE;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}${
						biz.description
							? `
X-WA-BIZ-NAME:${(conn.chats[njid]?.vname || conn.getName(njid) || name).replace(/\n/, '\\n')}
X-WA-BIZ-DESCRIPTION:${biz.description.replace(/\n/g, '\\n')}
`.trim()
							: ''
					}
END:VCARD
        `.trim();
					contacts.push({ vcard, displayName: name });
				}
				return conn.sendMessage(
					jid,
					{
						...options,
						contacts: {
							...options,
							displayName: (contacts.length >= 2 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
							contacts,
						},
					},
					{
						quoted,
						...options,
					}
				);
			},
			enumerable: true,
		},
        sendContactArray: {
            async value(jid, data, quoted, options) {
                if (!Array.isArray(data[0]) && typeof data[0] === 'string') data = [data];
                let contacts = [];
                for (let [number, name, isi, isi1, isi2, isi3, isi4, isi5] of data) {
                    number = number.replace(/[^0-9]/g, '');
                    let vcard = `
BEGIN:VCARD
VERSION:3.0
N:Sy;Bot;;;
FN:${name.replace(/\n/g, '\\n')}
item.ORG:${isi}
item1.TEL;waid=${number}:${PhoneNumber('+' + number).getNumber('international')}
item1.X-ABLabel:${isi1}
item2.EMAIL;type=INTERNET:${isi2}
item2.X-ABLabel:📧 Email
item3.ADR:;;${isi3};;;;
item3.X-ABADR:ac
item3.X-ABLabel:📍 Region
item4.URL:${isi4}
item4.X-ABLabel:Website
item5.X-ABLabel:${isi5}
END:VCARD`.trim();
                    contacts.push({ vcard, displayName: name });
                }
                return await conn.sendMessage(jid, {
                    contacts: {
                        displayName: (contacts.length > 1 ? `${contacts.length} kontak` : contacts[0].displayName) || null,
                        contacts,
                    }
                }, { quoted, ...options });
            }
        },
        resize: {
            async value(image, width, height) {
                let oyy = await Jimp.read(image);
                let kiyomasa = await oyy.resize(width, height).getBufferAsync(Jimp.MIME_JPEG);
                return kiyomasa;
            }
        },
		reply: {
			value(jid, text = '', quoted, options) {
				return Buffer.isBuffer(text)
					? conn.sendFile(jid, text, 'file', '', quoted, false, options)
					: conn.sendMessage(
							jid,
							{
								text,
								mentions: conn.parseMention(text),
                                contextInfo: global.adReply?.contextInfo || {},
								...options,
							},
							{
								quoted,
                                ephemeralExpiration: global.ephemeral || undefined,
								...options,
							}
						);
			},
		},
		adReply: {
			async value(jid, text, path, m, options = {}) {
				const { data } = await conn.getFile(path);
				return conn.sendMessage(
					jid,
					{
						text: text,
						contextInfo: {
							externalAdReply: {
								title: options.title || global.namebot,
								body: options.body || '',
								thumbnail: data,
								mediaType: 1,
								renderLargerThumbnail: options.large || true,
								thumbnailUrl: options.source || global.source,
								sourceUrl: options.source || global.source,
							},
						},
					},
					{ quoted: m }
				);
			},
		},
        updateProfileStatus: {
            async value(status) {
                return await conn.query({
                    tag: 'iq',
                    attrs: {
                        to: 's.whatsapp.net',
                        type: 'set',
                        xmlns: 'status',
                    },
                    content: [
                        { tag: 'status', attrs: {}, content: Buffer.from(status, 'utf-8') }
                    ]
                });
            }
        },
        setBio: {
            async value(status) {
                return await conn.updateProfileStatus(status);
            }
        },
        sendPayment: {
            async value(jid, amount, currency, text = '', from, image, options) {
                let file = await conn.resize(image, 300, 150);
                let a = ["IDR", "USD", "MYR", "EUR", "GBP", "SGD"];
                let b = a[Math.floor(Math.random() * a.length)];
                const requestPaymentMessage = {
                    amount: {
                        currencyCode: currency || b,
                        offset: 0,
                        value: amount || 9.99
                    },
                    expiryTimestamp: 0,
                    amount1000: (amount || 9.99) * 1000,
                    currencyCodeIso4217: currency || b,
                    requestFrom: from || '0@s.whatsapp.net',
                    noteMessage: { extendedTextMessage: { text: text || 'Payment Info' } },
                    background: !!image ? file : undefined
                };
                return await conn.relayMessage(jid, { requestPaymentMessage }, { ...options });
            }
        },
        sendPoll: {
            async value(jid, name = '', optiPoll, options) {
                if (!Array.isArray(optiPoll[0]) && typeof optiPoll[0] === 'string') optiPoll = [optiPoll];
                if (!options) options = {};
                const pollMessage = {
                    name: name,
                    options: optiPoll.map(btn => ({ optionName: !nullish(btn[0]) && btn[0] || '' })),
                    selectableOptionsCount: 1
                };
                return conn.relayMessage(jid, { pollCreationMessage: pollMessage }, { ...options });
            }
        },
        downloadAndSaveMediaMessage: {
            async value(message, filename, attachExtension = true) {
                let quoted = message.msg ? message.msg : message;
                let mime = (message.msg || message).mimetype || '';
                let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
                const stream = await downloadContentFromMessage(quoted, messageType);
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                let type = await fileTypeFromBuffer(buffer);
                let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
                await fs.writeFileSync(trueFileName, buffer);
                return trueFileName;
            }
        },
        sendHydrated: {
            async value(jid, text = '', footer = '', buffer, url, urlText, call, callText, buttons, quoted, options) {
                let type;
                if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = buffer }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = buttons, buttons = callText, callText = call, call = urlText, urlText = url, url = buffer, buffer = null);
                if (!options) options = {};
                let templateButtons = [];
                if (url || urlText) {
                    if (!Array.isArray(url)) url = [url];
                    if (!Array.isArray(urlText)) urlText = [urlText];
                    templateButtons.push(...(
                        url.map((v, i) => [v, urlText[i]])
                            .map(([url, urlText], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
                                    url: !nullish(url) && url || !nullish(urlText) && urlText || ''
                                }
                            })) || []
                    ));
                }
                if (call || callText) {
                    if (!Array.isArray(call)) call = [call];
                    if (!Array.isArray(callText)) callText = [callText];
                    templateButtons.push(...(
                        call.map((v, i) => [v, callText[i]])
                            .map(([call, callText], i) => ({
                                index: templateButtons.length + i + 1,
                                callButton: {
                                    displayText: !nullish(callText) && callText || !nullish(call) && call || '',
                                    phoneNumber: !nullish(call) && call || !nullish(callText) && callText || ''
                                }
                            })) || []
                    ));
                }
                if (buttons && buttons.length) {
                    if (!Array.isArray(buttons[0])) buttons = [buttons];
                    templateButtons.push(...(
                        buttons.map(([text, id], index) => ({
                            index: templateButtons.length + index + 1,
                            quickReplyButton: {
                                displayText: !nullish(text) && text || !nullish(id) && id || '',
                                id: !nullish(id) && id || !nullish(text) && text || ''
                            }
                        })) || []
                    ));
                }
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    templateButtons,
                    ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                            location: { ...options, jpegThumbnail: buffer }
                        } : {
                            [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                        } : {})
                };
                return await conn.sendMessage(jid, message, { quoted, upload: conn.waUploadToServer, ...options });
            },
            enumerable: true
        },
        sendHydrated2: {
            async value(jid, text = '', footer = '', buffer, url, urlText, url2, urlText2, buttons, quoted, options) {
                let type;
                if (buffer) try { (type = await conn.getFile(buffer), buffer = type.data) } catch { buffer = buffer }
                if (buffer && !Buffer.isBuffer(buffer) && (typeof buffer === 'string' || Array.isArray(buffer))) (options = quoted, quoted = buttons, buttons = urlText2, urlText2 = url2, url2 = urlText, urlText = url, url = buffer, buffer = null);
                if (!options) options = {};
                let templateButtons = [];
                if (url || urlText) {
                    if (!Array.isArray(url)) url = [url];
                    if (!Array.isArray(urlText)) urlText = [urlText];
                    templateButtons.push(...(
                        url.map((v, i) => [v, urlText[i]])
                            .map(([url, urlText], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText) && urlText || !nullish(url) && url || '',
                                    url: !nullish(url) && url || !nullish(urlText) && urlText || ''
                                }
                            })) || []
                    ));
                }
                if (url2 || urlText2) {
                    if (!Array.isArray(url2)) url2 = [url2];
                    if (!Array.isArray(urlText2)) urlText2 = [urlText2];
                    templateButtons.push(...(
                        url2.map((v, i) => [v, urlText2[i]])
                            .map(([url2, urlText2], i) => ({
                                index: templateButtons.length + i + 1,
                                urlButton: {
                                    displayText: !nullish(urlText2) && urlText2 || !nullish(url2) && url2 || '',
                                    url: !nullish(url2) && url2 || !nullish(urlText2) && urlText2 || ''
                                }
                            })) || []
                    ));
                }
                if (buttons && buttons.length) {
                    if (!Array.isArray(buttons[0])) buttons = [buttons];
                    templateButtons.push(...(
                        buttons.map(([text, id], index) => ({
                            index: templateButtons.length + index + 1,
                            quickReplyButton: {
                                displayText: !nullish(text) && text || !nullish(id) && id || '',
                                id: !nullish(id) && id || !nullish(text) && text || ''
                            }
                        })) || []
                    ));
                }
                let message = {
                    ...options,
                    [buffer ? 'caption' : 'text']: text || '',
                    footer,
                    templateButtons,
                    ...(buffer ?
                        options.asLocation && /image/.test(type.mime) ? {
                            location: { ...options, jpegThumbnail: buffer }
                        } : {
                            [/video/.test(type.mime) ? 'video' : /image/.test(type.mime) ? 'image' : 'document']: buffer
                        } : {})
                };
                return await conn.sendMessage(jid, message, { quoted, upload: conn.waUploadToServer, ...options });
            },
            enumerable: true
        },
        msToDate: {
            async value(ms) {
                let days = Math.floor(ms / (24 * 60 * 60 * 1000));
                let daysms = ms % (24 * 60 * 60 * 1000);
                let hours = Math.floor((daysms) / (60 * 60 * 1000));
                let hoursms = ms % (60 * 60 * 1000);
                let minutes = Math.floor((hoursms) / (60 * 1000));
                let minutesms = ms % (60 * 1000);
                let sec = Math.floor((minutesms) / (1000));
                return days + " Hari " + hours + " Jam " + minutes + " Menit";
            }
        },
        delay: {
            async value(ms) {
                return new Promise((resolve) => setTimeout(resolve, ms));
            }
        },
		cMod: {
			value(jid, message, text = '', sender = conn.user.jid, options = {}) {
				if (options.mentions && !Array.isArray(options.mentions)) options.mentions = [options.mentions];
				let copy = message.toJSON();
				delete copy.message.messageContextInfo;
				delete copy.message.senderKeyDistributionMessage;
				let mtype = Object.keys(copy.message)[0];
				let msg = copy.message;
				let content = msg[mtype];
				if (typeof content === 'string') msg[mtype] = text || content;
				else if (content.caption) content.caption = text || content.caption;
				else if (content.text) content.text = text || content.text;
				if (typeof content !== 'string') {
					msg[mtype] = { ...content, ...options };
					msg[mtype].contextInfo = { ...(content.contextInfo || {}), mentionedJid: options.mentions || content.contextInfo?.mentionedJid || [] };
				}
				if (copy.participant) sender = copy.participant = sender || copy.participant;
				else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant;
				if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid;
				else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid;
				copy.key.remoteJid = jid;
				copy.key.fromMe = areJidsSameUser(sender, conn.user.id) || false;
				return proto.WebMessageInfo.create(copy);
			},
			enumerable: true,
		},
		copyNForward: {
			async value(jid, message, forwardingScore = true, options = {}) {
				let vtype;
				if (options.readViewOnce && message.message.viewOnceMessage?.message) {
					vtype = Object.keys(message.message.viewOnceMessage.message)[0];
					delete message.message.viewOnceMessage.message[vtype].viewOnce;
					message.message = proto.Message.create(JSON.parse(JSON.stringify(message.message.viewOnceMessage.message)));
					message.message[vtype].contextInfo = message.message.viewOnceMessage.contextInfo;
				}
				let mtype = Object.keys(message.message)[0];
				let m = generateForwardMessageContent(message, !!forwardingScore);
				let ctype = Object.keys(m)[0];
				if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) m[ctype].contextInfo.forwardingScore += forwardingScore;
				m[ctype].contextInfo = { ...(message.message[mtype].contextInfo || {}), ...(m[ctype].contextInfo || {}) };
				m = generateWAMessageFromContent(jid, m, { ...options, userJid: conn.user.jid });
				await conn.relayMessage(jid, m.message, {
					messageId: m.key.id,
					additionalAttributes: { ...options },
				});
				return m;
			},
			enumerable: true,
		},
        fakeReply: {
            value(jid, text = '', fakeJid = this.user?.jid || '', fakeText = '', fakeGroupJid, options) {
                return conn.reply(jid, text, { key: { fromMe: areJidsSameUser(fakeJid, conn.user?.id || ''), participant: fakeJid, ...(fakeGroupJid ? { remoteJid: fakeGroupJid } : {}) }, message: { conversation: fakeText }, ...options });
            }
        },
		downloadM: {
			async value(m, type, saveToFile) {
				let filename;
				if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
				const stream = await downloadContentFromMessage(m, type);
				let buffer = Buffer.from([]);
				for await (const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk]);
				}
				if (saveToFile) ({ filename } = await conn.getFile(buffer, true));
				return saveToFile && fs.existsSync(filename) ? filename : buffer;
			},
			enumerable: true,
		},
		parseMention: {
			value(text = '') {
				if (!text) return [];

				const match = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map((m) => m[1]);
				const out = [];

				for (const id of match) {
					if (id.length < 10) continue;
					const lid = `${id}@lid`;
					const jid = conn.getJid ? conn.getJid(lid) : lid;

					if (conn.isLid && conn.isLid[lid]) out.push(lid);
					else if (jid && jid !== lid && jid.includes(id)) out.push(jid);
					else out.push(`${id}@s.whatsapp.net`);
				}

				return [...new Set(out)];
			},
			enumerable: true,
		},
        saveName: {
            async value(id, name = '') {
                if (!id) return;
                id = conn.decodeJid(id) || '';
                if (!id) return;
                let isGroup = id.endsWith('@g.us');
                if (id in conn.contacts && conn.contacts[id][isGroup ? 'subject' : 'name'] && id in conn.chats) return;
                let metadata = {};
                if (isGroup) metadata = await conn.groupMetadata(id).catch(() => ({}));
                let chat = { ...(conn.contacts[id] || {}), id, ...(isGroup ? { subject: metadata.subject, desc: metadata.desc } : { name }) };
                conn.contacts[id] = chat;
                conn.chats[id] = chat;
            }
        },
		getName: {
			value(jid = '', withoutContact = false) {
				jid = conn.getJid(jid);
				withoutContact = conn.withoutContact || withoutContact;
				let v;

				if (jid.endsWith('@g.us')) {
					v = conn.chats[jid] || {};
					if (!(v.name || v.subject)) {
						v = (conn.chats[jid] || {}).metadata || {};
					}
					return v.name || v.subject || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
				}

				v = jid === '0@s.whatsapp.net' ? { jid, vname: 'WhatsApp' } : areJidsSameUser(jid, conn.user.jid) ? conn.user : conn.chats[jid] || {};
				return (!withoutContact && v.name) || v.subject || v.vname || v.notify || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international');
			},
			enumerable: true,
		},
		loadMessage: {
			value(messageID) {
				return Object.entries(conn.chats)
					.filter(([_, { messages }]) => typeof messages === 'object')
					.find(([_, { messages }]) => Object.entries(messages).find(([k, v]) => k === messageID || v.key?.id === messageID))?.[1].messages?.[messageID];
			},
			enumerable: true,
		},
		sendGroupV4Invite: {
			async value(groupJid, participant, inviteCode, inviteExpiration, groupName = 'unknown subject', caption = 'Invitation to join my WhatsApp group', jpegThumbnail, options = {}) {
				const msg = generateWAMessageFromContent(
					participant,
					{
						groupInviteMessage: {
							inviteCode,
							inviteExpiration: parseInt(inviteExpiration) || Date.now() + 3 * 86400000,
							groupJid,
							groupName,
							jpegThumbnail: Buffer.isBuffer(jpegThumbnail) ? jpegThumbnail : null,
							caption,
						},
					},
					{
						userJid: conn.user.id,
						...options,
					}
				);

				await conn.relayMessage(participant, msg.message, {
					messageId: msg.key.id,
				});
				return msg;
			},
			enumerable: true,
		},
        processMessageStubType: {
            async value(m) {
                if (!m.messageStubType) return;
                const chat = conn.decodeJid(m.key.remoteJid || m.message?.senderKeyDistributionMessage?.groupId || '');
                if (!chat || chat === 'status@broadcast') return;
                
                const emitGroupUpdate = (update) => {
                    conn.ev.emit('groups.update', [{ id: chat, ...update }]);
                };
                
                switch (m.messageStubType) {
                    case WAMessageStubType.REVOKE:
                    case WAMessageStubType.GROUP_CHANGE_INVITE_LINK:
                        emitGroupUpdate({ revoke: m.messageStubParameters?.[0] });
                        break;
                    case WAMessageStubType.GROUP_CHANGE_ICON:
                        emitGroupUpdate({ icon: m.messageStubParameters?.[0] });
                        break;
                    case WAMessageStubType.GROUP_PARTICIPANT_ADD:
                    case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
                    case WAMessageStubType.GROUP_PARTICIPANT_PROMOTE:
                    case WAMessageStubType.GROUP_PARTICIPANT_DEMOTE:
                    case WAMessageStubType.GROUP_PARTICIPANT_INVITE:
                    case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
                    case WAMessageStubType.GROUP_PARTICIPANT_CHANGE_NUMBER:
                        try {
                            const param = m.messageStubParameters?.[0];
                            if (param) {
                                const parsed = JSON.parse(param);
                                if (parsed.id && parsed.phoneNumber) {
                                    if (!conn.isLid) conn.isLid = {};
                                    conn.isLid[parsed.id] = parsed.phoneNumber;
                                }
                            }
                        } catch (e) {}
                        break;
                    default:
                        break;
                }
                const isGroup = chat.endsWith('@g.us');
                if (!isGroup) return;
                let chats = conn.chats[chat];
                if (!chats) chats = conn.chats[chat] = { id: chat };
                chats.isChats = true;
                const metadata = await conn.groupMetadata(chat).catch(_ => null);
                if (!metadata) return;
                chats.subject = metadata.subject;
                chats.metadata = metadata;
            }
        },
        relayWAMessage: {
            async value(pesanfull) {
                if (pesanfull.message.audioMessage) {
                    await conn.sendPresenceUpdate('recording', pesanfull.key.remoteJid);
                } else {
                    await conn.sendPresenceUpdate('composing', pesanfull.key.remoteJid);
                }
                var mekirim = await conn.relayMessage(pesanfull.key.remoteJid, pesanfull.message, { messageId: pesanfull.key.id });
                conn.ev.emit('messages.upsert', { messages: [pesanfull], type: 'append' });
                return mekirim;
            }
        },
		insertAllGroup: {
			async value() {
				const groups = (await conn.groupFetchAllParticipating().catch((_) => null)) || {};
				for (const group in groups)
					conn.chats[group] = {
						...(conn.chats[group] || {}),
						id: group,
						subject: groups[group].subject,
						isChats: true,
						metadata: groups[group],
					};
				return conn.chats;
			},
		},
		pushMessage: {
			async value(m) {
				if (!m) return;
				if (!Array.isArray(m)) m = [m];
				for (const message of m) {
					try {
						if (!message) continue;
                        if (message.messageStubType && message.messageStubType != WAMessageStubType.CIPHERTEXT) conn.processMessageStubType(message).catch(console.error);

						const _mtype = Object.keys(message.message || {});
						const mtype =
							(!['senderKeyDistributionMessage', 'messageContextInfo'].includes(_mtype[0]) && _mtype[0]) ||
							(_mtype.length >= 3 && _mtype[1] !== 'messageContextInfo' && _mtype[1]) ||
							_mtype[_mtype.length - 1];
						const chat = conn.getJid(message.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '');
						if (message.message?.[mtype]?.contextInfo?.quotedMessage) {
							let context = message.message[mtype].contextInfo;
							let participant = conn.getJid(context.participant);
							const remoteJid = conn.getJid(context.remoteJid || participant);
							let quoted = message.message[mtype].contextInfo.quotedMessage;
							if (remoteJid && remoteJid !== 'status@broadcast' && quoted) {
								const isGroup = remoteJid.endsWith('g.us');
								if (isGroup && !participant) participant = remoteJid;
								const qM = {
									key: {
										remoteJid,
										fromMe: areJidsSameUser(conn.user.jid, remoteJid),
										id: context.stanzaId,
										participant,
									},
									message: JSON.parse(JSON.stringify(quoted)),
									...(isGroup ? { participant } : {}),
								};
								let qChats = conn.chats[participant];
								if (!qChats)
									qChats = conn.chats[participant] = {
										id: participant,
										isChats: !isGroup,
									};
								if (!qChats.messages) qChats.messages = {};
								if (!qChats.messages[context.stanzaId] && !qM.key.fromMe) qChats.messages[context.stanzaId] = qM;
								let qChatsMessages;
								if ((qChatsMessages = Object.entries(qChats.messages)).length > 40) qChats.messages = Object.fromEntries(qChatsMessages.slice(30, qChatsMessages.length)); 
							}
						}
						if (!chat || chat === 'status@broadcast') continue;
						const isGroup = chat.endsWith('@g.us');
						let chats = conn.chats[chat];
						if (!chats) {
							if (isGroup) await conn.insertAllGroup().catch(console.error);
							chats = conn.chats[chat] = {
								id: chat,
								isChats: true,
								...(conn.chats[chat] || {}),
							};
						}
						let metadata, sender;
						if (isGroup) {
							if (!chats.subject || !chats.metadata) {
								metadata = (await conn.groupMetadata(chat).catch((_) => ({}))) || {};
								if (!chats.subject) chats.subject = metadata.subject || '';
								if (!chats.metadata) chats.metadata = metadata;
							}
							sender = conn.getJid((message.key?.fromMe && conn.user.id) || message.participant || message.key?.participant || chat);
							if (sender !== chat) {
								let chats = conn.chats[sender];
								if (!chats)
									chats = conn.chats[sender] = {
										id: sender,
									};
								if (!chats.name) chats.name = message.pushName || chats.name || '';
							}
						} else if (!chats.name) chats.name = message.pushName || chats.name || '';
						if (['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype)) continue;
						chats.isChats = true;
						if (!chats.messages) chats.messages = {};
						const fromMe = message.key.fromMe || areJidsSameUser(sender || chat, conn.user.id);
						if (!['protocolMessage'].includes(mtype) && !fromMe && message.messageStubType != WAMessageStubType.CIPHERTEXT && message.message) {
							delete message.message.messageContextInfo;
							delete message.message.senderKeyDistributionMessage;
							chats.messages[message.key.id] = JSON.parse(JSON.stringify(message, null, 2));
							let chatsMessages;
							if ((chatsMessages = Object.entries(chats.messages)).length > 40) chats.messages = Object.fromEntries(chatsMessages.slice(30, chatsMessages.length));
						}
					} catch (e) {
						console.error(e);
					}
				}
			},
		},
		serializeM: {
			value(m) {
				return smsg(conn, m);
			},
		},
        updateProfilePicture: {
            async value(jid, content) {
                const { img } = await generateProfilePicture(content);
                return conn.query({
                    tag: 'iq',
                    attrs: { to: conn.decodeJid(jid), type: 'set', xmlns: 'w:profile:picture' },
                    content: [{ tag: 'picture', attrs: { type: 'image' }, content: img }]
                });
            },
            enumerable: true
        },
        ...(typeof conn.chatRead !== 'function' ? {
            chatRead: {
                value(jid, participant = conn.user.jid, messageID) {
                    return conn.sendReadReceipt(jid, participant, [messageID]);
                },
                enumerable: true
            }
        } : {}),
		...(typeof conn.setStatus !== 'function'
			? {
					setStatus: {
						value(status) {
							return conn.query({
								tag: 'iq',
								attrs: {
									to: 's.whatsapp.net',
									type: 'set',
									xmlns: 'status',
								},
								content: [
									{
										tag: 'status',
										attrs: {},
										content: Buffer.from(status, 'utf-8'),
									},
								],
							});
						},
						enumerable: true,
					},
				}
			: {}),
	});
	if (sock.user?.id) sock.user.jid = sock.decodeJid(sock.user.id);
	store.bind(sock);
	return sock;
}

export function smsg(conn, m) {
	if (!m) return m;
	let M = proto.WebMessageInfo;
	m = M.create(m);
	m.message = parseMessage(m.message);
	Object.defineProperty(m, 'conn', {
		enumerable: false,
		writable: true,
		value: conn,
	});
	let protocolMessageKey;
	if (m.message) {
		if (m.mtype == 'protocolMessage' && m.msg.key) {
			protocolMessageKey = m.msg.key;
			if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat;
			if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender;
			protocolMessageKey.fromMe = conn.decodeJid(protocolMessageKey.participant) === conn.decodeJid(conn.user.id);
			if (!protocolMessageKey.fromMe && protocolMessageKey.remoteJid === conn.decodeJid(conn.user.id)) protocolMessageKey.remoteJid = m.sender;
		}
		if (m.quoted) if (!m.quoted.mediaMessage) delete m.quoted.download;
	}
	if (!m.mediaMessage) delete m.download;

	try {
		if (protocolMessageKey && m.mtype == 'protocolMessage') conn.ev.emit('message.delete', protocolMessageKey);
	} catch (e) {
		console.error(e);
	}
	return m;
}

export function serialize() {
	const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];
	const getDevice = (id) => (/^3A|2A.{18}$/.test(id) ? 'ios' : /^(.{21}|.{32})$/.test(id) ? 'android' : /^(3F|.{18}$)/.test(id) ? 'desktop' : 'unknown');

	return Object.defineProperties(proto.WebMessageInfo.prototype, {
		conn: {
			value: undefined,
			enumerable: false,
			writable: true,
		},
		id: {
			get() {
				return this.key?.id;
			},
		},
		isBaileys: {
			get() {
				return this.id?.length === 16 || (this.id?.startsWith('3EB0') || this.id?.startsWith('BAE5')) && (this.id?.length === 22 || this.id?.length === 16) || getDevice(this.id) === 'unknown' || false;
			},
		},
		chat: {
			get() {
				const senderKeyDistributionMessage = this.message?.senderKeyDistributionMessage?.groupId;
				return this.conn.getJid(
					this.key?.remoteJidAlt?.endsWith('@s.whatsapp.net')
						? this.key.remoteJidAlt
						: this.conn.getJid(this.key?.remoteJid) || (senderKeyDistributionMessage && senderKeyDistributionMessage !== 'status@broadcast')
				);
			},
		},
		isGroup: {
			get() {
				return this.chat.endsWith('@g.us');
			},
			enumerable: true,
		},
		senderLid: {
			get() {
				return String(this.key?.participant || this.participant || this.key?.remoteJid || '').decodeJid();
			},
			enumerable: true,
		},
		senderPn: {
			get() {
				return global.pnMap?.get(this.senderLid) || this.senderLid.replace(/[^0-9]/g, '');
			},
			enumerable: true,
		},
		sender: {
			get() {
				return this.conn.getJid((this.key?.fromMe && this.conn?.user.id) || this?.key?.participantAlt || this?.participant || this?.key?.participant || this.chat);
			},
			enumerable: true,
		},
		fromMe: {
			get() {
				return areJidsSameUser(this.conn?.user.jid, this.sender) || this.key?.fromMe || false;
			},
		},
		mtype: {
			get() {
				if (!this.message) return '';
				const type = Object.keys(this.message);
				return (
					(!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || 
					(type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || 
					type[type.length - 1] 
				); 
			},
			enumerable: true,
		},
		msg: {
			get() {
				if (!this.message) return null;
				return parseMessage(this.message[this.mtype]);
			},
		},
        messages: {
            get() {
                return this.message ? this.message : null;
            },
            enumerable: true
        },
		mediaMessage: {
			get() {
				if (!this.message) return null;
				const Message =
					(this.msg?.url || this.msg?.directPath
						? {
								...this.message,
							}
						: extractMessageContent(this.message)) || null;
				if (!Message) return null;
				const mtype = Object.keys(Message)[0];
				return MediaType.includes(mtype) ? Message : null;
			},
			enumerable: true,
		},
		mediaType: {
			get() {
				let message;
				if (!(message = this.mediaMessage)) return null;
				return Object.keys(message)[0];
			},
			enumerable: true,
		},
		quoted: {
			get() {
				const self = this;
				const msg = self.msg;
				const contextInfo = msg?.contextInfo;
				const quoted = parseMessage(contextInfo?.quotedMessage);
				if (!msg || !contextInfo || !quoted) return null;
				const type = Object.keys(quoted)[0];
				let q = quoted[type];
				const text = typeof q === 'string' ? q : q.text;
				return Object.defineProperties(JSON.parse(JSON.stringify(typeof q === 'string' ? { text: q } : q)), {
					mtype: {
						get() {
							return type;
						},
						enumerable: true,
					},
					mediaMessage: {
						get() {
							const Message = (q.url || q.directPath ? { ...quoted } : extractMessageContent(quoted)) || null;
							if (!Message) return null;
							const mtype = Object.keys(Message)[0];
							return MediaType.includes(mtype) ? Message : null;
						},
						enumerable: true,
					},
                    messages: {
                        get() {
                            return quoted ? quoted : null;
                        },
                        enumerable: true
                    },
					mediaType: {
						get() {
							let message;
							if (!(message = this.mediaMessage)) return null;
							return Object.keys(message)[0];
						},
						enumerable: true,
					},
					id: {
						get() {
							return contextInfo.stanzaId;
						},
						enumerable: true,
					},
					chat: {
						get() {
							return self.conn.getJid(contextInfo.remoteJid || self.chat);
						},
						enumerable: true,
					},
					isBaileys: {
						get() {
							return this.id?.length === 16 || (this.id?.startsWith('3EB0') || this.id?.startsWith('BAE5')) && (this.id?.length === 22 || this.id?.length === 16) || getDevice(this.id) === 'unknown' || false;
						},
						enumerable: true,
					},
					senderLid: {
						get() {
							return (contextInfo.participant || this.chat || '').decodeJid();
						},
						enumerable: true,
					},
					senderPn: {
						get() {
							return global.pnMap?.get(this.senderLid) || this.senderLid.replace(/[^0-9]/g, '');
						},
						enumerable: true,
					},
					sender: {
						get() {
							return self.conn.getJid(contextInfo.participant || this.chat);
						},
						enumerable: true,
					},
					fromMe: {
						get() {
							return areJidsSameUser(this.sender, self.conn?.user.jid);
						},
						enumerable: true,
					},
					text: {
						get() {
							return text || this.caption || this.contentText || this.selectedDisplayText || '';
						},
						enumerable: true,
					},
					mentionedJid: {
						get() {
							let raw = q.contextInfo?.mentionedJid || self.getQuotedObj()?.mentionedJid || [];
							return raw.map((jid) => self.conn.getJid(jid));
						},
						enumerable: true,
					},
					name: {
						get() {
							const sender = this.sender;
							return sender ? self.conn?.getName(sender) : null;
						},
						enumerable: true,
					},
					vM: {
						get() {
							return proto.WebMessageInfo.create({
								key: {
									fromMe: this.fromMe,
									remoteJid: this.chat,
									id: this.id,
								},
								message: quoted,
								...(self.isGroup
									? {
											participant: this.sender,
										}
									: {}),
							});
						},
					},
					fakeObj: {
						get() {
							return this.vM;
						},
					},
					download: {
						value(saveToFile = false) {
							const mtype = this.mediaType;
							return self.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile);
						},
						enumerable: true,
						configurable: true,
					},
					reply: {
						value(text, chatId, options) {
							return self.conn?.reply(chatId ? chatId : this.chat, text, this.vM, options);
						},
						enumerable: true,
					},
					copy: {
						value() {
							const M = proto.WebMessageInfo;
							return smsg(self.conn, M.create(M.toObject(this.vM)));
						},
						enumerable: true,
					},
					forward: {
						value(jid, force = false, options) {
							return self.conn?.sendMessage(
								jid,
								{
									forward: this.vM,
									force,
									...options,
								},
								{
									...options,
								}
							);
						},
						enumerable: true,
					},
					copyNForward: {
						value(jid, forceForward = false, options) {
							return self.conn?.copyNForward(jid, this.vM, forceForward, options);
						},
						enumerable: true,
					},
					cMod: {
						value(jid, text = '', sender = this.sender, options = {}) {
							return self.conn?.cMod(jid, this.vM, text, sender, options);
						},
						enumerable: true,
					},
					delete: {
						value() {
							return self.conn?.sendMessage(this.chat, {
								delete: this.vM.key,
							});
						},
						enumerable: true,
					},
                    react: {
                        value(text) {
                            return self.conn?.sendMessage(this.chat, {
                                react: { text, key: this.vM.key }
                            });
                        },
                        enumerable: true,
                    },
                    command: {
                        get() {
                            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
                            let _prefix = global.prefix;
                            let textMatch = text || this.caption || this.contentText || this.selectedDisplayText || '';
                            let match = (_prefix instanceof RegExp ? [
                                [_prefix.exec(textMatch), _prefix]
                            ] :
                                Array.isArray(_prefix) ?
                                    _prefix.map(p => {
                                        let re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
                                        return [re.exec(textMatch), re];
                                    }) :
                                    typeof _prefix === "string" ? [
                                        [new RegExp(str2Regex(_prefix)).exec(textMatch), new RegExp(str2Regex(_prefix))]
                                    ] : [
                                        [[], new RegExp]
                                    ]
                            ).find(p => p[1]);
                            let result = ((global.opts?.['multiprefix'] ?? true) && (match[0] || "")[0]) || ((global.opts?.['noprefix'] ?? false) ? null : (match[0] || "")[0]);
                            let noPrefix = !result ? textMatch : textMatch.replace(result, "");
                            let args_v2 = noPrefix.trim().split(/ +/);
                            let [command, ...args] = noPrefix.trim().split(" ").filter(v => v);
                            return { command, args, args_v2, noPrefix, match };
                        },
                        enumerable: true
                    },
                    device: {
                        get() {
                            const device = getDevice(this.vM.key?.id);
                            const platform = os.platform();
                            const isUnknownDevice = device === 'unknown' && platform;
                            const res = device ? (isUnknownDevice ? (platform === 'android' ? 'Android' : ['win32', 'darwin', 'linux'].includes(platform) ? 'Desktop' : 'Unknown') : device) : 'Unknown Device';
                            return res;
                        },
                        enumerable: true
                    },
                    isBot: {
                        get() {
                            const idBot = this.vM.key?.id;
                            return ["3EB0", "BAE5"].some(k => idBot.includes(k) && this.sender !== this.conn?.user?.jid);
                        },
                        enumerable: true
                    }
				});
			},
			enumerable: true,
		},
		_text: {
			value: null,
			writable: true,
		},
		text: {
			get() {
				const msg = this.msg;
				let btnRes = '';
				if (this.mtype === 'interactiveResponseMessage') {
					try { let params = JSON.parse(msg?.nativeFlowResponseMessage?.paramsJson || '{}'); btnRes = params.id || ''; } catch (e) {}
				} else if (this.mtype === 'templateButtonReplyMessage') { btnRes = msg?.selectedId || ''; } else if (this.mtype === 'buttonsResponseMessage') { btnRes = msg?.selectedButtonId || ''; } else if (this.mtype === 'listResponseMessage') { btnRes = msg?.singleSelectReply?.selectedRowId || ''; }
				const text = (typeof msg === 'string' ? msg : msg?.text) || msg?.caption || msg?.contentText || msg?.selectedDisplayText || msg?.hydratedTemplate?.hydratedContentText || btnRes || '';
				if (typeof this._text === 'string') return this._text;
				return text;
			},
			set(str) {
				this._text = str;
			},
			enumerable: true,
		},
		mentionedJid: {
			get() {
				let raw = (this.msg?.contextInfo?.mentionedJid?.length && this.msg.contextInfo.mentionedJid) || [];
				return raw.map((jid) => this.conn.getJid(jid));
			},
			enumerable: true,
		},
		name: {
			get() {
				return (!nullish(this.pushName) && this.pushName) || this.conn?.getName(this.sender);
			},
			enumerable: true,
		},
		download: {
			value(saveToFile = false) {
				const mtype = this.mediaType;
				return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile);
			},
			enumerable: true,
			configurable: true,
		},
		reply: {
			value(text, chatId, options) {
				return this.conn?.reply(chatId ? chatId : this.chat, text, this, options);
			},
		},
		edit: {
			value(text, key) {
				return this.conn.sendMessage(this.chat, { text, edit: key });
			},
		},
		react: {
			value(emoji) {
				return this.conn.sendMessage(this.chat, {
					react: { text: emoji, key: this.key },
				});
			},
		},
		copy: {
			value() {
				const M = proto.WebMessageInfo;
				return smsg(this.conn, M.create(M.toObject(this)));
			},
			enumerable: true,
		},
		forward: {
			value(jid, force = false, options = {}) {
				return this.conn?.sendMessage(
					jid,
					{
						forward: this,
						force,
						...options,
					},
					{
						...options,
					}
				);
			},
			enumerable: true,
		},
		copyNForward: {
			value(jid, forceForward = false, options = {}) {
				return this.conn?.copyNForward(jid, this, forceForward, options);
			},
			enumerable: true,
		},
		cMod: {
			value(jid, text = '', sender = this.sender, options = {}) {
				return this.conn?.cMod(jid, this, text, sender, options);
			},
			enumerable: true,
		},
		getQuotedObj: {
			value() {
				if (!this.quoted.id) return null;
				const q = proto.WebMessageInfo.create(this.conn?.loadMessage(this.quoted.id) || this.quoted.vM);
				return smsg(this.conn, q);
			},
			enumerable: true,
		},
		getQuotedMessage: {
			get() {
				return this.getQuotedObj;
			},
		},
		delete: {
			value() {
				return this.conn?.sendMessage(this.chat, {
					delete: this.key,
				});
			},
			enumerable: true,
		},
        device: {
            get() {
                const device = getDevice(this.key?.id);
                const platform = os.platform();
                const isUnknownDevice = device === 'unknown' && platform;
                const res = device ? (isUnknownDevice ? (platform === 'android' ? 'Android Device' : ['win32', 'darwin', 'linux'].includes(platform) ? 'Desktop' : 'Unknown Device') : device) : 'Unknown Device';
                return res;
            },
            enumerable: true
        },
        isBot: {
            get() {
                const idBot = this.key?.id;
                return ["3EB0", "BAE5"].some(k => idBot.includes(k) && this.sender !== this.conn?.user?.jid);
            },
            enumerable: true
        }
	});
}

export function logic(check, inp, out) {
	if (inp.length !== out.length) throw new Error('Input and Output must have same length');
	for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i];
	return null;
}

function parseMessage(content) {
	content = extractMessageContent(content);
	if (content && content.viewOnceMessageV2Extension) {
		content = content.viewOnceMessageV2Extension.message;
	}
	if (content && content.protocolMessage && content.protocolMessage.type == 14) {
		let type = getContentType(content.protocolMessage);
		content = content.protocolMessage[type];
	}
	if (content && content.message) {
		let type = getContentType(content.message);
		content = content.message[type];
	}
	return content;
}

const getContentType = (content) => {
	if (content) {
		const keys = Object.keys(content);
		const key = keys.find((k) => (k === 'conversation' || k.endsWith('Message') || k.includes('V2') || k.includes('V3')) && k !== 'senderKeyDistributionMessage');
		return key;
	}
};

export function protoType() {
	Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
		const ab = new ArrayBuffer(this.length);
		const view = new Uint8Array(ab);
		for (let i = 0; i < this.length; ++i) {
			view[i] = this[i];
		}
		return ab;
	};
	Buffer.prototype.toArrayBufferV2 = function toArrayBuffer() {
		return this.buffer.slice(this.byteOffset, this.byteOffset + this.byteLength);
	};
	ArrayBuffer.prototype.toBuffer = function toBuffer() {
		return Buffer.from(new Uint8Array(this));
	};
	Uint8Array.prototype.getFileType =
		ArrayBuffer.prototype.getFileType =
		Buffer.prototype.getFileType =
			async function getFileType() {
				return await fileTypeFromBuffer(this);
			};
	String.prototype.isNumber = Number.prototype.isNumber = isNumber;
	String.prototype.capitalize = function capitalize() {
		return this.charAt(0).toUpperCase() + this.slice(1, this.length);
	};
	String.prototype.capitalizeV2 = function capitalizeV2() {
		const str = this.split(' ');
		return str.map((v) => v.capitalize()).join(' ');
	};
	String.prototype.decodeJid = function decodeJid() {
		if (/:\d+@/gi.test(this)) {
			const decode = jidDecode(this) || {};
			return ((decode.user && decode.server && decode.user + '@' + decode.server) || this).trim();
		} else return this.trim();
	};
	Number.prototype.toTimeString = function toTimeString() {
		const seconds = Math.floor((this / 1000) % 60);
		const minutes = Math.floor((this / (60 * 1000)) % 60);
		const hours = Math.floor((this / (60 * 60 * 1000)) % 24);
		const days = Math.floor(this / (24 * 60 * 60 * 1000));
		return ((days ? `${days} hari ` : '') + (hours ? `${hours} jam ` : '') + (minutes ? `${minutes} menit ` : '') + (seconds ? `${seconds} detik` : '')).trim();
	};
	Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = getRandom;
}

function isNumber() {
	const int = parseInt(this);
	return typeof int === 'number' && !isNaN(int);
}

function getRandom() {
	if (Array.isArray(this) || this instanceof String) return this[Math.floor(Math.random() * this.length)];
	return Math.floor(Math.random() * this);
}

function nullish(args) {
	return !(args !== null && args !== undefined);
}

async function generateProfilePicture(mediaUpload) {
    let bufferOrFilePath;
    if (Buffer.isBuffer(mediaUpload)) bufferOrFilePath = mediaUpload;
    else if ('url' in mediaUpload) bufferOrFilePath = mediaUpload.url.toString();
    else bufferOrFilePath = await toBuffer(mediaUpload.stream);
    
    try {
        let readImage;
        if (typeof Jimp.read === 'function') {
            readImage = await Jimp.read(bufferOrFilePath);
        } else if (typeof Jimp.fromBuffer === 'function') {
            readImage = await Jimp.fromBuffer(bufferOrFilePath);
        } else {
            throw new Error('Fungsi read di Jimp tidak support.');
        }
        
        const min = readImage.getWidth();
        const max = readImage.getHeight();
        const cropped = readImage.crop(0, 0, min, max);
        
        const mime = Jimp.MIME_JPEG || 'image/jpeg';
        const auto = Jimp.AUTO || -1;
        
        return {
            img: await cropped.quality(100).scaleToFit(720, 720, auto).getBufferAsync(mime)
        };
    } catch (err) {
        console.log('⚠️ [SISTEM BYPASS] Jimp Error:', err.message);
        return { img: bufferOrFilePath };
    }
}
