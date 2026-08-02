import { type ReactElement } from "react";

import { useArgs } from "storybook/preview-api";

export type StoryArgsUpdater<TArgs extends object> = (newArgs: Partial<TArgs>) => void;

/**
 * Создаёт каноническую render-функцию controlled-story.
 *
 * Storybook preview hooks должны вызываться непосредственно во время выполнения
 * story-функции. Поэтому `useArgs` остаётся в возвращаемом render, а визуальный
 * сценарий получает только текущие args и функцию их обновления. Такой render
 * одинаково работает в обычном Canvas, portable stories и составных MDX-документах.
 */
export function createControlledStoryRender<TArgs extends object>(
	render: (args: TArgs, updateArgs: StoryArgsUpdater<TArgs>) => ReactElement
) {
	return function ControlledStoryRender(args: TArgs) {
		const [, updateArgs] = useArgs();

		return render(args, updateArgs);
	};
}
