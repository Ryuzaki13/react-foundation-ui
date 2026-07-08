import { useState } from "react";

export function BoomExplosion() {
	const [transform] = useState(() => {
		const scale = 0.7 + Math.random() * 0.3;
		const rotate = Math.random() * 45 - 15;
		return `scale(${scale}) rotateZ(${rotate}deg)`;
	});

	return (
		<svg
			viewBox="0 0 300 300"
			width="300"
			height="300"
			style={{
				position: "absolute",
				top: "50%",
				left: "50%",
				transform: `translate(-50%, -50%) ${transform}`,
				zIndex: 0,
				opacity: 0.5
			}}>
			<polygon
				points="
150,10 170,60 230,40 200,100 270,110 210,150 270,190 200,200 230,260 170,240 150,290 130,240
70,260 100,200 30,190 90,150 30,110 100,100 70,40 130,60"
				fill="var(--status-error-on-fill)"
				stroke="var(--status-error-fill)"
				strokeWidth="5"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
