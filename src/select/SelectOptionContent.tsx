import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { HighlightText } from "../text";
import uiStyles from "../ui.module.scss";

interface OptionContentProps {
	label: string;
	code?: string;
	highlight?: string;
}

/**
 * Универсальный рендерер опции. Используется и в single-select, и в multi-select.
 */
export function SelectOptionContent({ label, code, highlight }: OptionContentProps) {
	return (
		<div className={uiStyles.uiOptionBase}>
			<div className={cn(uiStyles.uiOptionText, "flexEllipsis")}>
				<HighlightText text={label} highlight={highlight} />
			</div>
			{code && (
				<div className={uiStyles.uiOptionCode}>
					<HighlightText text={code} highlight={highlight} />
				</div>
			)}
		</div>
	);
}
