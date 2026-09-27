import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Scrollable } from "../misc";

import { type ModalCompositionProps } from "./modalCompositionTypes";

type ModalContentProps = ModalCompositionProps & { scrollable?: boolean };

/** Основная область; optional Scrollable остаётся внутренним scroll host модалки. */
export function ModalContent({ children, className, scrollable }: ModalContentProps) {
	return (
		<div className={cn("paddingMd h100 overflowHidden", className)}>
			{scrollable ? <Scrollable className="h100">{children}</Scrollable> : children}
		</div>
	);
}
ModalContent.displayName = "Modal.Content";
