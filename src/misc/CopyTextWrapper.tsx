import { Placement } from "@floating-ui/react";
import { CheckCheckIcon, CopyIcon } from "lucide-react";

import { useCopyElementTextWithFeedback } from "@ryuzaki13/react-foundation-lib/copy";

import { FloatingPopover } from "../popover";

interface CopyTextWrapperProps {
	children: React.ReactNode;
	position?: Placement;
	showOnHover?: boolean;
	className?: string;
}

export const CopyTextWrapper: React.FC<CopyTextWrapperProps> = ({ children, position = "top", showOnHover = true, className }) => {
	const { containerRef, copyElementText, isCopied } = useCopyElementTextWithFeedback<HTMLSpanElement>();

	return (
		<span ref={containerRef} className={className}>
			{children}
			<FloatingPopover openOnHover={showOnHover} placement={position} content={isCopied ? "Скопировано!" : "Копировать текст"}>
				<button onClick={copyElementText} aria-label={isCopied ? "Скопировано!" : "Копировать текст"}>
					{isCopied ? <CheckCheckIcon className="block statusSuccess" /> : <CopyIcon className="block statusInfo" />}
				</button>
			</FloatingPopover>
		</span>
	);
};
