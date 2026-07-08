import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { LoadingMessage } from "../../misc";

import styles from "./Tabs.module.scss";

interface TabsLoadingStateProps {
	containerClassName: string;
	tabListClassName: string;
	panelsClassName: string;
	panelClassName: string;
	panelBodyClassName: string;
	loadingText?: string;
}

/**
 * Служебное loading-состояние для `TabsBox`.
 */
export function TabsLoadingState({
	containerClassName,
	tabListClassName,
	panelsClassName,
	panelClassName,
	panelBodyClassName,
	loadingText
}: TabsLoadingStateProps) {
	return (
		<div className={containerClassName}>
			<div className={tabListClassName} aria-hidden="true">
				<button type="button" disabled data-disabled="" className={cn(styles.tab, "skeletonLine")}>
					Загрузка...
				</button>
			</div>
			<div className={panelsClassName} aria-busy="true">
				<div className={panelClassName}>
					<div className={panelBodyClassName}>
						<LoadingMessage text={loadingText} className="radiusSm" />
					</div>
				</div>
			</div>
		</div>
	);
}
