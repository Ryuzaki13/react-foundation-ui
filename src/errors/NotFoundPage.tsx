import { PageError } from "./PageError";

export function NotFoundPage() {
	return <PageError code={404} title="Страница не найдена" description="Извините, запрашиваемая страница не существует" />;
}
