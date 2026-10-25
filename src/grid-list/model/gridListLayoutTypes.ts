export type GridListLayoutSnapshot = {
	readonly columnCount: number;
	readonly width: number;
	readonly rowGap: number;
	readonly measurementKey: string;
};

export type GridListLayoutDriver = {
	readonly subscribe: (listener: () => void) => () => void;
	readonly getSnapshot: () => GridListLayoutSnapshot;
	readonly getServerSnapshot: () => GridListLayoutSnapshot;
	readonly attachProbe: (element: HTMLElement | null) => void;
	readonly attachMetricsProbe: (element: HTMLElement | null) => void;
	readonly mount: () => () => void;
	readonly measure: () => void;
};

export type GridListLayout = GridListLayoutSnapshot & {
	readonly attachProbe: (element: HTMLElement | null) => void;
	readonly attachMetricsProbe: (element: HTMLElement | null) => void;
};
