import { HTTP_STATUS_FORBIDDEN } from "./errorPageConstants";
import { PageError } from "./PageError";

export function ForbiddenPage() {
	return <PageError code={HTTP_STATUS_FORBIDDEN} title="Доступ запрещён" description="У вас нет прав для просмотра этой страницы." />;
}
