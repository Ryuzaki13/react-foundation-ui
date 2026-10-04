/** Внешний запрос и локальный черновик имеют разные жизненные циклы до подтверждения поиска. */
export type InputSearchState = Readonly<{
	externalValue: string | undefined;
	searchTerm: string;
	previousSearch: string;
}>;
