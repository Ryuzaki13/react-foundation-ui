import { type Meta, type StoryObj } from "@storybook/react-vite";

import { Badge } from "../../badge";
import { Button } from "../../button";
import { Section } from "../../panel";
import { StatusIndicator, type StatusIndicatorTone } from "../../status-indicator";
import { type UiTone } from "../../types";

import styles from "./ComponentGallery.module.scss";

const tones = [
	{ tone: "neutral", label: "Нейтральный" },
	{ tone: "accent", label: "Акцент" },
	{ tone: "brand", label: "Бренд" },
	{ tone: "info", label: "Информация" },
	{ tone: "success", label: "Успех" },
	{ tone: "warning", label: "Предупреждение" },
	{ tone: "error", label: "Ошибка" }
] as const satisfies ReadonlyArray<{ tone: UiTone; label: string }>;

// У декоративного индикатора нет тона brand: список отражает его публичный
// контракт, а видимая подпись передаёт смысл цвета независимо от темы.
const indicatorTones = [
	{ tone: "neutral", label: "Нейтральный" },
	{ tone: "info", label: "Информация" },
	{ tone: "success", label: "Успех" },
	{ tone: "warning", label: "Предупреждение" },
	{ tone: "error", label: "Ошибка" }
] as const satisfies ReadonlyArray<{ tone: StatusIndicatorTone; label: string }>;

const meta = {
	title: "Development/1. Solid и Outline",
	parameters: {
		atomicCanvas: true,
		layout: "fullscreen",
		docs: {
			description: {
				component: "Сравнение badge, button и status-indicator с заливкой, а также badge и button с контуром."
			}
		}
	}
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Одинаковые тона в двух секциях позволяют проверять общую цветовую систему. */
export const All: Story = {
	name: "Все компоненты",
	render: () => (
		<div className={styles.gallery}>
			<Section title="Solid" className={styles.section}>
				<h4 className={styles.subheading}>badge</h4>
				<div className={styles.row}>
					{tones.map(({ tone, label }) => (
						<Badge key={tone} tone={tone} appearance="solid">
							{label}
						</Badge>
					))}
				</div>
				<h4 className={styles.subheading}>button</h4>
				<div className={styles.row}>
					{tones.map(({ tone, label }) => (
						<Button key={tone} type="button" tone={tone} appearance="solid">
							{label}
						</Button>
					))}
					<Button type="button" tone="neutral" appearance="solid" disabled>
						Недоступно
					</Button>
				</div>
				<h4 className={styles.subheading}>status-indicator</h4>
				<div className={styles.row}>
					{indicatorTones.map(({ tone, label }) => (
						<span key={tone} className={styles.row}>
							<StatusIndicator tone={tone} />
							{label}
						</span>
					))}
				</div>
			</Section>
			<Section title="Outline" className={styles.section}>
				<h4 className={styles.subheading}>badge</h4>
				<div className={styles.row}>
					{tones.map(({ tone, label }) => (
						<Badge key={tone} tone={tone} appearance="outline">
							{label}
						</Badge>
					))}
				</div>
				<h4 className={styles.subheading}>button</h4>
				<div className={styles.row}>
					{tones.map(({ tone, label }) => (
						<Button key={tone} type="button" tone={tone} appearance="outline">
							{label}
						</Button>
					))}
					<Button type="button" tone="neutral" appearance="outline" disabled>
						Недоступно
					</Button>
				</div>
			</Section>
		</div>
	)
};
