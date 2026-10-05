import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { FlexContainer } from "../flex";

import { type ModalCompositionProps } from "./modalCompositionTypes";

type ModalFooterProps = ModalCompositionProps;

/** Нижние действия не участвуют в прокрутке основного содержимого. */
export function ModalFooter({ children, className }: ModalFooterProps) {
	return (
		<div className={cn("surface2 borderTop paddingBlockSm paddingInlineMd", className)}>
			<FlexContainer gap="sm" align="center" justify="end">
				{children}
			</FlexContainer>
		</div>
	);
}
ModalFooter.displayName = "Modal.Footer";
