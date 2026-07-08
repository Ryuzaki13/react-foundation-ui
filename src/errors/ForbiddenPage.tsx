import { PageError } from "./PageError";

export const ForbiddenPage: React.FC = () => {
	return <PageError code={403} title="Доступ запрещён" description="У вас нет прав для просмотра этой страницы." />;
};
