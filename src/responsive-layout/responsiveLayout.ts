import {
	type Breakpoint,
	isResponsiveMap,
	resolveProps,
	resolveResponsiveValue,
	type ResponsiveValue,
	type ResolvedProps
} from "@ryuzaki13/react-foundation-lib/media";

/**
 * Порядок используется только для формирования стабильного SSR markup.
 * Фактический активный breakpoint выбирает CSS до запуска React hydration.
 */
export const RESPONSIVE_LAYOUT_BREAKPOINTS = ["mobile", "tablet", "laptop"] as const satisfies readonly Breakpoint[];

export type ResponsiveLayoutValues<T> = Readonly<Record<Breakpoint, T | undefined>>;

/** Проверяет, содержит ли набор layout-пропсов хотя бы одну responsive map. */
export function hasResponsiveLayoutValue(values: readonly unknown[]): boolean {
	return values.some((value) => value !== undefined && isResponsiveMap(value as ResponsiveValue<unknown>));
}

/**
 * Разворачивает layout-пропсы сразу для всех viewport breakpoint.
 * Функция не читает browser API, поэтому сервер и первый клиентский render получают одинаковый результат.
 */
export function resolveLayoutPropsForBreakpoints<T extends object>(
	props: T,
	responsiveKeys: readonly (keyof T)[]
): Readonly<Record<Breakpoint, ResolvedProps<T>>> {
	return {
		mobile: resolveProps(props, "mobile", responsiveKeys),
		tablet: resolveProps(props, "tablet", responsiveKeys),
		laptop: resolveProps(props, "laptop", responsiveKeys)
	};
}

/** Разворачивает одно CSS-значение во все breakpoint с сохранением действующей fallback-семантики. */
export function resolveLayoutValueForBreakpoints<T>(value: ResponsiveValue<T> | undefined): ResponsiveLayoutValues<T> {
	return {
		mobile: resolveResponsiveValue(value, "mobile"),
		tablet: resolveResponsiveValue(value, "tablet"),
		laptop: resolveResponsiveValue(value, "laptop")
	};
}
