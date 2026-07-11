import { type ReactNode } from "react";

import { type ReadFileError, type ReadFileResult } from "@ryuzaki13/react-foundation-lib/file";

import { type ImageCropArea, type ImageCropPoint } from "./imageCropTypes";

export type SelectedImageFile = Extract<ReadFileResult, { mode: "data-url" }>;

/** Данные исходного файла и подтверждённые пользователем параметры изображения. */
export type SelectedImageData = {
	file: SelectedImageFile;
	alt: string;
	crop?: ImageCropArea;
};

export interface ImageSelectionActionsData {
	value: SelectedImageData[];
	activeIndex: number;
	hasSelected: boolean;
	canApply: boolean;
	apply: () => void;
}

export interface ImageSelectionPanelProps {
	aspect?: number;
	disabled?: boolean;
	value?: SelectedImageData[];
	defaultValue?: SelectedImageData[];
	allowedMime?: readonly string[];
	maxBytes?: number;
	minimumCropWidth?: number;
	onReadError?: (error: ReadFileError) => void;
	onChange?: (data: SelectedImageData[]) => void;
	onApply?: (data: SelectedImageData[]) => void;
	renderActions?: (data: ImageSelectionActionsData) => ReactNode;
}

export interface ImageSelectionModalProps extends ImageSelectionPanelProps {
	isOpen?: boolean;
	onClose?: () => void;
	title?: string;
}

export type ImageCropperState = {
	crop: ImageCropPoint;
	zoom: number;
};

export interface ImageSelectionState extends ImageSelectionActionsData {
	files: SelectedImageFile[];
	activeImage?: SelectedImageData;
	activeCropperState: ImageCropperState;
	setFiles: (files: SelectedImageFile[]) => void;
	setActiveIndex: (index: number) => void;
	setActiveAlt: (alt: string) => void;
	setActiveCrop: (crop: ImageCropArea) => void;
	setActiveCropperCrop: (crop: ImageCropPoint) => void;
	setActiveCropperZoom: (zoom: number) => void;
}
