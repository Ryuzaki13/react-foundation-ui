import { Component, type ErrorInfo, type ReactNode } from "react";

export type ThreeSceneErrorBoundaryProps = {
	readonly children: ReactNode;
	readonly fallback: ReactNode;
	readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ThreeSceneErrorBoundaryState = {
	readonly hasError: boolean;
};

export class ThreeSceneErrorBoundary extends Component<ThreeSceneErrorBoundaryProps, ThreeSceneErrorBoundaryState> {
	public state: ThreeSceneErrorBoundaryState = {
		hasError: false
	};

	public static getDerivedStateFromError(): ThreeSceneErrorBoundaryState {
		return {
			hasError: true
		};
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.props.onError?.(error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return this.props.fallback;
		}

		return this.props.children;
	}
}
