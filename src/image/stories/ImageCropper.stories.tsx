import { type Meta, type StoryObj } from "@storybook/react-vite";
import { useArgs } from "storybook/preview-api";

import { type ImageCropperProps } from "../model/imageCropTypes";
import { ImageCropper } from "../ui/ImageCropper";

const DEMO_IMAGE = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80";

const meta = {
	title: "UI/Image/ImageCropper",
	component: ImageCropper,
	args: {
		image: DEMO_IMAGE,
		aspect: 16 / 9
	},
	parameters: {
		layout: "padded"
	},
	argTypes: {
		image: { description: "URL исходного изображения.", control: "text" },
		aspect: { description: "Соотношение сторон области обрезки.", control: "number" },
		width: { description: "Ширина контейнера cropper.", control: "text" },
		crop: { description: "Контролируемое смещение изображения.", control: false },
		defaultCrop: { description: "Начальное смещение в uncontrolled-режиме.", control: false },
		zoom: { description: "Контролируемый масштаб изображения.", control: { type: "number", min: 1, step: 0.1 } },
		defaultZoom: { description: "Начальный масштаб в uncontrolled-режиме.", control: { type: "number", min: 1, step: 0.1 } },
		minZoom: { description: "Минимально доступный масштаб.", control: { type: "number", min: 1, step: 0.1 } },
		maxZoom: { description: "Максимально доступный масштаб.", control: { type: "number", min: 1, step: 0.1 } },
		zoomSpeed: { description: "Шаг изменения масштаба.", control: { type: "number", min: 0.01, step: 0.01 } },
		objectFit: {
			description: "Способ начального вписывания изображения.",
			control: "select",
			options: ["contain", "cover", "horizontal-cover", "vertical-cover"]
		},
		disabled: { description: "Блокирует перемещение и масштабирование.", control: "boolean" },
		onCropChange: { description: "Вызывается при перемещении области обрезки.", control: false },
		onZoomChange: { description: "Вызывается при изменении масштаба.", control: false },
		onCropComplete: { description: "Вызывается после завершения изменения crop.", control: false }
	}
} satisfies Meta<typeof ImageCropper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {};

export const Controlled: Story = {
	render: function Render(args) {
		const [, updateArgs] = useArgs<ImageCropperProps>();

		return (
			<ImageCropper
				{...args}
				crop={args.crop ?? { x: 0, y: 0 }}
				zoom={args.zoom ?? 1}
				onCropChange={(crop) => {
					args.onCropChange?.(crop);
					updateArgs({ crop });
				}}
				onZoomChange={(zoom) => {
					args.onZoomChange?.(zoom);
					updateArgs({ zoom });
				}}
			/>
		);
	},
	args: {
		crop: { x: 0, y: 0 },
		zoom: 1
	}
};

export const Square: Story = {
	args: {
		aspect: 1
	}
};
