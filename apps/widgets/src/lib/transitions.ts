/**
 * Shared transition presets for consistent animation feel across all widgets.
 * Uses spring physics for natural, premium-feeling motion.
 */

export const transitions = {
	/** Default spring — balanced, smooth */
	spring: {
		type: "spring" as const,
		stiffness: 300,
		damping: 26,
	},
	/** Bouncy spring — playful, rewarding */
	springBouncy: {
		type: "spring" as const,
		stiffness: 400,
		damping: 15,
	},
	/** Stiff spring — snappy, responsive */
	springStiff: {
		type: "spring" as const,
		stiffness: 600,
		damping: 35,
	},
	/** Gentle spring — soft, subtle */
	springGentle: {
		type: "spring" as const,
		stiffness: 200,
		damping: 20,
	},
	/** Smooth tween — elegant, polished */
	smooth: {
		type: "tween" as const,
		duration: 0.35,
		ease: [0.25, 0.1, 0.25, 1] as const,
	},
	/** Snappy tween — instant feedback */
	snappy: {
		type: "tween" as const,
		duration: 0.15,
		ease: [0.25, 0.1, 0.25, 1] as const,
	},
	/** Slow reveal — dramatic entrance */
	slowReveal: {
		type: "tween" as const,
		duration: 0.6,
		ease: [0.22, 1, 0.36, 1] as const,
	},
} as const;

/** Stagger container variants for list animations */
export const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.06,
			delayChildren: 0.1,
		},
	},
};

/** Item variants for staggered lists */
export const staggerItem = {
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: transitions.spring,
	},
};

/** Fade-in-up entrance */
export const fadeInUp = {
	hidden: { opacity: 0, y: 16 },
	visible: {
		opacity: 1,
		y: 0,
		transition: transitions.spring,
	},
};

/** Scale-in entrance */
export const scaleIn = {
	hidden: { opacity: 0, scale: 0.92 },
	visible: {
		opacity: 1,
		scale: 1,
		transition: transitions.spring,
	},
};

/** Slide in from left */
export const slideInLeft = {
	hidden: { opacity: 0, x: -20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: transitions.spring,
	},
};

/** Slide in from right */
export const slideInRight = {
	hidden: { opacity: 0, x: 20 },
	visible: {
		opacity: 1,
		x: 0,
		transition: transitions.spring,
	},
};
