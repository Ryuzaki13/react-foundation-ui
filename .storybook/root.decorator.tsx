import { useEffect } from "react";

import { applyDocumentTheme, AtomicStoryCanvas, resolveStoredTheme } from "./story-canvas";

import type { Decorator } from "@storybook/react-vite";

/**
 * Применяет единый контекст темы ко всем stories и восстанавливает атомарный
 * canvas для stories, которые явно объявляют параметр `atomicCanvas`.
 */
export const RootDecorator: Decorator = (Story, context) => {
	useEffect(() => {
		applyDocumentTheme(resolveStoredTheme());
		document.body.style.height = "auto";
		document.body.style.overflow = "auto";
	}, []);

	if (context.parameters.atomicCanvas === true) {
		return (
			<AtomicStoryCanvas layout={context.parameters.layout} viewMode={context.viewMode}>
				<Story />
			</AtomicStoryCanvas>
		);
	}

	return <Story />;
};
