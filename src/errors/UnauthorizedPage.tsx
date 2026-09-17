import { PageError } from "./PageError";

export function UnauthorizedPage() {
	return (
		<PageError
			code={401}
			title="Необходима авторизация"
			description="Для доступа к этой странице нужно войти в систему. Пожалуйста, авторизуйтесь и попробуйте снова."
		/>
	);
}
