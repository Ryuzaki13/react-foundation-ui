import { useEffect, useState } from "react";

import { captureRuntimeErrorReport } from "@ryuzaki13/react-foundation-lib/error-report";
import { logError } from "@ryuzaki13/react-foundation-lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { BadRequestPage } from "./BadRequestPage";
import { BoomExplosion } from "./BoomExplosion";
import { ERROR_BOOM_MESSAGES } from "./constants";
import { ForbiddenPage } from "./ForbiddenPage";
import { NotFoundPage } from "./NotFoundPage";

function getHttpStatusCode(error: Error): number | undefined {
	if (!("status" in error) || typeof error.status !== "number") return undefined;
	return error.status;
}

export const ErrorDisplay: React.FC<{ error: Error; componentStack?: string; draftId?: string | null }> = ({
	error,
	componentStack,
	draftId
}) => {
	const [randomValue] = useState(() => Math.random());
	const queryClient = useQueryClient();

	useEffect(() => {
		if (draftId !== undefined) return;

		void captureRuntimeErrorReport(
			error,
			{
				category: "react",
				componentStack
			},
			queryClient
		);
	}, [componentStack, draftId, error, queryClient]);

	const httpStatusCode = getHttpStatusCode(error);

	if (httpStatusCode) {
		switch (httpStatusCode) {
			case 400:
				return <BadRequestPage />;
			case 403:
				return <ForbiddenPage />;
			case 404:
				return <NotFoundPage />;
		}
	}

	logError(error.stack);

	return (
		<section className="w100 h100 flexColumn justifyContentCenter paddingMd">
			<div aria-hidden="true" className="textCenter relative fontBolded statusError" style={{ fontSize: "4em", marginBlock: "2em" }}>
				<BoomExplosion />
				<div
					style={{
						zIndex: 1,
						position: "relative",
						textShadow: "1px -1px 1px var(--status-warning-border-focus), -1px 1px 1px var(--status-info-border-focus)"
					}}>
					{ERROR_BOOM_MESSAGES[Math.floor(randomValue * ERROR_BOOM_MESSAGES.length)]}
				</div>
			</div>
			<div className="textCenter">
				<h2 className="statusError">Критическая ошибка</h2>
				<p className="statusError fontSizeLg">
					<code>{error.message}</code>
				</p>
				<p>Попробуйте перезагрузить страницу или вернуться позже.</p>
			</div>
		</section>
	);
};
