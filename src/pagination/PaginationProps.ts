import { type ComponentPropsWithoutRef } from "react";

/** Управляемая навигация использует номера от единицы; источником данных владеет потребитель. */
export type PaginationProps = Omit<ComponentPropsWithoutRef<"nav">, "children" | "onChange"> & {
	readonly page: number;
	readonly pageCount: number;
	readonly onPageChange: (page: number) => void;
	readonly disabled?: boolean;
};
