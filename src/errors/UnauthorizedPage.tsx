import { PageError } from "./PageError";

export const UnauthorizedPage: React.FC = () => {
	return (
		<PageError
			code={401}
			title="Необходима авторизация"
			description="Для доступа к этой странице нужно войти в систему. Пожалуйста, авторизуйтесь и попробуйте снова."
		/>
	);
};
