import { type ODataCollectionConfig, type ODataCollectionModel, type ODataCollectionSegment } from "@ryuzaki13/react-foundation-api/odata";

/**
 * Параметры поиска клиентов
 */
export type SearchParams = {
	searchTerm: string;
	filters?: Record<string, unknown>;
	top?: number;
	skip?: number;
};

/**
 * Результат поиска клиентов
 */
export type SearchResult<T extends object> = {
	clients: T[];
	totalCount: number;
	hasNextPage: boolean;
};

type BaseSearchConfig<T extends object> = {
	/** Заголовок диалогового окна */
	title: string;

	odata: Omit<ODataCollectionConfig, "limitedKeys">;

	/** Главный ключ, значения которого и будут использоваться в итоговом выборе */
	leadingKey: keyof T;

	/** Текстовый ключ главного ключа, используется для формирования "выбранного ключа" */
	leadingText?: keyof T;

	/** Список ключей, по которым будет отрабатывать фильтрация таблицы */
	searchKeys: (keyof T)[];

	/** Подпись для поля ввода поиска */
	searchLabel?: string;

	/** Список столбцов, которые должны выбираться для формирования таблицы */
	columns: Array<{
		key: keyof T;
		label: string;
		width?: number;
	}>;
};

type SearchConfigWithoutFilters<T extends object> = BaseSearchConfig<T> & {
	segments?: never;
	model?: never;
};

type SearchConfigWithFilters<T extends object> = BaseSearchConfig<T> & {
	segments: Record<string, ODataCollectionSegment>;
	model?: Omit<ODataCollectionModel, "codeKey">;
};

/**
 * Интерфейс конфигурации поиска
 */
export type SearchConfig<T extends object> = SearchConfigWithoutFilters<T> | (SearchConfigWithFilters<T> & {});

/**
 * Интерфейс регистра для конфигураций
 */
export type SearchConfigRegistry = Record<string, SearchConfig<Record<string, string>>>;
