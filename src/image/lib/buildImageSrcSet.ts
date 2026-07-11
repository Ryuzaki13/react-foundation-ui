import { type ImageCandidate } from "../model/imageTypes";

/** Собирает валидный srcset из уже разрешённых вызывающим кодом URL вариантов. */
export function buildImageSrcSet(candidates: readonly ImageCandidate[]): string {
	return candidates
		.map((candidate) => ("width" in candidate ? `${candidate.src} ${candidate.width}w` : `${candidate.src} ${candidate.density}x`))
		.join(", ");
}
