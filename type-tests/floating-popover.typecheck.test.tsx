import { createRef, type ReactNode } from "react";

import { FloatingPopover, type FloatingPopoverProps } from "../src/popover";

type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type Expect<Value extends true> = Value;

const triggerRef = createRef<HTMLButtonElement>();
const nativeTrigger = (
	<FloatingPopover asChild tooltip content="Описание действия">
		<button type="button" ref={triggerRef} onClick={(event) => event.currentTarget.focus()} />
	</FloatingPopover>
);
const wrappedText = <FloatingPopover content="Описание">Текст trigger</FloatingPopover>;
const wrappedNodes = (
	<FloatingPopover asChild={false} content="Описание">
		Текст
		<span />
	</FloatingPopover>
);
const childProps = {
	asChild: true,
	content: "Описание",
	children: <button type="button" />
} satisfies FloatingPopoverProps;
declare const asChild: boolean;
const conditionalTrigger = (
	<FloatingPopover asChild={asChild} content="Описание">
		<button type="button" />
	</FloatingPopover>
);

void nativeTrigger;
void wrappedText;
void wrappedNodes;
void childProps;
void conditionalTrigger;

/** Режим без wrapper имеет точный контракт единственного ReactElement. */
export type FloatingPopoverAsChildRejectsTextContract = Expect<
	Equal<{ asChild: true; content: ReactNode; children: string } extends FloatingPopoverProps ? true : false, false>
>;
export type FloatingPopoverAsChildRejectsMultipleChildrenContract = Expect<
	Equal<{ asChild: true; content: ReactNode; children: readonly ReactNode[] } extends FloatingPopoverProps ? true : false, false>
>;
export type FloatingPopoverWrappedAcceptsNodesContract = Expect<
	Equal<{ content: ReactNode; children: ReactNode } extends FloatingPopoverProps ? true : false, true>
>;
