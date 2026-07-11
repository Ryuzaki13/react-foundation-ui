import { type ImageSource, type ResponsiveImageSource } from "../model/imageTypes";

import { buildImageSrcSet } from "./buildImageSrcSet";

/** Преобразует декларативные наборы кандидатов в готовые source-дескрипторы. */
export function buildImageSources(sources: readonly ResponsiveImageSource[] | undefined, defaultSizes?: string): ImageSource[] {
	return (sources ?? [])
		.map((source) => ({
			srcSet: buildImageSrcSet(source.candidates),
			type: source.type,
			sizes: source.sizes ?? defaultSizes
		}))
		.filter((source) => source.srcSet.length > 0);
}
