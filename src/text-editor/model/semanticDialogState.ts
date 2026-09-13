/** Начальные данные одной semantic dialog-session; не содержат mutable Lexical nodes. */
export type SemanticDialogState = {
	readonly text: string;
	readonly attributes: Record<string, string>;
};
