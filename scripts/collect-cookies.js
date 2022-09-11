require('dotenv').config();
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launchPersistentContext('./browser-data', { headless: false })
	/*if (fs.existsSync('cookies.json')) {
		await browser.addCookies(JSON.parse(fs.readFileSync('cookies.json').toString()));
		console.log('loaded cookies')
	}*/

	// h3 with text of "Discord App Detected"
	// h3 with text of "Welcome back!"
	// window.title !== ".* | #vomitmemes | .*"

  const page = await browser.newPage();
  await page.goto('https://discord.com/channels/735923219315425401/737449767684145203');
	//await page.waitForTimeout(60000);
	await page.pause();
  const cookies = await browser.cookies()
	fs.promises.writeFile('cookies.json', JSON.stringify(cookies));
  await browser.close();
})();
function collectPosts(){
	const list = document.querySelector('[data-list-id="chat-messages"]')
	const scroller = list.parentElement.parentElement;
	// Collects image anchors
	for (const anchor of list.querySelectorAll('li [class^="imageContent"] a[href]')){
		console.log(anchor.href)
	}
}

const post = {
  _id: '',
  owner: {
    _id: '',
    displayName: '',
    avatar: ''
  },
  url: ''
}
// $('[data-list-id="chat-messages"]').parentElement.parentElement.scrollTop = -= current window height
// .^messageAttachment .^imageContent a[href]
// Extract information from .__reactProps$