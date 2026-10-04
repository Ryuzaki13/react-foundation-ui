import { type BaseInputProps } from "../input";

/** Существующий контракт поиска: onChange сообщает только подтверждённый запрос. */
export type SearchInputProps = Readonly<BaseInputProps<string>>;
