import { useId } from "react";

export interface ImagePlaceholderProps {
	width?: number | string;
	height?: number | string;
	aspectRatio?: string | "unset";
	className?: string;
}

export function ImagePlaceholder({ width = "100%", height = "100%", aspectRatio = "16 / 9", className }: ImagePlaceholderProps) {
	const maskId = useId();

	return (
		<div style={{ width, height, aspectRatio }} className={className}>
			<svg
				width={width}
				height={height}
				viewBox="0 0 200 200"
				xmlns="http://www.w3.org/2000/svg"
				role="img"
				fill="none"
				rx="10"
				ry="10"
				style={{ display: "block" }}
				aria-label="Изображение недоступно">
				<defs>
					{/* Маска делает детали прозрачными, чтобы значок подходил к любой поверхности host-проекта. */}
					<mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
						<rect x="40" y="50" width="120" height="100" rx="10" fill="white" />
						<g fill="black">
							<circle cx="60" cy="70" r="8" />
							<path d="M50 130 L75 100 L100 130 Z" />
							<path d="M90 130 L120 90 L150 130 Z" />
						</g>
						<line x1="160" y1="40" x2="40" y2="160" stroke="black" strokeWidth="15" strokeLinecap="round" />
					</mask>
				</defs>
				<g fill="var(--text-muted)" stroke="var(--text-muted)" opacity="0.6">
					<rect x="40" y="50" width="120" height="100" rx="10" stroke="none" mask={`url(#${maskId})`} />
					<line x1="160" y1="40" x2="40" y2="160" strokeWidth="5" strokeLinecap="round" />
				</g>
			</svg>
		</div>
	);
}
