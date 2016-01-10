/// <reference path="../../typings/base62/base62.d.ts" />
/// <reference path="../../typings/seedmath/seedmath.d.ts" />
/// <reference path="./RRStorage.class.ts" />

import Extensions = require('./Extensions');
import RRStorage = require('./RRStorage.class');

const base62 = <Base62>require('base62');
const seedMath = <SeedMath>require('seedrandom');


export const RandomBase62Alphabet: string =
	Extensions.XArray.fromArray('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')).randomize(seedMath('s33d', { global: false })).join('');

// Now we set that deterministically randomized alphabet:
base62.setCharacterSet(RandomBase62Alphabet);


export class LinkShortener {
	
	private storage: RRStorage.RRStorage<string>;
	
	private firstStoreDate: Date;
	
	private storeCounter: number;
	
	constructor(private linkIntOffset: number, private numHoursToStore: number) {
		this.storage = new RRStorage.RRStorage<string>();
		this.firstStoreDate = new Date();
		this.storeCounter = 0;
	}
	
	public getStorage(): RRStorage.RRStorage<string> {
		return this.storage;
	}
	
	public getStoreCounter(): number {
		return this.storeCounter + 0;
	}
	
	/**
	 * Stores a link and returns its Base62-code.
	 */
	public storeLink(link: string): string {
		const code = this.storage.store(link);
		this.storeCounter++;
		
		if (this.storeCounter % (1 << 5) === 0 && this.shouldStoreIncreaseCapacity()) {
			this.storage.increaseCapacity();
		}
		
		return base62.encode(code + this.linkIntOffset);
	}
	
	/**
	 * Gets a link by its code.
	 */
	public getLink(code: string): string {
		const codeWithoutOffset = base62.decode(code) - this.linkIntOffset;
		return this.storage.getItem(codeWithoutOffset);
	}
	
	private shouldStoreIncreaseCapacity(): boolean {
		const totalHours = ((new Date()).getTime() - this.firstStoreDate.getTime()) / 3.6e6;
		const linksPerHour = this.storeCounter / totalHours;
		const neededCapacity = linksPerHour * this.numHoursToStore;
		
		return neededCapacity > this.storage.capacity;
	}
}
