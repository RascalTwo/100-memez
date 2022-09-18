require("dotenv").config({ path: "../config/.env" });
const { chromium } = require('playwright');
const connectDB = require('../config/database');
const Post = require('../models/Post');
const User = require('../models/User');

(async () => {
	const conn = await connectDB();

	const browser = await chromium.launchPersistentContext('./browser-data', { headless: false })
	const page = await browser.newPage();
	await page.goto('https://discord.com/channels/735923219315425401/737449767684145203');
	await page.waitForSelector(`[data-list-id="chat-messages"]`);

	const created = new Set();

	const posts = []
	const owners = {};

	while (true) {
		posts.push(...await page.evaluate(() => [...document.querySelectorAll('[id^="chat-messages"]')].map(li => li.__reactProps$.children.props?.childrenMessageContent.props.message).filter(m => m && (m.attachments.some(att => att.content_type?.startsWith('image')) || m.embeds.some(e => e.type.startsWith('image')))).map(m => ({
			_id: m.id.toString(),
			url: m.attachments.find(a => a.content_type.startsWith('image'))?.url || m.embeds.find(e => e.type.startsWith('image')).url,
			owner: {
				_id: m.author.id,
				avatar: m.author.avatar,
				displayName: `${m.author.username}#${m.author.discriminator}`
			}
		}))))

		for (const post of posts) {
			if (!created.has(post.owner._id)) owners[post.owner._id] = post.owner;
			post.ownerId = post.owner._id;
			post.likes = 0;
			const dateBits = Number(BigInt.asUintN(64, post._id) >> 22n);
			post.createdAt = new Date(dateBits + 1420070400000);
		}

		posts.splice(0, posts.length, ...posts.filter(p => !created.has(p._id)))
		for (const id in owners){
			if (created.has(id)) delete owners[id];
		}

		for (const post of posts) {
			try {
				console.log('p', post._id)
				const dbPost = await Post.findById(post._id);
				if (dbPost) {
					dbPost.url = post.url;
					dbPost.createdAt = post.createdAt;
					await dbPost.save()
				} else {
					await Post.create(post)
				}
				created.add(post._id)
			} catch (e) { console.error(e) }
		}
		for (const owner of Object.values(owners)) {
			try {
				console.log('o', owner._id)
				const dbUser = await User.findById(owner._id);
				if (dbUser) {
					dbUser.avatar = owner.avatar;
					dbUser.displayName = owner.displayName;
					await dbUser.save()
				} else {
					await User.create(owner)
				}
				created.add(owner._id)
				delete owners[owner.id]
			} catch (e) { console.error(e) }
		}

		const top = await page.evaluate(() => document.querySelector('[id^="chat-messages"]').parentNode.parentNode.parentNode.scrollTop)
		console.log(posts.length, Object.keys(owners).length, top);
		if (!top) break;
		await page.evaluate(() => document.querySelector('[id^="chat-messages"]').parentNode.parentNode.parentNode.scrollTop = 0);
		await new Promise(resolve => setTimeout(resolve, 5000));
	}

	await browser.close();
	return conn.disconnect();
})().catch(console.error);