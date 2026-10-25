import { observeElementResize } from "@ryuzaki13/react-foundation-lib/dom";

import { type GridListLayoutDriver, type GridListLayoutSnapshot } from "./gridListLayoutTypes";

/**
 * CSS сам разрешает rem/em/calc/var и scrollbar в невидимой сетке полной ширины.
 * Читаем готовые tracks после commit вместо второго, приблизительного CSS parser.
 * Снимок сервера не зависит от DOM и совпадает с началом hydration.
 */
export function createGridListLayoutDriver(): GridListLayoutDriver {
	const serverSnapshot: GridListLayoutSnapshot = Object.freeze({ columnCount: 1, width: 0, rowGap: 0, measurementKey: "server" });
	let snapshot = serverSnapshot;
	let probe: HTMLElement | null = null;
	let metricsProbe: HTMLElement | null = null;
	let mounted = false;
	let disconnect: (() => void) | undefined;
	let disconnectMetrics: (() => void) | undefined;
	let frame: { readonly view: Window; readonly id: number } | null = null;
	const listeners = new Set<() => void>();

	function measure(): void {
		if (!mounted || probe === null) return;
		const style = probe.ownerDocument.defaultView?.getComputedStyle(probe);
		if (style === undefined) return;
		// auto-fill сохраняет все tracks даже без детей; computed style раскрывает их в px.
		const tracks = style.gridTemplateColumns;
		const columnCount = !tracks || tracks === "none" ? 1 : tracks.trim().split(/\s+/).length;
		const width = probe.getBoundingClientRect().width;
		const parsedGap = Number.parseFloat(style.rowGap);
		const rowGap = Number.isFinite(parsedGap) ? parsedGap : 0;
		const metrics = metricsProbe?.getBoundingClientRect();
		const measurementKey = `${width}:${columnCount}:${rowGap}:${metrics?.width ?? 0}:${metrics?.height ?? 0}`;
		if (snapshot.measurementKey === measurementKey) return;
		snapshot = Object.freeze({ columnCount, width, rowGap, measurementKey });
		for (const listener of listeners) listener();
	}

	function scheduleMeasure(): void {
		const view = probe?.ownerDocument.defaultView;
		if (!mounted || view == null || frame !== null) return;
		// Перепаковка меняет наблюдаемые CSS-ряды. Переносим её из текущей
		// ResizeObserver delivery, иначе браузер откладывает новые уведомления
		// с ошибкой цикла; один frame объединяет resize контейнера и CSS-сенсора.
		frame = {
			view,
			id: view.requestAnimationFrame(() => {
				frame = null;
				measure();
			})
		};
	}

	return {
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
		getSnapshot: () => snapshot,
		getServerSnapshot: () => serverSnapshot,
		attachProbe: (element) => {
			disconnect?.();
			probe = element;
			disconnect = mounted && element !== null ? observeElementResize(element, scheduleMeasure) : undefined;
			measure();
		},
		attachMetricsProbe: (element) => {
			disconnectMetrics?.();
			metricsProbe = element;
			disconnectMetrics = mounted && element !== null ? observeElementResize(element, scheduleMeasure) : undefined;
			measure();
		},
		mount: () => {
			mounted = true;
			if (probe !== null) disconnect = observeElementResize(probe, scheduleMeasure);
			if (metricsProbe !== null) disconnectMetrics = observeElementResize(metricsProbe, scheduleMeasure);
			measure();
			return () => {
				mounted = false;
				disconnect?.();
				disconnectMetrics?.();
				disconnect = undefined;
				disconnectMetrics = undefined;
				if (frame !== null) frame.view.cancelAnimationFrame(frame.id);
				frame = null;
			};
		},
		measure
	};
}
