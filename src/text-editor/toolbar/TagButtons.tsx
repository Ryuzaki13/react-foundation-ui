import { BookType, Clock, Languages, MessageSquareQuote, PictureInPicture, Shredder } from "lucide-react";

import ToolbarStyle from "./Toolbar.module.scss";
import { ToolbarControl } from "./ToolbarControl";
import { TagTypes } from "./types";

interface TagButtonsProps {
	onClick: (type: TagTypes) => void;
}

/**
 * Переиспользуемый компонент `TagButtons` из раздела `toolbar`. Инкапсулирует общую логику отображения и взаимодействия, чтобы интерфейс оставался консистентным.
 */
export function TagButtons({ onClick }: TagButtonsProps) {
	return (
		<div className={ToolbarStyle.groupControls}>
			<ToolbarControl title="Вставить Аббревиатуру" icon={<BookType />} onClick={() => onClick(TagTypes.abbr)} />
			<ToolbarControl title="Вставить Код языка" icon={<Languages />} onClick={() => onClick(TagTypes.lang)} />
			<ToolbarControl title="Вставить Дату/время" icon={<Clock />} onClick={() => onClick(TagTypes.time)} />
			<ToolbarControl title="Вставить Ссылку на источник" icon={<MessageSquareQuote />} onClick={() => onClick(TagTypes.cite)} />
			<ToolbarControl title="Вставить Удалённый фрагмент" icon={<Shredder />} onClick={() => onClick(TagTypes.del)} />
			<ToolbarControl title="Вставить Добавленный фрагмент" icon={<PictureInPicture />} onClick={() => onClick(TagTypes.ins)} />
		</div>
	);
}
