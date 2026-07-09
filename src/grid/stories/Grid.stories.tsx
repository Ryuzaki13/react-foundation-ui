// Grid.stories.tsx
import React from "react";

import { Grid } from "../Grid";

import type { Meta, StoryObj } from "@storybook/react-vite";

// Стили для демонстрационных блоков (аналогично Flex)
const demoStyles = {
	container: {
		border: "2px dashed var(--border-0)",
		padding: "2em",
		marginBlock: "1em"
	},
	item: {
		textAlign: "center" as const,
		fontWeight: "bold",
		color: "white",
		minHeight: "5em",
		minWidth: "10em",
		display: "flex",
		alignItems: "center",
		justifyContent: "center"
	},
	itemColors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57", "#ff9ff3", "#54a0ff", "#5f27cd"]
};

const getItemColor = (index: number) => demoStyles.itemColors[index % demoStyles.itemColors.length];

const DemoItem = ({ children, index = 0, style }: { children: React.ReactNode; index?: number; style?: React.CSSProperties }) => (
	<Grid.Item
		style={{
			...demoStyles.item,
			backgroundColor: getItemColor(index),
			...style
		}}>
		{children}
	</Grid.Item>
);

const meta = {
	title: "Shared/Layout/Grid",
	component: Grid.Container,
	parameters: {
		layout: "padded"
	}
} satisfies Meta<typeof Grid.Container>;

export default meta;
type Story = StoryObj<typeof meta>;

// Базовые примеры
export const BasicGrid: Story = {
	render: ({ children, ...args }) => (
		<Grid.Container {...args} templateColumns="1fr 1fr 1fr" style={demoStyles.container}>
			{children}
		</Grid.Container>
	),
	args: {
		children: (
			<>
				<DemoItem index={0}>1</DemoItem>
				<DemoItem index={1}>2</DemoItem>
				<DemoItem index={2}>3</DemoItem>
				<DemoItem index={3}>4</DemoItem>
				<DemoItem index={4}>5</DemoItem>
				<DemoItem index={5}>6</DemoItem>
			</>
		)
	}
};

// Auto Flow
export const AutoFlow: Story = {
	render: () => (
		<div>
			<h3>Row (default)</h3>
			<Grid.Container templateColumns="repeat(3, 100px)" templateRows="repeat(2, 60px)" gap="sm" style={demoStyles.container}>
				<DemoItem index={0}>1</DemoItem>
				<DemoItem index={1}>2</DemoItem>
				<DemoItem index={2}>3</DemoItem>
				<DemoItem index={3}>4</DemoItem>
				<DemoItem index={4}>5</DemoItem>
				<DemoItem index={5}>6</DemoItem>
			</Grid.Container>

			<h3>Column</h3>
			<Grid.Container templateColumns="repeat(2, 100px)" templateRows="repeat(3, 60px)" column gap="sm" style={demoStyles.container}>
				<DemoItem index={0}>1</DemoItem>
				<DemoItem index={1}>2</DemoItem>
				<DemoItem index={2}>3</DemoItem>
				<DemoItem index={3}>4</DemoItem>
				<DemoItem index={4}>5</DemoItem>
				<DemoItem index={5}>6</DemoItem>
			</Grid.Container>

			<h3>Dense</h3>
			<Grid.Container templateColumns="repeat(4, 80px)" templateRows="repeat(3, 60px)" dense gap="sm" style={demoStyles.container}>
				<DemoItem index={0} style={{ gridColumn: "span 2" }}>
					Span 2
				</DemoItem>
				<DemoItem index={1}>2</DemoItem>
				<DemoItem index={2} style={{ gridRow: "span 2" }}>
					Span 2
				</DemoItem>
				<DemoItem index={3}>4</DemoItem>
				<DemoItem index={4}>5</DemoItem>
				<DemoItem index={5}>6</DemoItem>
				<DemoItem index={6}>7</DemoItem>
			</Grid.Container>
		</div>
	),
	args: { children: undefined }
};

