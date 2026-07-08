import React, { Children, PropsWithChildren, ReactNode } from "react";

import { childrenCount } from "@ryuzaki13/react-foundation-lib/utils";

import { Flex, FlexSpacer } from "../flex";
import { Grid } from "../grid";

export const ToolbarStart: React.FC<PropsWithChildren> = ({ children }) => <>{children}</>;
ToolbarStart.displayName = "Toolbar.Start";

export const ToolbarEnd: React.FC<PropsWithChildren> = ({ children }) => <>{children}</>;
ToolbarEnd.displayName = "Toolbar.End";

type ToolbarStartElement = React.ReactElement<{ children: ReactNode }, typeof ToolbarStart>;
type ToolbarEndElement = React.ReactElement<{ children: ReactNode }, typeof ToolbarEnd>;

type ToolbarChildren = [ToolbarStartElement, ToolbarEndElement] | ToolbarStartElement | ToolbarEndElement;

interface ToolbarProps {
	children: ToolbarChildren;
	className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
	let toolbarStart: ReactNode = null;
	let toolbarEnd: ReactNode = null;

	const childArray = Children.toArray(children) as (ToolbarStartElement | ToolbarEndElement)[];

	for (const child of childArray) {
		const typeName = child.type.displayName;

		switch (typeName) {
			case ToolbarStart.displayName:
				if (toolbarStart) throw new Error("Toolbar: duplicate <ToolbarStart> found");
				toolbarStart = child.props.children;
				break;
			case ToolbarEnd.displayName:
				if (toolbarEnd) throw new Error("Toolbar: duplicate <ToolbarEnd> found");
				toolbarEnd = child.props.children;
				break;
		}
	}

	return (
		<Flex.Container wrap align="center" gap="md" className={className}>
			{toolbarStart && (
				<Flex.Item flex0>
					<Grid.Container
						templateColumns={`repeat(${childrenCount(toolbarStart)}, calc(15em + var(--width-add)))`}
						align="end"
						gap="sm">
						{toolbarStart}
					</Grid.Container>
				</Flex.Item>
			)}

			<FlexSpacer />

			{toolbarEnd && (
				<Flex.Item flex0>
					<Grid.Container
						templateColumns={`repeat(${childrenCount(toolbarEnd)}, calc(15em + var(--width-add)))`}
						align="end"
						gap="sm">
						{toolbarEnd}
					</Grid.Container>
				</Flex.Item>
			)}
		</Flex.Container>
	);
}
