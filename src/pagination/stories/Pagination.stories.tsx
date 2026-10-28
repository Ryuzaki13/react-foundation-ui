import { type Meta, type StoryObj } from "@storybook/react-vite";

import { createControlledStoryRender } from "../../development/storybook/createControlledStoryRender";
import { Pagination, type PaginationProps } from "../index";

const renderControlled = createControlledStoryRender<PaginationProps>((args, updateArgs) => (
	<Pagination
		{...args}
		onPageChange={(page) => {
			args.onPageChange(page);
			updateArgs({ page });
		}}
	/>
));

const meta = {
	title: "UI/Pagination",
	component: Pagination,
	args: {
		page: 1,
		pageCount: 43,
		onPageChange: () => undefined,
		disabled: false,
		"aria-label": "Страницы примера"
	},
	parameters: {
		atomicCanvas: true,
		layout: "padded"
	},
	argTypes: {
		page: { description: "Текущая страница, начиная с единицы.", control: { type: "number", min: 1, step: 1 } },
		pageCount: { description: "Количество страниц; ноль допустим для пустого набора.", control: { type: "number", min: 0, step: 1 } },
		onPageChange: { description: "Публикует номер только при действии пользователя.", control: false },
		disabled: { description: "Блокирует переходы, например во время чтения.", control: "boolean" }
	}
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Controlled: Story = { render: renderControlled };

export const Middle: Story = {
	render: renderControlled,
	args: { page: 22 }
};

export const Last: Story = {
	render: renderControlled,
	args: { page: 43 }
};

export const Small: Story = {
	render: renderControlled,
	args: { pageCount: 5, page: 3 }
};

export const Disabled: Story = {
	args: { page: 22, disabled: true }
};

export const Empty: Story = {
	args: { pageCount: 0 }
};
