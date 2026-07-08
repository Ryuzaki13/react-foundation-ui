import React, { useState } from "react";

import { BoomExplosion } from "./BoomExplosion";
import { ERROR_BOOM_MESSAGES } from "./constants";

interface ErrorExplosionProps {
	header?: string;
	description?: string;
}

export const ErrorExplosion: React.FC<ErrorExplosionProps> = ({ header, description }) => {
	const [randomValue] = useState(() => Math.random());

	return (
		<div className="container marginBlockLg">
			<div aria-hidden="true" className={"textCenter relative fontBolded statusWarning marginBlockMd"} style={{ fontSize: "6em" }}>
				<BoomExplosion />
				<div
					style={{
						zIndex: 1,
						position: "relative",
						textShadow: "1px 0 1px var(--status-error-fill), -1px 0 1px var(--status-info-fill)"
					}}>
					{ERROR_BOOM_MESSAGES[Math.floor(randomValue * ERROR_BOOM_MESSAGES.length)]}
				</div>
			</div>
			<div className="flexColumn alignItemsCenter textCenter marginBlockMd">
				{header && <h2 className="statusWarning">{header}</h2>}
				{description && <p>{description}</p>}
			</div>
		</div>
	);
};
