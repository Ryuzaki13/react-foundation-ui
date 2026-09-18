import { type ReactNode, useContext } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./Detail.module.scss";
import { DetailContext } from "./DetailContext";

export interface DetailItemProps {
	label: ReactNode;
	value: ReactNode;
	withColon?: boolean;
	required?: boolean;
}

export function DetailItem({ label, value, withColon, required }: DetailItemProps) {
	const { semantic, inline, noWrap, center, vertical = "center", withColon: withColonParent = true } = useContext(DetailContext);
	const detailClass = cn(styles.detail, center && styles.textCenter, inline && styles.inline, noWrap && styles.noWrap, styles[vertical]);

	const labelContent = (
		<>
			{label}
			{required ? (
				<>
					<span className="statusError" aria-hidden="true">
						*
					</span>
					<span className="visuallyHidden"> (Обязательное поле)</span>
				</>
			) : null}
			{(typeof withColon === "boolean" ? withColon : withColonParent) && ":"}
		</>
	);

	switch (semantic) {
		case "detail":
			return (
				<div className={detailClass}>
					<dt className={styles.dt}>{labelContent}</dt>
					<dd className={styles.dd}>{value}</dd>
				</div>
			);

		case "list":
			return (
				<li className={detailClass}>
					<div className={styles.dt}>{labelContent}</div>
					<div className={styles.dd}>{value}</div>
				</li>
			);

		default:
			return (
				<div className={detailClass}>
					<div className={styles.dt}>{labelContent}</div>
					<div className={styles.dd}>{value}</div>
				</div>
			);
	}
}
