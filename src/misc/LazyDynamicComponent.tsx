import { Suspense, useSyncExternalStore, type ComponentType, type ReactNode } from "react";

import { useLazyComponent } from "@ryuzaki13/react-foundation-lib/hooks";

import { LoadingMessage } from "./LoadingMessage";

type LazyDynamicComponentProps<T extends object> = {
	importFunc: () => Promise<Record<string, ComponentType<T>> | null>;
	componentName: string;
	cacheKey?: string;
	clientOnly?: boolean;
	fallback?: ReactNode;
	props?: T;
};

const subscribeClientOnlyMount = (onStoreChange: () => void) => {
	onStoreChange();

	return () => undefined;
};

const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Компонент ленивой загрузки динамически импортируемого React-компонента. Позволяет отложить загрузку тяжелых частей интерфейса до момента использования.
 */
export function LazyDynamicComponent<T extends object>({
	fallback,
	importFunc,
	componentName,
	clientOnly = false,
	cacheKey,
	props
}: LazyDynamicComponentProps<T>) {
	const Component = useLazyComponent(importFunc, componentName, cacheKey);
	const isClient = useSyncExternalStore(subscribeClientOnlyMount, getClientSnapshot, getServerSnapshot);

	const fallbackNode = fallback ?? <LoadingMessage text="Ожидание компонента..." />;

	// Client-only режим нужен для браузерных модулей, которые нельзя даже пытаться импортировать во время SSR.
	if (clientOnly && !isClient) return fallbackNode;

	return (
		<Suspense fallback={fallbackNode}>
			{/* eslint-disable-next-line react-hooks/static-components */}
			<Component {...(props ?? ({} as T))} />
		</Suspense>
	);
}
