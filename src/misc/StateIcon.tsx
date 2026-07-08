import React from "react";

import { State } from "@ryuzaki13/react-foundation-lib/types";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, InfoIcon } from "lucide-react";

import styles from "./State.module.scss";

interface StateIconProps {
	state: State;
	text: string;
	className?: string;
}

export const StateIcon: React.FC<StateIconProps> = ({ state = "none", text, className }) => {
	const renderIcon = () => {
		switch (state) {
			case "error":
				return <ErrorIcon />;
			case "warning":
				return <WarningIcon />;
			case "success":
				return <SuccessIcon />;
			case "information":
				return <InformationIcon />;
			default:
				return null;
		}
	};

	return (
		<div className={cn("flexCenter gapSm", className)}>
			{renderIcon()}
			{text}
		</div>
	);
};

interface RenderStateIconProps {
	state?: State;
}

export const RenderStateIcon: React.FC<RenderStateIconProps> = ({ state }) => {
	switch (state) {
		case "error":
			return <ErrorIcon />;
		case "warning":
			return <WarningIcon />;
		case "success":
			return <SuccessIcon />;
		case "information":
			return <InformationIcon />;
		default:
			return null;
	}
};

export const ErrorIcon = () => {
	return <CircleXIcon className={cn(styles.state, styles.error)} />;
};
export const WarningIcon = () => {
	return <CircleAlertIcon className={cn(styles.state, styles.warning)} />;
};
export const SuccessIcon = () => {
	return <CircleCheckIcon className={cn(styles.state, styles.success)} />;
};
export const InformationIcon = () => {
	return <InfoIcon className={cn(styles.state, styles.information)} />;
};
