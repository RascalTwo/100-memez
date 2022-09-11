const cloudinary = require("cloudinary").v2;

require("dotenv").config({ path: "./config/.env" });

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

module.exports = require('@rascal_two/express-handler-tracker').proxyInstrument({
  ...cloudinary,
  api: require('@rascal_two/express-handler-tracker').proxyInstrument(cloudinary.api, 'cloudinary.api', { allProperties: true }),
  uploader: require('@rascal_two/express-handler-tracker').proxyInstrument(cloudinary.uploader, 'cloudinary.uploader', { allProperties: true }),
  provisioning: require('@rascal_two/express-handler-tracker').proxyInstrument(cloudinary.provisioning, 'cloudinary.provisioning', { allProperties: true }),
  utils: require('@rascal_two/express-handler-tracker').proxyInstrument(cloudinary.utils, 'cloudinary.utils', { allProperties: true })
}, 'cloudinary', { allProperties: true });
