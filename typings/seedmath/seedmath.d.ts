interface SeedMath {
	(seed: string, opts?: {
		entropy?: boolean,
		global?: boolean
	}): () => number;
	
	(): () => number;
}
