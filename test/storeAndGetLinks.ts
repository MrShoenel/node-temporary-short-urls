/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../resource/classes/LinkShortener.class.ts" />
/// <reference path="../resource/classes/RRStorage.class.ts" />

/**
 * Module dependencies.
 */
import chai = require('chai');
import RRStorage = require('../resource/classes/RRStorage.class');
import LinkShortener = require('../resource/classes/LinkShortener.class');

/**
 * Globals
 */

var expect = chai.expect;

/**
 * Unit tests
 */
describe('We should get the same links wrt. offsets', () => {
	
	var ls = new LinkShortener.LinkShortener(Math.pow(62, 3) - 1, 1 / 9007199254740991); // to avoid increasing the buffer
	var key = ls.storeLink('foo');
	
	console.log('Alphabet: ' + LinkShortener.RandomBase62Alphabet);
	
	it('should interact correctly with the alphabet', done => {
		expect(key).to.equals('GGG');
		done();
	});
	
	it('should return the same code again', (done) => {
		expect(ls.getLink(key)).to.equals('foo');
		done();
	});
	
	it('should throw an error if the index is o-o-b', done => {
		try {
			ls.getLink('GGG0');
		} catch (e) {
			expect(e.message.indexOf('Index out of bounds') === 0).to.equals(true);
			done();
		}
	});
	
	it('should not increase the buffer-size', done => {
		var storage = ls.getStorage();
		
		var max = 1 << 16
		// we already stored one..
		for (var i = 0; i < (max - 1); i++) {
			ls.storeLink(i.toString());
		}
		
		expect(storage.capacity).to.equals(1 << 12); // shouldn't have changed
		expect(ls.getStoreCounter()).to.equals(max);
		
		done();
	});
	
	it('should be consistent after storing more than max', done => {
		var link = ls.getStorage().getItem(((1 << 16) - 1) % (1 << 12));
		expect(link).to.equals(((1 << 16) - 2).toString());
		done();
	});
	
	it('should be consistent when increasing the buffer', done => {
		ls.getStorage().increaseCapacity();
		
		expect(ls.getStorage().capacity).to.equals((1 << 12) + (1 << 10));
		
		expect(ls.getStorage().store('dummy')).to.equals(0); // still use first index
		
		done();
	});
	
	it('should be possible to decrease the storage\'s size', done => {
		
		var rr = new RRStorage.RRStorage<any>();
		var nips = rr.numItemsPerStore;
		
		while (rr.tryDecreaseCapacity()); // decrease to one container
		
		expect(rr.capacity).to.equal(nips);
		
		for (var i = 0; i < nips - 1; i++) {
			rr.store(i);
		}
		
		// now increase capacity to before storing final element so
		// that we prevent the index from round-tripping:
		rr.increaseCapacity().store('1024th element');
		
		// one more
		var storeIdx = rr.store(-1000); // to make it more explicit
		expect(rr.capacity).to.equal(2 * nips);
		expect(storeIdx).to.equal(nips);
		
		// try delete without allowing deletions before
		expect(rr.tryDecreaseCapacity(false)).to.equal(false);
		
		// now delete with allowing that
		expect(rr.tryDecreaseCapacity(true)).to.equal(true);
		
		expect(rr.getItem(storeIdx - nips)).to.equal(-1000);
		
		done();
	});
});