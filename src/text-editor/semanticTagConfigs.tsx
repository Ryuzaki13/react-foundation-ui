import { TagTypes } from "./toolbar";

import type { SemanticTagConfig } from "./SemanticDialog";

export const SemanticTagConfigs: Record<TagTypes, SemanticTagConfig> = {
	[TagTypes.abbr]: {
		tagName: "abbr",
		title: "Аббревиатура",
		description: "Обозначает аббревиатуры и сокращения, при наведении покажет расшифровку",
		example: (
			<>
				<abbr title="Национальное управление по аэронавтике и исследованию космического пространства">НАСА</abbr>
				<div className="marginTopMd">
					<code>{`<abbr title="Национальное управление по аэронавтике и исследованию космического пространства">НАСА</abbr>`}</code>
				</div>
			</>
		),
		fields: [
			{
				name: "title",
				label: "Расшифровка",
				description: "Появится как подсказка и будет прочитана скринридером",
				placeholder: "например: HyperText Markup Language",
				required: true
			}
		]
	},
	[TagTypes.lang]: {
		tagName: "span",
		title: "Текст на другом языке",
		description:
			"Указывает язык фрагмента текста, если он отличается от основного языка страницы, скринридер прочитает это слово с французским произношением",
		example: (
			<>
				<span lang="fr">Bonjour!</span> — сказал турист.
				<div className="marginTopMd">
					<code>{`<span lang="fr">Bonjour!</span> — сказал турист.`}</code>
				</div>
			</>
		),
		fields: [
			{
				name: "lang",
				label: "Код языка",
				placeholder: "en, fr, ru",
				required: true,
				validate: (val) => (!/^[a-z]{2,3}(-[A-Z]{2})?$/.test(val) ? "Неверный код языка (например, en или en-US)" : null)
			}
		]
	},
	[TagTypes.time]: {
		tagName: "time",
		title: "Дата/время",
		description: "",
		example: "",
		fields: [
			{
				name: "datetime",
				label: "Дата/время (machine-readable)",
				description: "Формат ISO 8601: 2025-05-18, 14:30, 2025-05-18T14:30",
				placeholder: "например: 2025-05-18T14:30",
				required: true
			}
		]
	},
	[TagTypes.cite]: {
		tagName: "cite",
		title: "Цитата источника",
		description: "Обозначает название книги, статьи, фильма или другого произведения, на которое вы ссылаетесь",
		example: (
			<>
				По словам Эйнштейна: <cite>«Воображение важнее знания»</cite>.
				<div className="marginTopMd">
					<code>{`По словам Эйнштейна: <cite>«Воображение важнее знания»</cite>.`}</code>
				</div>
			</>
		),
		fields: [
			{
				name: "title",
				label: "Название источника",
				description: "Будет отображаться как подсказка",
				placeholder: "например: Википедия",
				required: false
			}
		]
	},
	// [TagTypes.address]: {
	// 	tagName: "address",
	// 	title: "Указывает контакты автора статьи/страницы (не для почтовых адресов компаний!)",
	// 	description: "",
	// 	example: ``,
	// 	fields: [
	// 		{
	// 			name: "aria-label",
	// 			label: "Описание (для доступности)",
	// 			description: "Содержимое будет прочитано скринридером, если адрес не очевиден",
	// 			placeholder: "например: Контактный адрес компании",
	// 			required: false
	// 		}
	// 	]
	// },
	[TagTypes.del]: {
		tagName: "del",
		title: "Изменения в тексте",
		description: "Удаленный фрагмент",
		example: (
			<>
				Проект сдачи: <del>1 июня</del> <ins>15 июня</ins>
				<div className="marginTopMd">
					<code>{`Проект сдачи: <del>1 июня</del> <ins>15 июня</ins>`}</code>
				</div>
			</>
		),
		fields: [
			{
				name: "datetime",
				label: "Когда был удалён",
				description: "Формат ISO 8601: 2025-05-18T14:30",
				placeholder: "например: 2025-05-18T14:30",
				required: false
			},
			{
				name: "cite",
				label: "Источник/обоснование",
				description: "Ссылка на объяснение причины",
				placeholder: "например: https://example.com/edit-log",
				required: false
			}
		]
	},
	[TagTypes.ins]: {
		tagName: "ins",
		title: "Изменения в тексте",
		description: "Новый добавленный текст",
		example: (
			<>
				Проект сдачи: <del>1 июня</del> <ins>15 июня</ins>
				<div className="marginTopMd">
					<code>{`Проект сдачи: <del>1 июня</del> <ins>15 июня</ins>`}</code>
				</div>
			</>
		),
		fields: [
			{
				name: "datetime",
				label: "Когда был добавлен",
				description: "Формат ISO 8601: 2025-05-18T14:30",
				placeholder: "например: 2025-05-18T14:30",
				required: false
			},
			{
				name: "cite",
				label: "Источник/обоснование",
				description: "Ссылка на объяснение причины",
				placeholder: "например: https://example.com/edit-log",
				required: false
			}
		]
	}
};
