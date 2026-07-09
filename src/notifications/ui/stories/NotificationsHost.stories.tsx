import type { CSSProperties, PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";

import { BellRingIcon, CheckIcon, InfoIcon, RefreshCwIcon, TimerResetIcon, Trash2Icon, TriangleAlertIcon, XCircleIcon } from "lucide-react";

import { Button } from "../../../button";
import { NotificationsProvider, useNotify } from "../../model";
import { NotificationsHost } from "../NotificationsHost";

import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
	title: "Shared/UI/Notifications",
	component: NotificationsHost,
	parameters: {
		atomicCanvas: true,
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Компонент отображает очередь глобальных уведомлений поверх интерфейса. Истории ниже показывают внешний вид для разных статусов, работу автозакрытия, ограничение очереди и сценарий длительной операции с обновлением одного уведомления."
			}
		}
	}
} satisfies Meta<typeof NotificationsHost>;

export default meta;
type Story = StoryObj<typeof meta>;

const shellStyle: CSSProperties = {
	minHeight: "100vh",
	padding: "32px 24px 160px",
	background: "linear-gradient(180deg, color-mix(in srgb, var(--surface-1) 82%, transparent) 0%, var(--surface-0) 100%)",
	color: "var(--content-0)"
};

const contentStyle: CSSProperties = {
	maxWidth: 1120,
	margin: "0 auto",
	display: "grid",
	gap: 16
};

const introStyle: CSSProperties = {
	padding: 20,
	border: "var(--border)",
	borderRadius: "var(--radius-md)",
	background: "var(--surface-0)",
	boxShadow: "var(--shadow-sm)"
};

const panelGridStyle: CSSProperties = {
	display: "grid",
	gap: 16,
	gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
};

const panelStyle: CSSProperties = {
	padding: 20,
	border: "var(--border)",
	borderRadius: "var(--radius-md)",
	background: "var(--surface-0)",
	boxShadow: "var(--shadow-sm)",
	display: "grid",
	gap: 12,
	alignContent: "start"
};

const buttonGridStyle: CSSProperties = {
	display: "flex",
	flexWrap: "wrap",
	gap: 10
};

function NotificationsStateReset() {
	const { clear } = useNotify();

	useEffect(() => {
		clear();

		return () => {
			clear();
		};
	}, [clear]);

	return null;
}

function NotificationsStoryShell({ children }: PropsWithChildren) {
	return (
		<NotificationsProvider>
			<NotificationsStateReset />

			<div style={shellStyle}>
				<div style={contentStyle}>
					<div style={introStyle}>
						<h2 style={{ margin: 0, fontSize: "var(--font-size-xl)" }}>Демонстрация очереди уведомлений</h2>
						<p style={{ margin: "12px 0 0", color: "var(--content-1)" }}>
							Хост закреплён в левом нижнем углу и использует общие токены проекта: `surface`, `content`, `status` и
							семантические `tone-*`. Внутри историй можно проверить лимит очереди, sticky-уведомления и сценарий длительной
							операции с обновлением одного уведомления.
						</p>
					</div>

					{children}
				</div>
			</div>

			<NotificationsHost />
		</NotificationsProvider>
	);
}

function ShowcaseSeed() {
	const { clear, push } = useNotify();

	useEffect(() => {
		clear();

		push({
			type: "info",
			title: "Сетевой статус",
			message: "Подключение к серверу восстановлено.",
			ttlMs: 6000
		});
		push({
			type: "success",
			title: "Профиль обновлён",
			message: "Изменения сохранены и отправлены в очередь на синхронизацию.",
			ttlMs: 4500
		});
		push({
			type: "warning",
			title: "Требуется внимание",
			message: "Срок действия сессии истекает через 5 минут."
		});
		push({
			type: "error",
			title: "Ошибка импорта",
			message: "Не удалось загрузить журнал операций.\nПовторите запрос или обратитесь к администратору."
		});

		return () => {
			clear();
		};
	}, [clear, push]);

	return (
		<div style={panelStyle}>
			<h3 style={{ margin: 0 }}>Снимок состояний</h3>
			<p style={{ margin: 0, color: "var(--content-1)" }}>
				История сразу заполняет очередь всеми типами уведомлений, чтобы оценить цвет, иконки, контраст и читаемость текста.
			</p>
		</div>
	);
}

