require("dotenv").config({ path: "../config/.env" });
const { chromium } = require('playwright');
const connectDB = require('../config/database');
const Post = require('../models/Post');
const User = require('../models/User');

(async () => {
	process.env
	await connectDB();

	const browser = await chromium.launchPersistentContext('./browser-data', { headless: false })
	const page = await browser.newPage();
	await page.goto('https://discord.com/channels/735923219315425401/737449767684145203');
	await page.waitForSelector(`[data-list-id="chat-messages"]`);
	/*
	const posts = await page.evaluate(() => document.querySelector('[data-list-id="chat-messages"]').__reactProps$.children[1].filter(c => c.props.message).map(c => c.props.message).filter(m => m.attachments[0]?.content_type.startsWith('image')).map(m => ({
		_id: m.id,
		url: m.attachments[0].url,
		owner: {
				_id: m.author.id,
				avatar: m.author.avatar,
				displayName: `${m.author.username}#${m.author.discriminator}`
		}
	})))*/

	const posts = await page.evaluate(() => [...document.querySelectorAll('[id^="chat-messages"]')].map(li => li.__reactProps$.children.props.childrenMessageContent.props.message).filter(m => m.attachments[0]?.content_type.startsWith('image')).map(m => ({
		_id: m.id.toString(),
		url: m.attachments[0].url?.toString(),
		owner: {
			_id: m.author.id?.toString(),
			avatar: m.author.avatar?.toString(),
			displayName: `${m.author.username}#${m.author.discriminator}`
		},
		likes: 1
	})));

	//await page.pause()
	await browser.close();

	const owners = {};
	for (const post of posts) {
		owners[post.owner._id] = post.owner;
		post.ownerId = post.owner._id;
	}
	console.log(posts);
	console.log(owners);

	for (const post of posts) {
		try {
			console.log(post._id)
			const dbPost = await Post.findById(post._id);
			if (dbPost) {
				dbPost.url = post.url;
				await dbPost.save()
			} else {
				await Post.create(post)
			}
		} catch (e) { console.error(e) }
	}
	for (const owner of Object.values(owners)) {
		try {
			console.log(owner._id)
			const dbUser = await User.findById(owner._id);
			if (dbUser) {
				dbUser.avatar = owner.avatar;
				dbUser.displayName = owner.displayName;
				await dbUser.save()
			} else {
				await User.create(owner)
			}
		} catch (e) { console.error(e) }
	}
})().catch(console.error);