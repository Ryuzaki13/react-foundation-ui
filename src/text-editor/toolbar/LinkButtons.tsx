import { AtSign, ExternalLink, Link, Phone } from "lucide-react";

import ToolbarStyle from "./Toolbar.module.scss";
import { ToolbarControl } from "./ToolbarControl";
import { LinkTypes } from "./types";

interface LinkButtonsProps {
	linkTypes?: readonly LinkTypes[];
	disabled: boolean;
	/** Предметная ссылка допускает вставку без выделения, но не в readOnly. */
	disabledLocalLink?: boolean;
	onClick: (type: LinkTypes) => void;
}

/**
 * Набор кнопок для вставки ссылок и связанных сущностей в текстовом редакторе. Используется в составе тулбара редактора.
 */
export function LinkButtons({ disabled, disabledLocalLink, onClick, linkTypes }: LinkButtonsProps) {
	return (
		<div className={ToolbarStyle.groupControls}>
			{(!linkTypes || linkTypes.includes(LinkTypes.LOCAL_LINK)) && (
				<ToolbarControl
					style={LinkTypes.LOCAL_LINK}
					disabled={disabledLocalLink}
					title="Добавить ссылку на статью"
					icon={<Link />}
					onClick={() => onClick(LinkTypes.LOCAL_LINK)}
				/>
			)}
			{(!linkTypes || linkTypes.includes(LinkTypes.LINK)) && (
				<ToolbarControl
					style={LinkTypes.LINK}
					title="Добавить ссылку"
					disabled={disabled}
					icon={<ExternalLink />}
					onClick={() => onClick(LinkTypes.LINK)}
				/>
			)}
			{(!linkTypes || linkTypes.includes(LinkTypes.PHONE)) && (
				<ToolbarControl title="Добавить телефон" disabled={disabled} icon={<Phone />} onClick={() => onClick(LinkTypes.PHONE)} />
			)}
			{(!linkTypes || linkTypes.includes(LinkTypes.EMAIL)) && (
				<ToolbarControl title="Добавить email" disabled={disabled} icon={<AtSign />} onClick={() => onClick(LinkTypes.EMAIL)} />
			)}
		</div>
	);
}
