export function AnimatedLogo() {
	return (
		<div className="logoAnimated">
			<svg xmlns="http://www.w3.org/2000/svg" width="588" height="696" viewBox="0 0 588 696" role="img" aria-label="Загрузка">
				<path className="logoSegment logoOutline logoS1" d="M15,15v225.37l136.14-.23c44.13-.07,79.86-35.87,79.86-80V15H15Z" />
				<path className="logoSegment logoOutline logoS2" d="M15,285v396s216,0,216,0v-316c0-44.18-35.82-80-80-80H15Z" />
				<path className="logoSegment logoOutline logoS3" d="M276,15h297s0,225,0,225h-217c-44.18,0-80-35.82-80-80V15Z" />
				<path
					className="logoSegment logoFill logoS4"
					d="M573,285v108h-169c-11.05,0-20,8.95-20,20v268h-108v-316c0-44.18,35.82-80,80-80h217Z"
				/>
			</svg>
		</div>
	);
}