// Выравнивание
export const Alignment: Story = {
	render: () => (
		<div>
			<h3 style={{ marginBlock: "1em" }}>Align Items</h3>
			{(["start", "center", "end", "stretch"] as const).map((align) => (
				<div key={align}>
					<h4>{align}</h4>
					<Grid.Container templateColumns="repeat(3, 1fr)" align={align} gap="sm" style={demoStyles.container}>
						<DemoItem index={0} style={{ height: align === "stretch" ? "auto" : "5em" }}>
							Short
						</DemoItem>
						<DemoItem index={1} style={{ height: align === "stretch" ? "auto" : "10em" }}>
							Tall
						</DemoItem>
						<DemoItem index={2} style={{ height: align === "stretch" ? "auto" : "8em" }}>
							Medium
						</DemoItem>
					</Grid.Container>
				</div>
			))}

			<h3 style={{ marginBlock: "1em" }}>Justify Items</h3>
			{(["start", "center", "end", "stretch"] as const).map((justify) => (
				<div key={justify}>
					<h4>{justify}</h4>
					<Grid.Container templateColumns="repeat(3, 20em)" justify={justify} gap="sm" style={demoStyles.container}>
						<DemoItem index={0} style={{ width: justify === "stretch" ? "auto" : "10em" }}>
							Item
						</DemoItem>
						<DemoItem index={1} style={{ width: justify === "stretch" ? "auto" : "10em" }}>
							Item
						</DemoItem>
						<DemoItem index={2} style={{ width: justify === "stretch" ? "auto" : "10em" }}>
							Item
						</DemoItem>
					</Grid.Container>
				</div>
			))}
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
					<Grid.Container templateColumns="repeat(3, 1fr)" gap={gap} style={demoStyles.container}>
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<DemoItem key={i} index={i}>
								Item {i}
							</DemoItem>
						))}
					</Grid.Container>
				</div>
			))}

			<h3>Different Row and Column Gaps</h3>
			<Grid.Container templateColumns="repeat(3, 1fr)" gapRow="lg" gapColumn="sm" style={demoStyles.container}>
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<DemoItem key={i} index={i}>
						Item {i}
					</DemoItem>
				))}
			</Grid.Container>
		</div>
	),
	args: { children: undefined }
};

// Предопределенные варианты
export const PredefinedVariants: Story = {
	render: () => (
		<div>
			<h3>Single Column (grid-template-columns: 100%; grid-auto-rows: auto 1fr)</h3>
			<Grid.Container variant="single-column" style={{ ...demoStyles.container, height: "200px" }}>
				<DemoItem index={0}>Header (auto)</DemoItem>
				<DemoItem index={1}>Content (1fr)</DemoItem>
			</Grid.Container>

			<h3>Auto 1fr Rows (grid-auto-rows: 1fr)</h3>
			<Grid.Container variant="auto-1fr" templateColumns="1fr 1fr" style={{ ...demoStyles.container, height: "150px" }}>
				<DemoItem index={0}>Equal</DemoItem>
				<DemoItem index={1}>Height</DemoItem>
			</Grid.Container>

			<h3>Auto 1fr Columns (grid-template-columns: auto 1fr; grid-auto-rows: auto)</h3>
			<Grid.Container variant="auto1fr-rows-auto" gap="sm" style={demoStyles.container}>
				<DemoItem index={0}>Label</DemoItem>
				<DemoItem index={1}>Content that takes remaining space</DemoItem>
				<DemoItem index={2}>Another</DemoItem>
				<DemoItem index={3}>More content here</DemoItem>
			</Grid.Container>
		</div>
	),
	args: { children: undefined }
};

// Сложные шаблоны с inline styles
export const ComplexTemplates: Story = {
	render: () => (
		<div>
			<h3>Auto-fit with Minmax</h3>
			<Grid.Container templateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap="md" style={demoStyles.container}>
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<DemoItem key={i} index={i}>
						Card {i}
					</DemoItem>
				))}
			</Grid.Container>

			<h3>Fixed and Flexible Columns</h3>
			<Grid.Container templateColumns="200px 1fr 100px" gap="sm" style={demoStyles.container}>
				<DemoItem index={0}>Sidebar</DemoItem>
				<DemoItem index={1}>Main Content</DemoItem>
				<DemoItem index={2}>Tools</DemoItem>
			</Grid.Container>

			<h3>Masonry-like Layout</h3>
			<Grid.Container templateColumns="repeat(4, 1fr)" autoRows="100px" gap="sm" style={demoStyles.container}>
				<DemoItem index={0} style={{ gridRow: "span 2" }}>
					Tall
				</DemoItem>
				<DemoItem index={1}>Normal</DemoItem>
				<DemoItem index={2}>Normal</DemoItem>
				<DemoItem index={3} style={{ gridRow: "span 3" }}>
					Very Tall
				</DemoItem>
				<DemoItem index={4}>Normal</DemoItem>
				<DemoItem index={5} style={{ gridRow: "span 2" }}>
					Tall
				</DemoItem>
				<DemoItem index={6}>Normal</DemoItem>
				<DemoItem index={7}>Normal</DemoItem>
			</Grid.Container>
		</div>
	),
	args: { children: undefined }
};

