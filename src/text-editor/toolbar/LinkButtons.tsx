import { AtSign, ExternalLink, Link, Phone } from "lucide-react";

import ToolbarStyle from "./Toolbar.module.scss";
import { ToolbarControl } from "./ToolbarControl";
import { LinkTypes } from "./types";

interface LinkButtonsProps {
	disabled: boolean;
	onClick: (type: LinkTypes) => void;
}

/**
 * Набор кнопок для вставки ссылок и связанных сущностей в текстовом редакторе. Используется в составе тулбара редактора.
 */
export function LinkButtons({ disabled, onClick }: LinkButtonsProps) {
	return (
		<div className={ToolbarStyle.groupControls}>
			<ToolbarControl title="Добавить ссылку на статью" icon={<Link />} onClick={() => onClick(LinkTypes.LOCAL_LINK)} />
			<ToolbarControl title="Добавить ссылку" disabled={disabled} icon={<ExternalLink />} onClick={() => onClick(LinkTypes.LINK)} />
			<ToolbarControl title="Добавить телефон" disabled={disabled} icon={<Phone />} onClick={() => onClick(LinkTypes.PHONE)} />
			<ToolbarControl title="Добавить email" disabled={disabled} icon={<AtSign />} onClick={() => onClick(LinkTypes.EMAIL)} />
		</div>
	);
}
