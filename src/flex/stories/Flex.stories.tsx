// Flex.stories.tsx
import React from "react";

import { Flex } from "../Flex";

import type { Meta, StoryObj } from "@storybook/react-vite";

// Стили для демонстрационных блоков
const demoStyles = {
	container: {
		border: "2px dashed var(--border-0)",
		padding: "2em",
		marginBlock: "1em"
	},
	item: {
		padding: "16px",
		textAlign: "center" as const,
		fontWeight: "bold",
		color: "white",
		minHeight: "5em",
		minWidth: "10em",
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	itemColors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3"]
};

const getItemColor = (index: number) => demoStyles.itemColors[index % demoStyles.itemColors.length];

const DemoItem = ({ children, index = 0 }: { children: React.ReactNode; index?: number }) => (
	<Flex.Item
		style={{
			...demoStyles.item,
			backgroundColor: getItemColor(index)
		}}>
		{children}
	</Flex.Item>
);

const meta = {
	title: "Shared/Layout/Flex",
	component: Flex.Container,
	parameters: {
		layout: "padded"
	},
	tags: ["autodocs"]
} satisfies Meta<typeof Flex.Container>;

export default meta;
type Story = StoryObj<typeof meta>;

// Базовые примеры
export const BasicRow: Story = {
	render: (args) => <Flex.Container {...args} style={demoStyles.container} />,
	args: {
		children: (
			<>
				<DemoItem index={0}>Item 1</DemoItem>
				<DemoItem index={1}>Item 2</DemoItem>
				<DemoItem index={2}>Item 3</DemoItem>
			</>
		),
		row: true
	}
};

export const BasicColumn: Story = {
	render: (args) => <Flex.Container {...args} style={demoStyles.container} />,
	args: {
		children: (
			<>
				<DemoItem index={0}>Header</DemoItem>
				<DemoItem index={1}>Content</DemoItem>
				<DemoItem index={2}>Footer</DemoItem>
			</>
		),
		column: true
	}
};

// Направления
export const Directions: Story = {
	render: () => (
		<div>
			<h3>Row (default)</h3>
			<Flex.Container row style={demoStyles.container}>
				<DemoItem index={0}>1</DemoItem>
				<DemoItem index={1}>2</DemoItem>
				<DemoItem index={2}>3</DemoItem>
			</Flex.Container>

			<h3>Row Reverse</h3>
			<Flex.Container rowReverse style={demoStyles.container}>
				<DemoItem index={0}>1</DemoItem>
				<DemoItem index={1}>2</DemoItem>
				<DemoItem index={2}>3</DemoItem>
			</Flex.Container>

			<h3>Column</h3>
			<Flex.Container column style={demoStyles.container}>
				<DemoItem index={0}>1</DemoItem>
				<DemoItem index={1}>2</DemoItem>
				<DemoItem index={2}>3</DemoItem>
			</Flex.Container>

			<h3>Column Reverse</h3>
			<Flex.Container columnReverse style={demoStyles.container}>
				<DemoItem index={0}>1</DemoItem>
				<DemoItem index={1}>2</DemoItem>
				<DemoItem index={2}>3</DemoItem>
			</Flex.Container>
		</div>
	),
	args: { children: undefined }
};

// Выравнивание по главной оси
export const JustifyContent: Story = {
	render: () => (
		<div>
			{(["start", "center", "end", "between", "around", "evenly"] as const).map((justify) => (
				<div key={justify}>
					<h3>Justify: {justify}</h3>
					<Flex.Container row justify={justify} style={demoStyles.container}>
						<DemoItem index={0}>Item 1</DemoItem>
						<DemoItem index={1}>Item 2</DemoItem>
						<DemoItem index={2}>Item 3</DemoItem>
					</Flex.Container>
				</div>
			))}
		</div>
	),
	args: { children: undefined }
};

// Выравнивание по поперечной оси
export const AlignItems: Story = {
	render: () => (
		<div>
			{(["start", "center", "end", "stretch", "baseline"] as const).map((align) => (
				<div key={align}>
					<h3>Align: {align}</h3>
					<Flex.Container
						row
						align={align}
						style={{
							...demoStyles.container,
							height: "120px"
						}}>
						<DemoItem index={0}>
							<div>Short</div>
						</DemoItem>
						<DemoItem index={1}>
							<div style={{ padding: "40px" }}>Tall</div>
						</DemoItem>
						<DemoItem index={2}>
							<div style={{ padding: "24px" }}>Medium</div>
						</DemoItem>
					</Flex.Container>
				</div>
			))}
		</div>
	),
	args: { children: undefined }
};

// Перенос
export const Wrapping: Story = {
	render: () => (
		<div>
			<h3>No Wrap (default)</h3>
			<Flex.Container row nowrap style={demoStyles.container}>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
					<DemoItem key={i} index={i}>
						Item {i}
					</DemoItem>
				))}
			</Flex.Container>

			<h3>Wrap</h3>
			<Flex.Container row wrap style={demoStyles.container}>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
					<DemoItem key={i} index={i}>
						Item {i}
					</DemoItem>
				))}
			</Flex.Container>

			<h3>Wrap Reverse</h3>
			<Flex.Container row wrapReverse style={demoStyles.container}>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
					<DemoItem key={i} index={i}>
						Item {i}
					</DemoItem>
				))}
			</Flex.Container>
		</div>
	),
	args: { children: undefined }
};

