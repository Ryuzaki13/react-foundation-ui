import { State } from "@ryuzaki13/react-foundation-lib/types";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { CircleAlertIcon, CircleCheckIcon, CircleXIcon, InfoIcon } from "lucide-react";

import styles from "./State.module.scss";
import { STATE_PRESENTATION_NONE } from "./statePresentationConstants";

const STATE_ICON_ERROR = "error";
const STATE_ICON_WARNING = "warning";
const STATE_ICON_SUCCESS = "success";
const STATE_ICON_INFORMATION = "information";

interface StateIconProps {
	state: State;
	text: string;
	className?: string;
}

export function StateIcon({ state = STATE_PRESENTATION_NONE, text, className }: StateIconProps) {
	const renderIcon = () => {
		switch (state) {
			case STATE_ICON_ERROR:
				return <ErrorIcon />;
			case STATE_ICON_WARNING:
				return <WarningIcon />;
			case STATE_ICON_SUCCESS:
				return <SuccessIcon />;
			case STATE_ICON_INFORMATION:
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
}

interface RenderStateIconProps {
	state?: State;
}

export function RenderStateIcon({ state }: RenderStateIconProps) {
	switch (state) {
		case STATE_ICON_ERROR:
			return <ErrorIcon />;
		case STATE_ICON_WARNING:
			return <WarningIcon />;
		case STATE_ICON_SUCCESS:
			return <SuccessIcon />;
		case STATE_ICON_INFORMATION:
			return <InformationIcon />;
		default:
			return null;
	}
}

export function ErrorIcon() {
	return <CircleXIcon className={cn(styles.state, styles.error)} />;
}
export function WarningIcon() {
	return <CircleAlertIcon className={cn(styles.state, styles.warning)} />;
}
export function SuccessIcon() {
	return <CircleCheckIcon className={cn(styles.state, styles.success)} />;
}
export function InformationIcon() {
	return <InfoIcon className={cn(styles.state, styles.information)} />;
}
