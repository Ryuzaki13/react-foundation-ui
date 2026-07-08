import React, { PropsWithChildren, useId, useState } from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import uiStyles from "../ui.module.scss";

import styles from "./Disclosure.module.scss";

export interface DisclosureProps extends PropsWithChildren {
	label: React.ReactNode;
	defaultOpen?: boolean;
}

/**
 * Раскрывающийся блок с заголовком и скрываемым содержимым. Используется для FAQ, настроек и компактного размещения второстепенной информации.
 */
export function Disclosure({ label, defaultOpen, children }: DisclosureProps) {
	const [open, setOpen] = useState(defaultOpen === true);
	const panelId = useId();
	const buttonId = useId();

	return (
		<div className={cn(uiStyles.uiElement, uiStyles.uiPanel, styles.disclosure)}>
			<button
				id={buttonId}
				type="button"
				aria-expanded={open}
				aria-controls={panelId}
				className={cn(styles.disclosureButton, "fontBold radiusSm paddingSm gapSm")}
				data-ui="disclosure-toggle"
				data-action={open ? "collapse-disclosure" : "expand-disclosure"}
				onClick={() => setOpen((prevOpen) => !prevOpen)}>
				{open ? <ChevronUpIcon /> : <ChevronDownIcon />}
				{label}
			</button>

			{open && (
				<div id={panelId} role="region" aria-labelledby={buttonId}>
					<div className={"paddingMd"}>{children}</div>
				</div>
			)}
		</div>
	);
}