// Grid Areas
export const GridAreas: Story = {
	render: () => (
		<div>
			<h3>Basic Layout with Areas</h3>
			<Grid.Container
				areas={`
          "header header"
          "nav main"
          "footer footer"
        `}
				templateColumns="200px 1fr"
				templateRows="auto 1fr auto"
				gap="md"
				style={{ ...demoStyles.container, height: "300px" }}>
				<Grid.Item area="header">
					<DemoItem index={0}>Header</DemoItem>
				</Grid.Item>
				<Grid.Item area="nav">
					<DemoItem index={1}>Navigation</DemoItem>
				</Grid.Item>
				<Grid.Item area="main">
					<DemoItem index={2}>Main Content</DemoItem>
				</Grid.Item>
				<Grid.Item area="footer">
					<DemoItem index={3}>Footer</DemoItem>
				</Grid.Item>
			</Grid.Container>

			<h3>Complex Areas Layout</h3>
			<Grid.Container
				areas={`
          "header header header"
          "sidebar content ads"
          "sidebar footer footer"
        `}
				templateColumns="150px 1fr 120px"
				templateRows="60px 1fr 60px"
				gap="sm"
				style={{ ...demoStyles.container, height: "350px" }}>
				<Grid.Item area="header">
					<DemoItem index={0}>Header</DemoItem>
				</Grid.Item>
				<Grid.Item area="sidebar">
					<DemoItem index={1}>Sidebar</DemoItem>
				</Grid.Item>
				<Grid.Item area="content">
					<DemoItem index={2}>Content</DemoItem>
				</Grid.Item>
				<Grid.Item area="ads">
					<DemoItem index={3}>Ads</DemoItem>
				</Grid.Item>
				<Grid.Item area="footer">
					<DemoItem index={4}>Footer</DemoItem>
				</Grid.Item>
			</Grid.Container>
		</div>
	),
	args: { children: undefined }
};

// Grid Item Placement
export const ItemPlacement: Story = {
	render: () => (
		<div>
			<h3>Column and Row Span</h3>
			<Grid.Container templateColumns="repeat(4, 1fr)" templateRows="repeat(3, 80px)" gap="sm" style={demoStyles.container}>
				<DemoItem index={0} style={{ gridColumn: "span 2" }}>
					Span 2 Columns
				</DemoItem>
				<DemoItem index={1}>Normal</DemoItem>
				<DemoItem index={2}>Normal</DemoItem>
				<DemoItem index={3} style={{ gridRow: "span 2" }}>
					Span 2 Rows
				</DemoItem>
				<DemoItem index={4}>Normal</DemoItem>
				<DemoItem index={5}>Normal</DemoItem>
				<DemoItem index={6} style={{ gridColumn: "span 3", gridRow: "span 2" }}>
					Span 3 Columns & 2 Rows
				</DemoItem>
			</Grid.Container>

			<h3>Self Alignment</h3>
			<Grid.Container templateColumns="repeat(3, 1fr)" templateRows="repeat(2, 100px)" gap="sm" style={demoStyles.container}>
				<Grid.Item alignSelf="start">
					<DemoItem index={0}>Start</DemoItem>
				</Grid.Item>
				<Grid.Item alignSelf="center">
					<DemoItem index={1}>Center</DemoItem>
				</Grid.Item>
				<Grid.Item alignSelf="end">
					<DemoItem index={2}>End</DemoItem>
				</Grid.Item>
				<Grid.Item justifySelf="start">
					<DemoItem index={3} style={{ width: "80px" }}>
						Start
					</DemoItem>
				</Grid.Item>
				<Grid.Item justifySelf="center">
					<DemoItem index={4} style={{ width: "80px" }}>
						Center
					</DemoItem>
				</Grid.Item>
				<Grid.Item justifySelf="end">
					<DemoItem index={5} style={{ width: "80px" }}>
						End
					</DemoItem>
				</Grid.Item>
			</Grid.Container>
		</div>
	),
	args: { children: undefined }
};

