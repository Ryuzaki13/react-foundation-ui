import { TabsBox } from "./TabsBox";

import type { TabsBoxItem, TabsBoxProps } from "../model/types";

/**
 * Элемент вкладки для устаревшего совместимого API `Tabs`.
 */
export type TabsItem = TabsBoxItem;

/**
 * @deprecated Используйте `TabsBox` для простого сценария и `TabsLayout` для составных layout-сценариев.
 */
export interface TabsProps extends TabsBoxProps {
	onChange?: (value: string) => void;
}

/**
 * @deprecated Используйте `TabsBox` для простого сценария и `TabsLayout` для составных layout-сценариев.
 */
export function Tabs({ onChange, onValueChange, ...props }: TabsProps) {
	return (
		<TabsBox
			{...props}
			onValueChange={(nextValue) => {
				onValueChange?.(nextValue);
				onChange?.(nextValue);
			}}
		/>
	);
}
