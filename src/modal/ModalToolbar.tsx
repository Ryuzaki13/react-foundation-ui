import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { type ModalCompositionProps } from "./modalCompositionTypes";

type ModalToolbarProps = ModalCompositionProps;

/** Непрокручиваемые команды над содержимым Modal. */
export function ModalToolbar({ children, className }: ModalToolbarProps) {
	return <div className={cn("surface2 paddingMd borderBottom", className)}>{children}</div>;
}
ModalToolbar.displayName = "Modal.Toolbar";