// Inline Grid
export const InlineGrid: Story = {
	render: () => (
		<div>
			<p>
				This is text with
				<Grid.Container inline templateColumns="repeat(2, auto)" gap="xs" style={{ margin: "0 8px" }}>
					<DemoItem index={0}>inline</DemoItem>
					<DemoItem index={1}>grid</DemoItem>
				</Grid.Container>
				elements inside.
			</p>

			<p>
				Another inline grid example:
				<Grid.Container inline templateColumns="auto auto" gap="sm" align="center" style={{ margin: "0 8px" }}>
					<DemoItem index={2} style={{ fontSize: "12px", padding: "4px 8px" }}>
						Small
					</DemoItem>
					<DemoItem index={3} style={{ fontSize: "12px", padding: "4px 8px" }}>
						Items
					</DemoItem>
				</Grid.Container>
				in text flow.
			</p>
		</div>
	),
	args: { children: undefined }
};

// Real World Examples
export const RealWorld: Story = {
	render: () => (
		<div>
			<h3>Dashboard Layout</h3>
			<Grid.Container
				areas={`
          "header header header"
          "stats stats sidebar"
          "chart chart sidebar"
          "table table sidebar"
        `}
				templateColumns="1fr 1fr 300px"
				templateRows="auto auto 1fr auto"
				gap="lg"
				style={{ ...demoStyles.container, minHeight: "500px" }}>
				<Grid.Item area="header">
					<DemoItem index={0}>Dashboard Header</DemoItem>
				</Grid.Item>
				<Grid.Item area="stats">
					<DemoItem index={1}>Statistics Cards</DemoItem>
				</Grid.Item>
				<Grid.Item area="chart">
					<DemoItem index={2}>Main Chart</DemoItem>
				</Grid.Item>
				<Grid.Item area="table">
					<DemoItem index={3}>Data Table</DemoItem>
				</Grid.Item>
				<Grid.Item area="sidebar">
					<DemoItem index={4}>Sidebar Widgets</DemoItem>
				</Grid.Item>
			</Grid.Container>

			<h3>Product Grid</h3>
			<Grid.Container
				templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
				autoRows="minmax(250px, auto)"
				gap="md"
				style={demoStyles.container}>
				{[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
					<Grid.Item key={i}>
						<div
							style={{
								border: "1px solid #ddd",
								borderRadius: "8px",
								padding: "16px",
								height: "100%",
								backgroundColor: getItemColor(i),
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
								color: "white"
							}}>
							<h4>Product {i}</h4>
							<p>Description</p>
							<button style={{ marginTop: "8px", padding: "8px 16px" }}>Buy Now</button>
						</div>
					</Grid.Item>
				))}
			</Grid.Container>

			<h3>Form Layout</h3>
			<Grid.Container templateColumns="auto 1fr" autoRows="auto" gap="md" align="center" style={demoStyles.container}>
				<DemoItem index={0} style={{ justifySelf: "end" }}>
					Name:
				</DemoItem>
				<DemoItem index={1}>Input Field</DemoItem>

				<DemoItem index={2} style={{ justifySelf: "end" }}>
					Email:
				</DemoItem>
				<DemoItem index={3}>Input Field</DemoItem>

				<DemoItem index={4} style={{ justifySelf: "end" }}>
					Message:
				</DemoItem>
				<Grid.Item style={{ gridColumn: "2", alignSelf: "stretch" }}>
					<DemoItem index={5} style={{ height: "100%" }}>
						Textarea
					</DemoItem>
				</Grid.Item>
			</Grid.Container>
		</div>
	),
	args: { children: undefined }
};

// Responsive Examples
export const Responsive: Story = {
	render: () => (
		<div>
			{/* <h3>Responsive Columns</h3>
			<Grid.Container
				templateColumns={{
					mobile: "1fr",
					tablet: "repeat(2, 1fr)",
					desktop: "repeat(4, 1fr)"
				}}
				gap="md"
				style={demoStyles.container}>
				{[1, 2, 3, 4].map((i) => (
					<DemoItem key={i} index={i}>
						Item {i}
					</DemoItem>
				))}
			</Grid.Container> */}

			<h3>Adaptive Layout</h3>
			<Grid.Container templateColumns="repeat(auto-fit, minmax(min(100%, 300px), 1fr))" gap="lg" style={demoStyles.container}>
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<DemoItem key={i} index={i}>
						Adaptive Card {i}
					</DemoItem>
				))}
			</Grid.Container>
		</div>
	),
	args: { children: undefined }
};
