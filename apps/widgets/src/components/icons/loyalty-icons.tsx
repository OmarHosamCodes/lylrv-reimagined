/**
 * Loyalty Points icon (chat bubble with sparkle)
 */
export function LoyaltyIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
		>
			<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
		</svg>
	);
}

/**
 * Gift icon for redeem
 */
export function GiftIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
		>
			<path d="M20 7h-4.17a3.001 3.001 0 10-3.83-3.83 3.001 3.001 0 00-3.83 3.83H4a2 2 0 00-2 2v2a1 1 0 001 1h18a1 1 0 001-1V9a2 2 0 00-2-2zM9 5a1 1 0 112 0 1 1 0 01-2 0zm4 0a1 1 0 112 0 1 1 0 01-2 0z" />
			<path d="M3 12v9a2 2 0 002 2h14a2 2 0 002-2v-9H3z" />
		</svg>
	);
}

/**
 * Star icon for earn
 */
export function SparkleIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
		>
			<path d="M12 2l2.4 7.4h7.8l-6.3 4.6 2.4 7.4L12 16.8l-6.3 4.6 2.4-7.4L1.8 9.4h7.8z" />
		</svg>
	);
}

/**
 * History/clock icon
 */
export function HistoryIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
		>
			<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10V7h-2v6l5.25 3.15.75-1.23-4-2.42z" />
		</svg>
	);
}

/**
 * Home icon
 */
export function HomeIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
		>
			<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
		</svg>
	);
}
