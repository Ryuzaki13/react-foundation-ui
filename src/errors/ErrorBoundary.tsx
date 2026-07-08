import React, { Component } from "react";

import { captureRuntimeErrorReport } from "@ryuzaki13/react-foundation-lib/error-report";

import { ErrorDisplay } from "./ErrorDisplay";

interface ErrorBoundaryProps {
	children: React.ReactNode;
	customComponent?: React.ComponentType<{ error: Error }>;
}

type ErrorBoundaryState = {
	error: Error | null;
	componentStack?: string;
	draftId?: string | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error) {
		return { error };
	}

	componentDidUpdate(prevProps: ErrorBoundaryProps) {
		// Сбрасываем ошибку при изменении children
		if (this.state.error && prevProps.children !== this.props.children) {
			this.setState({ error: null, componentStack: undefined, draftId: undefined });
		}
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		this.setState({ componentStack: errorInfo.componentStack ?? undefined, draftId: null });

		captureRuntimeErrorReport(error, {
			category: "react",
			componentStack: errorInfo.componentStack ?? undefined
		}).then((draft) => {
			if (draft && this.state.error === error) {
				this.setState({ draftId: draft.reportId });
			}
		});
	}

	render() {
		if (this.state.error) {
			const CustomComponent = this.props.customComponent;
			return CustomComponent ? (
				<CustomComponent error={this.state.error} />
			) : (
				<ErrorDisplay error={this.state.error} componentStack={this.state.componentStack} draftId={this.state.draftId} />
			);
		}

		return this.props.children;
	}
}
