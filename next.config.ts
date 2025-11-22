import type { NextConfig } from "next";
import { version } from './package.json'
import { execSync } from "node:child_process";


let commitHash = 'unknown';
try {
	commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
}

const buildId = process.env.NODE_ENV === 'development'
	? 'development'
	: commitHash;

const nextConfig = {
	reactStrictMode: true,
	generateBuildId: async () => {
		return buildId;
	},

	env: {
		NEXT_PUBLIC_APP_VERSION: version,
		NEXT_PUBLIC_COMMIT_HASH: commitHash,
		NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
		NEXT_PUBLIC_BUILD_ID: buildId,
	},
}

export default nextConfig;
