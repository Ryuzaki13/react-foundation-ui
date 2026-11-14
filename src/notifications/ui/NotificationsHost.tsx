import { type NotificationType } from "@ryuzaki13/react-foundation-lib/notifications";
import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, TriangleAlertIcon, XIcon } from "lucide-react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { UI_APPEARANCE_GHOST, UI_APPEARANCE_OUTLINE } from "../../uiSchemeConstants";
import { useNotifications, useNotify } from "../model";
import {
	NOTIFICATION_TYPE_SUCCESS,
	NOTIFICATION_TYPE_INFO,
	NOTIFICATION_TYPE_WARNING,
	NOTIFICATION_TYPE_ERROR
} from "../model/notificationTypeConstants";

import styles from "./Notification.module.scss";

const notificationConfig: Record<
	NotificationType,
	{
		title: string;
		Icon: typeof InfoIcon;
	}
> = {
	[NOTIFICATION_TYPE_INFO]: {
		title: "Информация",
		Icon: InfoIcon
	},
	[NOTIFICATION_TYPE_SUCCESS]: {
		title: "Успешно",
		Icon: CheckCircle2Icon
	},
	[NOTIFICATION_TYPE_WARNING]: {
		title: "Предупреждение",
		Icon: TriangleAlertIcon
	},
	[NOTIFICATION_TYPE_ERROR]: {
		title: "Ошибка",
		Icon: AlertCircleIcon
	}
};

/**
 * Хост для визуального отображения активного toast-стека.
 * Обычно монтируется один раз на уровне приложения рядом с провайдером уведомлений.
 * Полную историю host-проект отображает отдельно через useNotificationHistory.
 */
export function NotificationsHost() {
	const items = useNotifications();
	const { dismiss } = useNotify();

	return (
		<section className={styles.container} aria-label="Область уведомлений">
			{items.map((notification) => {
				const config = notificationConfig[notification.type];
				const title = notification.title ?? config.title;
				const Icon = config.Icon;

				return (
					<div
						key={notification.id}
						role={notification.type === NOTIFICATION_TYPE_ERROR ? "alert" : "status"}
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
													appearance={UI_APPEARANCE_OUTLINE}
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
									appearance={UI_APPEARANCE_GHOST}
									tone={notification.type}
									onClick={() => dismiss(notification.id)}
									aria-label={`Закрыть уведомление «${title}»`}
									data-ui="notification-dismiss-button"
									data-action="dismiss-notification"
								/>
							) : null}
						</FlexContainer>
					</div>
				);
			})}
		</section>
	);
}
