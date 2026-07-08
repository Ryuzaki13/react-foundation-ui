import { NoData } from "../../misc";

interface TabsNoDataStateProps {
	containerClassName: string;
	panelsClassName: string;
	panelClassName: string;
	panelBodyClassName: string;
}

/**
 * Служебное empty-состояние для `TabsBox`.
 */
export function TabsNoDataState({ containerClassName, panelsClassName, panelClassName, panelBodyClassName }: TabsNoDataStateProps) {
	return (
		<div className={containerClassName}>
			<div className={panelsClassName}>
				<div className={panelClassName}>
					<div className={panelBodyClassName}>
						<NoData className="radiusSm" />
					</div>
				</div>
			</div>
		</div>
	);
}