// Gap свойства
export const Gaps: Story = {
	render: () => (
		<div>
			{(["xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
				<div key={gap}>
					<h3>Gap: {gap}</h3>
					<Flex.Container row wrap gap={gap} style={demoStyles.container}>
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<DemoItem key={i} index={i}>
								Item {i}
							</DemoItem>
						))}
					</Flex.Container>
				</div>
			))}

			<h3>Different Row and Column Gaps</h3>
			<Flex.Container row wrap gapRow="lg" gapColumn="sm" style={demoStyles.container}>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
					<DemoItem key={i} index={i}>
						Item {i}
					</DemoItem>
				))}
			</Flex.Container>
		</div>
	),
	args: { children: undefined }
};

// Flex Item свойства
export const FlexItems: Story = {
	render: () => (
		<div>
			<h3>Grow Properties</h3>
			<Flex.Container row style={demoStyles.container}>
				<DemoItem index={0}>Default</DemoItem>
				<Flex.Item grow>
					<div style={{ ...demoStyles.item, backgroundColor: getItemColor(1) }}>Grow</div>
				</Flex.Item>
				<DemoItem index={2}>Default</DemoItem>
			</Flex.Container>

			<h3>Shrink Properties</h3>
			<Flex.Container row style={{ ...demoStyles.container, width: "300px" }}>
				<Flex.Item shrink={false}>
					<div
						style={{
							...demoStyles.item,
							backgroundColor: getItemColor(0),
							width: "150px"
						}}>
						No Shrink
					</div>
				</Flex.Item>
				<Flex.Item>
					<div
						style={{
							...demoStyles.item,
							backgroundColor: getItemColor(1),
							width: "150px"
						}}>
						Shrink (default)
					</div>
				</Flex.Item>
			</Flex.Container>

			<h3>Composite Classes</h3>
			<Flex.Container row style={demoStyles.container}>
				<Flex.Item flex0>
					<div style={{ ...demoStyles.item, backgroundColor: getItemColor(0) }}>flex0</div>
				</Flex.Item>
				<Flex.Item flex1>
					<div style={{ ...demoStyles.item, backgroundColor: getItemColor(1) }}>flex1</div>
				</Flex.Item>
				<Flex.Item flex0>
					<div style={{ ...demoStyles.item, backgroundColor: getItemColor(2) }}>flex0</div>
				</Flex.Item>
			</Flex.Container>
		</div>
	),
	args: { children: undefined }
};

// Предопределенные композиции
export const Predefined: Story = {
	render: () => (
		<div>
			<h3>Center</h3>
			<Flex.Predefined variant="center" style={{ ...demoStyles.container, height: "100px" }}>
				<DemoItem index={0}>Centered Content</DemoItem>
			</Flex.Predefined>

			<h3>Center Between</h3>
			<Flex.Predefined variant="centerBetween" style={demoStyles.container}>
				<DemoItem index={0}>Left</DemoItem>
				<DemoItem index={1}>Right</DemoItem>
			</Flex.Predefined>
		</div>
	),
	args: { children: undefined }
};

// Inline Flex
export const InlineFlex: Story = {
	render: () => (
		<div>
			<p>
				This is text with
				<Flex.Container inline align="center" gap="sm" style={{ margin: "0 8px" }}>
					<DemoItem index={0}>inline</DemoItem>
					<DemoItem index={1}>flex</DemoItem>
				</Flex.Container>
				elements inside.
			</p>

			<p>
				Another example with
				<Flex.Container inline column gap="xs" style={{ margin: "0 8px" }}>
					<DemoItem index={2}>vertical</DemoItem>
					<DemoItem index={3}>inline</DemoItem>
				</Flex.Container>
				flex.
			</p>
		</div>
	),
	args: { children: undefined }
};

// Real World Examples
export const RealWorld: Story = {
	render: () => (
		<div>
			<h3>Navigation Bar</h3>
			<Flex.Predefined variant="centerBetween" style={demoStyles.container}>
				<Flex.Container row align="center" gap="md">
					<DemoItem index={0}>Logo</DemoItem>
					<DemoItem index={1}>Home</DemoItem>
					<DemoItem index={2}>About</DemoItem>
					<DemoItem index={3}>Contact</DemoItem>
				</Flex.Container>
				<DemoItem index={4}>Login</DemoItem>
			</Flex.Predefined>

			<h3>Card Layout</h3>
			<Flex.Container row wrap gap="lg" style={demoStyles.container}>
				{[1, 2, 3, 4].map((i) => (
					<Flex.Item key={i} flex1 style={{ minWidth: "200px" }}>
						<div
							style={{
								border: "1px solid #ddd",
								borderRadius: "8px",
								padding: "16px",
								textAlign: "center",
								backgroundColor: getItemColor(i)
							}}>
							<h4>Card {i}</h4>
							<p>Card content goes here</p>
						</div>
					</Flex.Item>
				))}
			</Flex.Container>

			<h3>Form Layout</h3>
			<Flex.Container column gap="md" style={demoStyles.container}>
				<Flex.Container row gap="md">
					<Flex.Item flex1>
						<DemoItem index={0}>First Name</DemoItem>
					</Flex.Item>
					<Flex.Item flex1>
						<DemoItem index={1}>Last Name</DemoItem>
					</Flex.Item>
				</Flex.Container>
				<DemoItem index={2}>Email</DemoItem>
				<DemoItem index={3}>Message</DemoItem>
			</Flex.Container>
		</div>
	),
	args: { children: undefined }
};
