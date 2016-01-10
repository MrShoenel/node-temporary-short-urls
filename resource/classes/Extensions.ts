export class XArray<T> extends Array<T> {
	public randomize(prng?: () => number): Array<T> {
		var t: T, j: number, ret = this.slice(0), i = ret.length;
		prng = prng || Math.random;
		while(--i > 0) {
			t = ret[j = Math.round(prng() * i)];
			ret[j] = ret[i];
			ret[i] = t;
		}
		return ret;
	}
	
	public static fromArray<T1>(arr: Array<T1>): XArray<T1> {
		const xarr = new XArray<T1>();
		xarr.push.apply(xarr, arr);
		return xarr;
	}
}
