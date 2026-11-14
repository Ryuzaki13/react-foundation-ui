import {
	type Breakpoint,
	isResponsiveMap,
	resolveProps,
	resolveResponsiveValue,
	type ResponsiveValue,
	type ResolvedProps
} from "@ryuzaki13/react-foundation-lib/media";

const LAYOUT_BREAKPOINT_MOBILE = "mobile";
const LAYOUT_BREAKPOINT_TABLET = "tablet";
export const LAYOUT_BREAKPOINT_LAPTOP = "laptop";

/**
 * Порядок используется только для формирования стабильного SSR markup.
 * Фактический активный breakpoint выбирает CSS до запуска React hydration.
 */
export const RESPONSIVE_LAYOUT_BREAKPOINTS = [
	LAYOUT_BREAKPOINT_MOBILE,
	LAYOUT_BREAKPOINT_TABLET,
	LAYOUT_BREAKPOINT_LAPTOP
] as const satisfies readonly Breakpoint[];

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
		[LAYOUT_BREAKPOINT_MOBILE]: resolveProps(props, LAYOUT_BREAKPOINT_MOBILE, responsiveKeys),
		[LAYOUT_BREAKPOINT_TABLET]: resolveProps(props, LAYOUT_BREAKPOINT_TABLET, responsiveKeys),
		[LAYOUT_BREAKPOINT_LAPTOP]: resolveProps(props, LAYOUT_BREAKPOINT_LAPTOP, responsiveKeys)
	};
}

/** Разворачивает одно CSS-значение во все breakpoint с сохранением действующей fallback-семантики. */
export function resolveLayoutValueForBreakpoints<T>(value: ResponsiveValue<T> | undefined): ResponsiveLayoutValues<T> {
	return {
		[LAYOUT_BREAKPOINT_MOBILE]: resolveResponsiveValue(value, LAYOUT_BREAKPOINT_MOBILE),
		[LAYOUT_BREAKPOINT_TABLET]: resolveResponsiveValue(value, LAYOUT_BREAKPOINT_TABLET),
		[LAYOUT_BREAKPOINT_LAPTOP]: resolveResponsiveValue(value, LAYOUT_BREAKPOINT_LAPTOP)
	};
}
