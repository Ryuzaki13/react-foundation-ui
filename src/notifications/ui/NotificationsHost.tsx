import { NotificationType } from "@ryuzaki13/react-foundation-lib/notifications";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, TriangleAlertIcon, XIcon } from "lucide-react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { useNotifications, useNotify } from "../model/NotificationsProvider";

import styles from "./Notification.module.scss";

const notificationConfig: Record<
	NotificationType,
	{
		title: string;
		Icon: typeof InfoIcon;
	}
> = {
	info: {
		title: "Информация",
		Icon: InfoIcon
	},
	success: {
		title: "Успешно",
		Icon: CheckCircle2Icon
	},
	warning: {
		title: "Предупреждение",
		Icon: TriangleAlertIcon
	},
	error: {
		title: "Ошибка",
		Icon: AlertCircleIcon
	}
};

/**
 * Хост для визуального отображения очереди уведомлений.
 * Обычно монтируется один раз на уровне приложения рядом с провайдером уведомлений.
 */
export function NotificationsHost() {
	const items = useNotifications();
	const { dismiss } = useNotify();

	return (
		<div className={styles.container} aria-label="Область уведомлений" aria-live="polite" aria-relevant="additions text">
			{items.map((notification) => {
				const config = notificationConfig[notification.type];
				const title = notification.title ?? config.title;
				const Icon = config.Icon;

				return (
					<article
						key={notification.id}
						role={notification.type === "error" ? "alert" : "status"}
						aria-atomic="true"
						className={cn(styles.card, styles[notification.type])}>
						<FlexContainer align="start" justify="between" gap="sm" className={styles.header}>
							<FlexContainer align="start" gap="sm" className={styles.content}>
								<span className={styles.icon} aria-hidden="true">
									<Icon />
								</span>

								<div className={styles.copy}>
									<div className={styles.kicker}>{config.title}</div>
									{notification.title ? <div className={styles.title}>{title}</div> : null}
									<div className={styles.message}>{notification.message}</div>

									{notification.actions?.length ? (
										<div className={styles.actions}>
											{notification.actions.map((action) => (
												<Button
													key={action.label}
													tone={action.tone ?? notification.type}
													appearance="outline"
													data-ui="notification-action-button"
													data-action="notification-action"
													onClick={() => void action.onClick()}>
													{action.label}
												</Button>
											))}
										</div>
									) : null}
								</div>
							</FlexContainer>

							{notification.dismissible !== false ? (
								<Button
									icon={<XIcon />}
									appearance="ghost"
									tone={notification.type}
									onClick={() => dismiss(notification.id)}
									aria-label="Закрыть уведомление"
									data-ui="notification-dismiss-button"
									data-action="dismiss-notification"
								/>
							) : null}
						</FlexContainer>
					</article>
				);
			})}
		</div>
	);
}
