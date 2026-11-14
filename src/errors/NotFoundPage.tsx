import { HTTP_STATUS_NOT_FOUND } from "./errorPageConstants";
import { PageError } from "./PageError";

export function NotFoundPage() {
	return (
		<PageError code={HTTP_STATUS_NOT_FOUND} title="Страница не найдена" description="Извините, запрашиваемая страница не существует" />
	);
}
