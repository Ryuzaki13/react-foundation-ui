import { createContext, CSSProperties, FC, ReactNode, useContext } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import styles from "./Detail.module.scss";

export type DetailType = "detail" | "list";

export interface DetailContextType {
	semantic?: DetailType;
	inline?: boolean;
	center?: boolean;
	vertical?: "start" | "center" | "end";
	noWrap?: boolean;
	withColon?: boolean;
}

const DetailContext = createContext<DetailContextType>({});

export interface DetailItemProps {
	label: ReactNode;
	value: ReactNode;
	withColon?: boolean;
	required?: boolean;
}

function Item({ label, value, withColon, required }: DetailItemProps) {
	const { semantic, inline, noWrap, center, vertical = "center", withColon: withColonParent = true } = useContext(DetailContext);
	const detailClass = cn(styles.detail, center && styles.textCenter, inline && styles.inline, noWrap && styles.noWrap, styles[vertical]);

	const labelContent = (
		<>
			{label}
			{required && <span className="statusError">*</span>}
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

export interface DetailProps {
	columnCount?: number;
	rowGap?: "none" | "small" | "normal" | "large";
	children: ReactNode;
	className?: string;

	semantic?: DetailType;
	inline?: boolean;
	center?: boolean;
	vertical?: "start" | "center" | "end";
	noWrap?: boolean;
	withColon?: boolean;
}

export interface DetailComponent extends FC<DetailProps> {
	Item: FC<DetailItemProps>;
}

/**
 * Компонент для вывода пар «заголовок-значение» в одну или несколько колонок. Подходит для карточек сущностей, сводок и страниц просмотра.
 */
export const Detail: DetailComponent = ({ children, columnCount = 1, rowGap = "none", semantic = "list", className, ...itemProps }) => {
	const classes = cn(styles.detailList, styles[rowGap], className);
	const style = { columnCount: Math.min(5, Math.max(1, columnCount)) } as CSSProperties;
	const content =
		semantic === "detail" ? (
			<dl className={classes} style={style}>
				{children}
			</dl>
		) : (
			<ul className={classes} style={style}>
				{children}
			</ul>
		);

	return <DetailContext.Provider value={{ ...itemProps, semantic }}>{content}</DetailContext.Provider>;
};

Detail.Item = Item;
