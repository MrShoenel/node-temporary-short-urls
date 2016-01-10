/// <reference path="../../typings/express/express.d.ts" />
import Express = require('express');
import LinkShortener = require('../classes/LinkShortener.class');

/**
 * Route for creating short URLs. The payload is expected to go by the name
 * 'shorten' and to be an array of URLs to shorten. The response is an asso-
 * ciative array where the key is the original URL and the value the full
 * URL (Output-Domain + short-code).
 */
export function configure(app: Express.Application, shortener: LinkShortener.LinkShortener, outputDomain: string) {
	app.post('/shorten', (req: Express.Request, res: Express.Response) => {
		let response: { [key:string]: string } = {};

		try {
			//const urls: string[] = JSON.parse(req.body.shorten).urls;
			const urls = req.body.shorten.urls as string[];
			
			// get shortened
			for (var i = 0; i < urls.length; i++) {
				response[urls[i]] = outputDomain + shortener.storeLink(urls[i]);
			}
			res.end(JSON.stringify(response));
		} catch (e) {
			res.statusCode = 400;
		}
		
		res.end();
	});
};
