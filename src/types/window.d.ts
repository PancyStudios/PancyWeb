export {};

declare global {
	interface Window {
		_build_version: {
			version?: string;
			commit?: string;
			date?: string;
			env?: string;
			buildId?: string;
		};
	}
}