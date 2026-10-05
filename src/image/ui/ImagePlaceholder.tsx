export interface ImagePlaceholderProps {
	width?: number | string;
	height?: number | string;
	aspectRatio?: string | "unset";
	className?: string;
}

export function ImagePlaceholder({ width = "100%", height = "100%", aspectRatio = "16 / 9", className }: ImagePlaceholderProps) {
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
				{/* <rect width="200" height="200" fill="var(--bg-elevated)" rx="10" ry="10" /> */}
				<g fill="var(--bg-canvas)">
					<rect x="40" y="50" width="120" height="100" rx="10" />

					<circle cx="60" cy="70" r="8" fill="var(--bg-elevated)" />

					<path d="M50 130 L75 100 L100 130 Z" fill="var(--bg-elevated)" />
					<path d="M90 130 L120 90 L150 130 Z" fill="var(--bg-elevated)" />

					<line x1="160" y1="40" x2="40" y2="160" stroke="var(--bg-canvas)" strokeWidth="15" strokeLinecap="round" />
					<line x1="160" y1="40" x2="40" y2="160" stroke="var(--bg-elevated)" strokeWidth="5" strokeLinecap="round" />
				</g>
			</svg>
		</div>
	);
}