function PlaygroundPanel() {
	const api = useNotify();
	const progressIdRef = useRef<string | null>(null);
	const [hasProgress, setHasProgress] = useState(false);

	const resetProgress = () => {
		progressIdRef.current = null;
		setHasProgress(false);
	};

	const updateProgress = (message: string, patch?: { type?: "success" | "error"; ttlMs?: number; dismissible?: boolean }) => {
		const progressId = progressIdRef.current;
		if (!progressId) return;

		const updated = api.update(progressId, {
			message,
			...patch
		});

		if (!updated || patch?.type) {
			resetProgress();
		}
	};

	return (
		<div style={panelGridStyle}>
			<section style={panelStyle}>
				<h3 style={{ margin: 0 }}>Базовые сценарии</h3>
				<p style={{ margin: 0, color: "var(--content-1)" }}>
					Вызовы через `useNotify` подходят для UI-логики внутри React-компонентов.
				</p>

				<div style={buttonGridStyle}>
					<Button
						tone="info"
						appearance="outline"
						icon={<InfoIcon />}
						onClick={() =>
							api.info("Справочник обновлён по расписанию.", {
								title: "Информация",
								ttlMs: 3500
							})
						}>
						Info
					</Button>

					<Button
						tone="success"
						appearance="solid"
						icon={<CheckIcon />}
						onClick={() =>
							api.success("Изменения сохранены.", {
								title: "Операция завершена",
								ttlMs: 2500
							})
						}>
						Success
					</Button>

					<Button
						tone="warning"
						appearance="outline"
						icon={<TriangleAlertIcon />}
						onClick={() =>
							api.warning("Подтвердите действие в течение 2 минут.", {
								title: "Требуется подтверждение",
								dismissible: false
							})
						}>
						Sticky warning
					</Button>

					<Button
						tone="error"
						appearance="solid"
						icon={<XCircleIcon />}
						onClick={() =>
							api.error("Сервис проверки подписей недоступен.", {
								title: "Критическая ошибка"
							})
						}>
						Error
					</Button>
				</div>
			</section>

			<section style={panelStyle}>
				<h3 style={{ margin: 0 }}>Долгая операция</h3>
				<p style={{ margin: 0, color: "var(--content-1)" }}>
					Сценарий имитирует `notify.progress`: создаёт одно sticky-уведомление и затем обновляет его по тому же `id`.
				</p>

				<div style={buttonGridStyle}>
					<Button
						variant="neutralOutline"
						icon={<BellRingIcon />}
						onClick={() => {
							const progressId = api.push({
								type: "info",
								title: "Экспорт архива",
								message: "Подготавливаю пакет документов...",
								dismissible: false
							});

							progressIdRef.current = progressId;
							setHasProgress(true);
						}}>
						Запустить
					</Button>

					<Button
						variant="neutralOutline"
						icon={<RefreshCwIcon />}
						onClick={() => {
							updateProgress("Обработано 68% записей. Формирую итоговый архив...");
						}}
						disabled={!hasProgress}>
						Обновить прогресс
					</Button>

					<Button
						tone="success"
						appearance="outline"
						icon={<CheckIcon />}
						onClick={() => {
							updateProgress("Архив подготовлен и доступен для скачивания.", {
								type: "success",
								ttlMs: 2500,
								dismissible: true
							});
						}}
						disabled={!hasProgress}>
						Завершить успешно
					</Button>

					<Button
						tone="error"
						appearance="outline"
						icon={<XCircleIcon />}
						onClick={() => {
							updateProgress("Не удалось собрать архив из-за ошибки чтения вложений.", {
								type: "error",
								ttlMs: 5000,
								dismissible: true
							});
						}}
						disabled={!hasProgress}>
						Завершить ошибкой
					</Button>
				</div>
			</section>

			<section style={panelStyle}>
				<h3 style={{ margin: 0 }}>Очередь и очистка</h3>
				<p style={{ margin: 0, color: "var(--content-1)" }}>
					Стор сохраняет не более 6 уведомлений. Кнопка ниже специально создаёт 8 элементов, чтобы проверить отсечение старых
					записей.
				</p>

				<div style={buttonGridStyle}>
					<Button
						variant="neutralOutline"
						icon={<RefreshCwIcon />}
						onClick={() => {
							for (let index = 1; index <= 8; index += 1) {
								api.info(`Пакет ${index} поставлен в очередь на обработку.`, {
									title: `Задача ${index}`,
									ttlMs: 8000
								});
							}
						}}>
						Заполнить очередь
					</Button>

					<Button
						tone="info"
						appearance="outline"
						icon={<TimerResetIcon />}
						onClick={() =>
							api.info("Это уведомление исчезнет автоматически через 2 секунды.", {
								title: "TTL = 2000 мс",
								ttlMs: 2000
							})
						}>
						Проверить TTL
					</Button>

					<Button
						variant="transparent"
						icon={<Trash2Icon />}
						onClick={() => {
							resetProgress();
							api.clear();
						}}>
						Очистить всё
					</Button>
				</div>
			</section>
		</div>
	);
}

export const Showcase: Story = {
	render: () => (
		<NotificationsStoryShell>
			<ShowcaseSeed />
		</NotificationsStoryShell>
	),
	parameters: {
		docs: {
			description: {
				story: "Быстрый визуальный обзор: все статусы сразу добавляются в очередь после открытия истории."
			}
		}
	}
};

export const InteractivePlayground: Story = {
	render: () => (
		<NotificationsStoryShell>
			<PlaygroundPanel />
		</NotificationsStoryShell>
	),
	parameters: {
		docs: {
			description: {
				story: "Интерактивный сценарий для проверки базовых уведомлений, длительной операции, лимита очереди и автозакрытия."
			}
		}
	}
};
