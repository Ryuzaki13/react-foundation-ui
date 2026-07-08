import { useEffect, type ErrorInfo, type ReactNode } from "react";

import {
	disableThreeSceneForSession,
	threeSceneDefaultDisabledStorageKey,
	useThreeSceneAvailability,
	type ThreeSceneAvailability,
	type ThreeSceneWebGLVersion
} from "@ryuzaki13/react-foundation-lib/three-scene";

import { ThreeSceneErrorBoundary } from "./ThreeSceneErrorBoundary";

export type ThreeSceneGuardProps = {
	readonly children: ReactNode;
	readonly fallback: ReactNode;
	readonly disabledStorageKey?: string;
	readonly disableWhenReducedMotion?: boolean;
	readonly webGLVersion?: ThreeSceneWebGLVersion;
	readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
	readonly onAvailabilityChange?: (availability: ThreeSceneAvailability) => void;
};

export function ThreeSceneGuard({
	children,
	fallback,
	disabledStorageKey = threeSceneDefaultDisabledStorageKey,
	disableWhenReducedMotion,
	webGLVersion,
	onError,
	onAvailabilityChange
}: ThreeSceneGuardProps) {
	const availability = useThreeSceneAvailability({
		disabledStorageKey,
		disableWhenReducedMotion,
		webGLVersion
	});

	useEffect(() => {
		onAvailabilityChange?.(availability);
	}, [availability, onAvailabilityChange]);

	if (availability.status !== "available") {
		return fallback;
	}

	return (
		<ThreeSceneErrorBoundary
			fallback={fallback}
			onError={(error, errorInfo) => {
				disableThreeSceneForSession(disabledStorageKey);
				onError?.(error, errorInfo);
			}}>
			{children}
		</ThreeSceneErrorBoundary>
	);
}
