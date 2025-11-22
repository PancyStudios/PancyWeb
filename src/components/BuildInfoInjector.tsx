"use client";

import { useEffect } from 'react';

export const BuildInfoInjector = () => {
	useEffect(() => {
		window._build_version = {
			version: process.env.NEXT_PUBLIC_APP_VERSION,
			commit: process.env.NEXT_PUBLIC_COMMIT_HASH,
			date: process.env.NEXT_PUBLIC_BUILD_DATE,
			buildId: process.env.NEXT_PUBLIC_BUILD_ID,
			env: process.env.NODE_ENV,
		};

		console.log(
			`%c 🚀 PancyBot Dashboard v${process.env.NEXT_PUBLIC_APP_VERSION} (${process.env.NEXT_PUBLIC_COMMIT_HASH}) `,
			'background: #22d3ee; color: #000; font-weight: bold; padding: 4px; border-radius: 4px;'
		);
	}, []);

	return null; // Este componente no renderiza nada visual
};