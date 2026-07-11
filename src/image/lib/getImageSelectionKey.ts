import { type SelectedImageData } from "../model/imageSelectionTypes";

/** Возвращает устойчивый ключ файла внутри текущего набора выбранных изображений. */
export function getImageSelectionKey(image: SelectedImageData, index: number): string {
	return `${image.file.meta.name}-${image.file.meta.size}-${image.file.meta.lastModified}-${index}`;
}
