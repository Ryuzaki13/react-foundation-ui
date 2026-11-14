import { useEffect, useState } from "react";

import { captureRuntimeErrorReport } from "@ryuzaki13/react-foundation-lib/error-report";
import { logError } from "@ryuzaki13/react-foundation-lib/utils";
import { useQueryClient } from "@tanstack/react-query";

import { FlexContainer } from "../flex";

import { BadRequestPage } from "./BadRequestPage";
import { BoomExplosion } from "./BoomExplosion";
import { ERROR_BOOM_MESSAGES } from "./constants";
import { HTTP_STATUS_BAD_REQUEST, HTTP_STATUS_FORBIDDEN, HTTP_STATUS_NOT_FOUND, REACT_ERROR_REPORT_CATEGORY } from "./errorPageConstants";
import { ForbiddenPage } from "./ForbiddenPage";
import { NotFoundPage } from "./NotFoundPage";

function getHttpStatusCode(error: Error): number | undefined {
	if (!("status" in error) || typeof error.status !== "number") return undefined;
	return error.status;
}

export function ErrorDisplay({ error, componentStack, draftId }: { error: Error; componentStack?: string; draftId?: string | null }) {
	const [randomValue] = useState(() => Math.random());
	const queryClient = useQueryClient();

	useEffect(() => {
		if (draftId !== undefined) return;

		void captureRuntimeErrorReport(
			error,
			{
				category: REACT_ERROR_REPORT_CATEGORY,
				componentStack
			},
			queryClient
		);
	}, [componentStack, draftId, error, queryClient]);

	const httpStatusCode = getHttpStatusCode(error);

	if (httpStatusCode) {
		switch (httpStatusCode) {
			case HTTP_STATUS_BAD_REQUEST:
				return <BadRequestPage />;
			case HTTP_STATUS_FORBIDDEN:
				return <ForbiddenPage />;
			case HTTP_STATUS_NOT_FOUND:
				return <NotFoundPage />;
		}
	}

	logError(error.stack);

	return (
		<FlexContainer column justify="center" as="section" className="w100 h100 paddingMd">
			<div aria-hidden="true" className="textCenter relative fontBolded statusError" style={{ fontSize: "4em", marginBlock: "2em" }}>
				<BoomExplosion />
				<div
					style={{
						zIndex: 1,
						position: "relative",
						textShadow: "1px -1px 1px var(--warning-text), -1px 1px 1px var(--info-text)"
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
		</FlexContainer>
	);
}
