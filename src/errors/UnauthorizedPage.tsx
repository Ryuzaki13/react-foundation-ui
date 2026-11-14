import { HTTP_STATUS_UNAUTHORIZED } from "./errorPageConstants";
import { PageError } from "./PageError";

export function UnauthorizedPage() {
	return (
		<PageError
			code={HTTP_STATUS_UNAUTHORIZED}
			title="Необходима авторизация"
			description="Для доступа к этой странице нужно войти в систему. Пожалуйста, авторизуйтесь и попробуйте снова."
		/>
	);
}
