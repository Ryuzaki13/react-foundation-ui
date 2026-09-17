import { PageError } from "./PageError";

export function BadRequestPage() {
	return (
		<PageError
			code={400}
			title="Некорректный запрос"
			description="Похоже, что запрос был сформирован неверно. Попробуйте обновить страницу или вернуться на главную."
		/>
	);
}
