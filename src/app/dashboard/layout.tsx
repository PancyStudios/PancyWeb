"use client";

import { SocketProvider } from '@/context/SocketContext';
import React from 'react';

export default function DashboardLayout({
	                                        children,
                                        }: {
	children: React.ReactNode
}) {
	return (
		<SocketProvider>
			{children}
		</SocketProvider>
	);
}