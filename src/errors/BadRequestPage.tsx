import { HTTP_STATUS_BAD_REQUEST } from "./errorPageConstants";
import { PageError } from "./PageError";

export function BadRequestPage() {
	return (
		<PageError
			code={HTTP_STATUS_BAD_REQUEST}
			title="Некорректный запрос"
			description="Похоже, что запрос был сформирован неверно. Попробуйте обновить страницу или вернуться на главную."
		/>
	);
}
