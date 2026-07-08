import { ComponentProps, ComponentType } from "react";

import { Placement } from "@floating-ui/react";
import { normalizeTextWithFallback } from "@ryuzaki13/react-foundation-lib/formatters";

import { FloatingPopover } from "../popover";

// Базовые пропсы которые всегда будут
interface BaseTextOverflowProps {
	children: string;
	maxChar?: number;
	/**
	 * Максимальная ширина тултипа в em.
	 */
	maxWidth?: number;
	placement?: Placement;
	closeDelay?: number;
	/**
	 * Для работы text-overflow элемент обязан быть блочным или inline-block.
	 * Если в качестве обёртки передается инлайновый компонент, то он будет
	 * перезаписан через стили на display: block или inline-block в зависимости
	 * от установки данного пропса.
	 */
	block?: true;
	state?: "information" | "error" | "warning" | "success" | "negative";
}

// Базовые пропсы которые должен принимать textWrap компонент
interface RequiredWrapperProps {
	style?: React.CSSProperties;
	className?: string;
	children: string;
}

// Дженерик для пропсов которые зависят от textWrap компонента
interface TextOverflowProps<
	T extends ComponentType<RequiredWrapperProps> = ComponentType<RequiredWrapperProps>
> extends BaseTextOverflowProps {
	textWrap?: T;
	textWrapProps?: Omit<ComponentProps<T>, "children">;
}

export function TextOverflow<T extends ComponentType<RequiredWrapperProps>>({
	maxChar,
	placement = "left",
	closeDelay = 0,
	maxWidth,
	children,
	block,
	state,
	textWrap,
	textWrapProps
}: TextOverflowProps<T>) {
	const textContent = normalizeTextWithFallback(children);
	if (!textContent.length || (maxChar && textContent.length < maxChar)) return <span>{textContent}</span>;

	const TextWrapper = textWrap ?? "div";

	const baseWrapperProps = {
		style: { display: block ? "block" : "inline-block", width: maxChar ? `${maxChar - 3}ch` : "auto" },
		className: "textOverflow"
	};

	// Правильный порядок слияния: baseWrapperProps приоритетнее
	const mergedProps = {
		...textWrapProps,
		...baseWrapperProps,
		style: {
			...textWrapProps?.style,
			...baseWrapperProps.style // width приоритетнее
		},
		className: [textWrapProps?.className, baseWrapperProps.className].filter(Boolean).join(" ")
	};

	return (
		<FloatingPopover state={state} placement={placement} openOnHover content={textContent} closeDelay={closeDelay} maxWidth={maxWidth}>
			<TextWrapper {...mergedProps}>{textContent}</TextWrapper>
		</FloatingPopover>
	);
}
