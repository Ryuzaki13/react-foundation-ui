import { Placement } from "@floating-ui/react";
import { useCopyElementTextWithFeedback } from "@ryuzaki13/react-foundation-lib/copy";
import { CheckCheckIcon, CopyIcon } from "lucide-react";

import { FloatingPopover } from "../popover";

interface CopyTextWrapperProps {
	children: React.ReactNode;
	position?: Placement;
	showOnHover?: boolean;
	className?: string;
}

export function CopyTextWrapper({ children, position = "top", showOnHover = true, className }: CopyTextWrapperProps) {
	const { containerRef, copyElementText, isCopied } = useCopyElementTextWithFeedback<HTMLSpanElement>();
	const label = isCopied ? "Скопировано!" : "Копировать текст";

	return (
		<span ref={containerRef} className={className}>
			{children}
			<FloatingPopover openOnHover={showOnHover} placement={position} content={label}>
				<button onClick={copyElementText} aria-label={label}>
					{isCopied ? <CheckCheckIcon className="block statusSuccess" /> : <CopyIcon className="block statusInfo" />}
				</button>
			</FloatingPopover>
		</span>
	);
}
