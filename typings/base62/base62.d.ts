interface Base62 {
	encode(value: number): string;
	decode(value: string): number;
	setCharacterSet(set: string): void;
}
