/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/express/express.d.ts" />
/// <reference path="../typings/body-parser/body-parser.d.ts" />

import fs = require('fs');
import Express = require('express');
import BodyParser = require('body-parser');
import LinkShortener = require('./classes/LinkShortener.class');

const appConfiguration = JSON.parse(fs.readFileSync(__dirname + '/app.configuration.json', 'utf-8'));
// The port to listen on. Takes the environment first then the value from the JSON.
const LISTEN_PORT = process.env['PORT'] || appConfiguration.listenPort;
// Every link stored older than that will be wiped from the cache (i.e. expire).
const HOURS_TO_STORE = appConfiguration.hoursToStore;
// A shortened link will consist of this URL + the code:
const OUTPUT_DOMAIN = appConfiguration.outputDomain;
// Since we're a redirection service, we might want to redirect to
// some default of fallback URL in case a requested short URL does
// not exist (anymore). If this evaluates to false, a 400 is returned.
const FALLBACK_URL = appConfiguration.fallbackUrl;


const shortener = new LinkShortener.LinkShortener(Math.pow(62, 3) - 1, HOURS_TO_STORE);
const app: Express.Application = Express()
	.disable('x-powered-by')
	.use(BodyParser.json())
	.use(BodyParser.urlencoded({ extended: true }));


// Import middlewares:
import middleware_CORS = require('./middleware/CORS');
middleware_CORS.configure(app);


// Import routes:
import route_shorten = require('./routes/shorten');
route_shorten.configure(app, shortener, OUTPUT_DOMAIN);

import route_redirect = require('./routes/redirect');
route_redirect.configure(app, shortener, FALLBACK_URL);


// Now finally start the app by listening on the specified port:
app.listen(LISTEN_PORT);
