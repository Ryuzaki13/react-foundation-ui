import { type PropsWithChildren, type ReactNode, useId, useState } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { FlexSpacer } from "../flex";
import { Separator } from "../separator";
import { UiPanelTone } from "../types";
import uiStyles from "../ui.module.scss";
import { getUiPanelToneClassName } from "../uiClasses";

import styles from "./Disclosure.module.scss";

export interface DisclosureProps extends PropsWithChildren {
	label: ReactNode;
	defaultOpen?: boolean;
	tone?: UiPanelTone;
	/** Независимые действия в правой части заголовка, расположенные вне кнопки раскрытия. */
	headerActions?: ReactNode;
	triggerClassName?: string;
	contentClassName?: string;
}

/**
 * Раскрывающийся блок с заголовком и скрываемым содержимым. Используется для FAQ, настроек и компактного размещения второстепенной информации.
 */
export function Disclosure({
	label,
	defaultOpen,
	headerActions,
	tone = "surface",
	triggerClassName,
	contentClassName,
	children
}: DisclosureProps) {
	const [open, setOpen] = useState(defaultOpen === true);
	const panelId = useId();
	const buttonId = useId();
	const panelTone = getUiPanelToneClassName(tone);

	return (
		<div className={cn(uiStyles.uiElement, uiStyles.uiPanel, panelTone, styles.disclosure)}>
			<div className={styles.disclosureHeader}>
				<button
					id={buttonId}
					type="button"
					aria-expanded={open}
					aria-controls={panelId}
					className={cn(styles.disclosureButton, triggerClassName)}
					data-ui="disclosure-toggle"
					data-action={open ? "collapse-disclosure" : "expand-disclosure"}
					onClick={() => setOpen((prevOpen) => !prevOpen)}>
					{open ? <ChevronUpIcon /> : <ChevronDownIcon />}
					{label}
				</button>
				{headerActions ? (
					<>
						<FlexSpacer />
						{headerActions}
					</>
				) : null}
			</div>

			{open && (
				<>
					<Separator className="marginBlockSm" />
					<div id={panelId} role="region" aria-labelledby={buttonId} className={contentClassName}>
						{children}
					</div>
				</>
			)}
		</div>
	);
}
