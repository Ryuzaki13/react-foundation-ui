import { useState } from "react";

import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Section } from "../../panel";
import { RadioGroup } from "../../radio-group";
import { Switch } from "../../switch";
import { TabsBox } from "../../tabs";
import { Toggle } from "../../toggle";

import styles from "./ComponentGallery.module.scss";

const meta = {
	title: "Development/4. Переключатели и вкладки",
	parameters: {
		atomicCanvas: true,
		layout: "fullscreen",
		docs: {
			description: {
				component: "Совместная витрина групп выбора, переключателей и вкладок для проверки смены режима и активного состояния."
			}
		}
	}
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
	render: function StateControls() {
		// Образцы не связывают значения: каждый контрол демонстрирует собственный сценарий переключения.
		const [radioValue, setRadioValue] = useState("daily");
		const [enabledSwitch, setEnabledSwitch] = useState(true);
		const [switchOff, setSwitchOff] = useState(false);
		const [autoSwitch, setAutoSwitch] = useState<boolean | undefined>(undefined);
		const [unavailableSwitch, setUnavailableSwitch] = useState(true);
		const [enabledToggle, setEnabledToggle] = useState(true);
		const [toggleOff, setToggleOff] = useState(false);
		const [unavailableToggle, setUnavailableToggle] = useState(true);
		const [horizontalTab, setHorizontalTab] = useState("overview");
		const [verticalTab, setVerticalTab] = useState("profile");

		return (
			<div className={styles.gallery}>
				<Section title="radio-group" className={styles.section}>
					<RadioGroup label="Период уведомлений" orientation="vertical" value={radioValue} onChange={setRadioValue}>
						<RadioGroup.Option value="daily" label="Ежедневно" description="Сводка за день" />
						<RadioGroup.Option value="weekly" label="Еженедельно" description="Сводка за неделю" />
						<RadioGroup.Option value="monthly" label="Ежемесячно" description="Сводка за месяц" />
					</RadioGroup>

					<RadioGroup disabled label="Период уведомлений" orientation="horizontal" value={radioValue} onChange={setRadioValue}>
						<RadioGroup.Option value="daily" label="Ежедневно" />
						<RadioGroup.Option value="weekly" label="Еженедельно" />
						<RadioGroup.Option value="monthly" label="Ежемесячно" />
					</RadioGroup>
				</Section>
				<Section title="switch" className={styles.section}>
					<div className={styles.stack}>
						<Switch label="Включённый переключатель" value={enabledSwitch} onChange={setEnabledSwitch} />
						<Switch label="Выключенный переключатель" value={switchOff} onChange={setSwitchOff} />
						<Switch
							label="Автоматический режим"
							description="Три состояния: автоматически, включено и выключено."
							value={autoSwitch}
							onChange={setAutoSwitch}
							triState
						/>
						<Switch label="Недоступный переключатель" value={unavailableSwitch} onChange={setUnavailableSwitch} disabled />
					</div>
				</Section>
				<Section title="toggle" className={styles.section}>
					<div className={styles.stack}>
						<Toggle label="Включённый режим" value={enabledToggle} onChange={setEnabledToggle} />
						<Toggle label="Выключенный режим" value={toggleOff} onChange={setToggleOff} labelPosition="after" />
						<Toggle label="Недоступный режим" value={unavailableToggle} onChange={setUnavailableToggle} disabled />
					</div>
				</Section>
				<Section title="tabs" className={styles.section}>
					<div className={styles.stack}>
						<h4 className={styles.subheading}>Горизонтальные вкладки</h4>
						<TabsBox
							aria-label="Горизонтальные вкладки"
							value={horizontalTab}
							onValueChange={setHorizontalTab}
							items={[
								{ id: "overview", title: "Обзор", content: "Основные сведения о выбранном разделе." },
								{ id: "settings", title: "Настройки", content: "Параметры выбранного раздела." },
								{ id: "history", title: "История", content: "История изменений и действий." },
								{ id: "archive", title: "Архив", content: "Архив раздела.", disabled: true }
							]}
						/>
						<h4 className={styles.subheading}>Вертикальные вкладки</h4>
						<TabsBox
							aria-label="Вертикальные вкладки"
							orientation="vertical"
							value={verticalTab}
							onValueChange={setVerticalTab}
							items={[
								{ id: "profile", title: "Профиль", content: "Данные пользователя." },
								{ id: "notifications", title: "Уведомления", content: "Предпочтения уведомлений." },
								{ id: "access", title: "Доступ", content: "Настройки доступа." }
							]}
						/>
					</div>
				</Section>
			</div>
		);
	}
};
