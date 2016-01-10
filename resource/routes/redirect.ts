/// <reference path="../../typings/express/express.d.ts" />
import Express = require('express');
import LinkShortener = require('../classes/LinkShortener.class');

/**
 * Used for getting stored URLs. We will have to parse the code and give it
 * to the LinkShortener so it can try to get the result.
 */
export function configure(app: Express.Application, shortener: LinkShortener.LinkShortener, fallbackUrl: string) {
	app.get(/[a-z0-9]/i, (req: Express.Request, res: Express.Response) => {
		try {
			const url = shortener.getLink(req.url.substr(1));
			res.redirect(301, url);
		} catch (e) {
			if (!fallbackUrl) {
				res.statusCode = 400;
			} else {
				res.redirect(307, fallbackUrl);
			}
		}

		res.end();
	});
};
