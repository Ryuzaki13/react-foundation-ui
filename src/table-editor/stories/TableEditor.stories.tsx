import { type Meta, type StoryObj } from "@storybook/react-vite";

import { TableEditorDemo } from "./TableEditorDemo";

const meta = { title: "Editors/TableEditor", component: TableEditorDemo, parameters: { layout: "padded" } } satisfies Meta<
	typeof TableEditorDemo
>;
export default meta;
export const Interactive: StoryObj<typeof meta> = {};
