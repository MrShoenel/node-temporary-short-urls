/**
 * This class provides a round-robin Key-Value storage.
 */
export class RRStorage<T> {
	
	private itemsPerStore = 1 << 10; // 2^10
	
	private numItemsInitial = 1 << 12;
	
	private stores: IStore<T>[] = [];
	
	private index: number;
	
	constructor() {
		this.index = 0;
		
		const numStoresInitial = Math.ceil(this.numItemsInitial / this.itemsPerStore);
		for (let i = 0; i < numStoresInitial; i++) {
			this.stores.push({});
		}
	}
	
	/**
	 * Returns the index of the stored item.
	 */
	public store(item: T): number {
		const storeToUse: IStore<T> = this.stores[Math.floor(this.index / this.itemsPerStore)];
		storeToUse[(this.index % this.itemsPerStore).toString()] = item;
		
		const indexBefore = this.index;
		this.index = (++this.index) % this.capacity;
		return indexBefore;
	}
	
	public getItem(index: number): T {
		if (index < 0 || index >= this.capacity) {
			throw new Error('Index out of bounds: ' + index);
		}
		
		const storeToUse: IStore<T> = this.stores[Math.floor(index / this.itemsPerStore)];
		const indexStr = (index % this.itemsPerStore).toString();
		if (!storeToUse.hasOwnProperty(indexStr)) {
			throw new Error('Index does not exist: ' + indexStr);
		}
		
		return storeToUse[indexStr];
	}
	
	public get capacity(): number {
		return this.itemsPerStore * this.stores.length;
	}
	
	public get numItemsPerStore(): number {
		return this.itemsPerStore;
	}
	
	/**
	 * Adds a new store to the storage.
	 */
	public increaseCapacity(): RRStorage<T> {
		const storeIdx: number = Math.floor(this.index / this.itemsPerStore);

		if (storeIdx === (this.stores.length - 1)) {
			this.stores.push({});
		} else {
			this.stores.splice(storeIdx + 1, 0, {});
		}
		
		return this;
	}
	
	/**
	 * @param allowDecreaseBefore set this to true to allow the deletion
	 * of the first store. In this case all previous returned indexes
	 * invalidate because they decrease by the size of one storage.
	 */
	public tryDecreaseCapacity(allowDecreaseBefore: boolean = false): boolean {
		if (this.stores.length === 1) {
			return false; // cannot remove storage if there's only one
		}
		
		// Determine in which store the index currently is and then
		// remove the store ahead of that (in an RR-manner).
		const storeIdx: number = Math.floor(this.index / this.itemsPerStore);
		
		// If the current index is the last, we need to remove the first element
		// and decrease the index (if allowed).
		if (storeIdx === (this.stores.length - 1)) {
			if (allowDecreaseBefore === true) {
				this.stores[0] = null;
				this.stores.splice(0, 1);
				this.index -= this.itemsPerStore;
			} else {
				return false;
			}
		} else {
			// The store to delete is 'ahead' the current index. We can
			// safely delete that.
			this.stores[storeIdx + 1] = null;
			this.stores.splice(storeIdx + 1, 1);
		}
		
		return true;
	}
}

export interface IStore<T> {
	[key: string]: T;
}