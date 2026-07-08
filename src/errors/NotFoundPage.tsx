import { PageError } from "./PageError";

export const NotFoundPage: React.FC = () => {
	return <PageError code={404} title="Страница не найдена" description="Извините, запрашиваемая страница не существует" />;
};
