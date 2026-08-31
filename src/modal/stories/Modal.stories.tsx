import { useState } from "react";

import { useArgs } from "storybook/preview-api";
import { fn } from "storybook/test";

import { Button } from "../../button";
import { Input } from "../../input";
import { Modal, ModalContent, ModalFooter, ModalManagerProvider, ModalToolbar } from "../index";

import type { Meta, StoryObj } from "@storybook/react-vite";

type ModalStoryArgs = React.ComponentProps<typeof Modal>;

function StoryCanvas({ children }: { children: React.ReactNode }) {
	return (
		<div
			style={{
				minHeight: "60dvh",
				padding: 24,
				display: "flex",
				alignItems: "center",
				justifyContent: "center"
			}}>
			{children}
		</div>
	);
}

function DemoFormContent() {
	const [name, setName] = useState("Алексей");
	const [department, setDepartment] = useState("Департамент автоматизации бизнеса");

	return (
		<div style={{ display: "grid", gap: 16 }}>
			<Input label="Имя" value={name} onChange={setName} placeholder="Введите имя" />
			<Input label="Подразделение" value={department} onChange={setDepartment} placeholder="Введите подразделение" />
			<div
				style={{
					padding: 12,
					borderRadius: 8,
					background: "var(--surface-1)",
					border: "1px solid var(--border-1)"
				}}>
				Текущие значения: {name || "не указано"}, {department || "не указано"}
			</div>
		</div>
	);
}

const meta = {
	title: "UI/Modal",
	component: Modal,
	parameters: {
		atomicCanvas: true,
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"Композиционная модалка с `Toolbar`, `Content` и `Footer`, поддержкой focus trap, возврата фокуса, закрытия по `Escape` и менеджером стека через `ModalManagerProvider`."
			}
		}
	},
	decorators: [
		(story) => (
			<ModalManagerProvider>
				<StoryCanvas>{story()}</StoryCanvas>
			</ModalManagerProvider>
		)
	],
	args: {
		isOpen: false,
		title: "Редактирование профиля",
		size: "md",
		height: undefined,
		onClose: fn(),
		children: (
			<>
				<ModalContent>
					<DemoFormContent />
				</ModalContent>
				<ModalFooter>
					<Button variant="transparent">Отмена</Button>
					<Button>Сохранить</Button>
				</ModalFooter>
			</>
		)
	},
	argTypes: {
		isOpen: {
			description: "Управляет видимостью модального окна.",
			control: "boolean"
		},
		title: {
			description: "Заголовок модального окна.",
			control: "text"
		},
		size: {
			description: "Предустановленный размер модального окна.",
			control: "inline-radio",
			options: ["sm", "md", "lg", "xl", "inside"]
		},
		height: {
			description: "Явная высота body-области модалки.",
			control: "text"
		},
		onClose: {
			description: "Вызывается при закрытии по кнопке, `Escape` или пользовательскому действию.",
			control: false
		},
		children: {
			description: "Композиция из `ModalToolbar`, `ModalContent`, `ModalFooter`.",
			control: false
		}
	}
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function useModalStoryArgs() {
	const [args, updateArgs] = useArgs<ModalStoryArgs>();

	return {
		args,
		updateArgs,
		close: () => {
			args.onClose();
			updateArgs({ isOpen: false });
		}
	};
}

export const Controlled: Story = {
	name: "Управляемая модалка",
	render: function Render() {
		const { args, close, updateArgs } = useModalStoryArgs();

		return (
			<>
				<Button onClick={() => updateArgs({ isOpen: true })}>Открыть модалку</Button>
				<Modal {...args} isOpen={args.isOpen} onClose={close}>
					<ModalContent>
						<DemoFormContent />
					</ModalContent>
					<ModalFooter>
						<Button variant="transparent" onClick={close}>
							Отмена
						</Button>
						<Button onClick={close}>Сохранить</Button>
					</ModalFooter>
				</Modal>
			</>
		);
	}
};

export const WithToolbarAndFooter: Story = {
	name: "Полная композиция",
	args: {
		title: "Редактирование профиля",
		height: "min(34rem, 70dvh)"
	},
	render: function Render() {
		const { args, close, updateArgs } = useModalStoryArgs();

		return (
			<>
				<Button onClick={() => updateArgs({ isOpen: true })}>Открыть сценарий редактирования</Button>
				<Modal {...args} isOpen={args.isOpen} onClose={close}>
					<ModalToolbar>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								gap: 12,
								padding: 12,
								borderRadius: 8,
								background: "var(--surface-1)",
								border: "1px solid var(--border-1)"
							}}>
							<div>
								<div style={{ fontWeight: 600 }}>Черновик обновлён автоматически</div>
								<div style={{ opacity: 0.72 }}>Последнее сохранение: 2 минуты назад</div>
							</div>
							<Button variant="transparent">Сбросить</Button>
						</div>
					</ModalToolbar>
					<ModalContent>
						<DemoFormContent />
					</ModalContent>
					<ModalFooter>
						<Button variant="transparent" onClick={close}>
							Отмена
						</Button>
						<Button variant="success" onClick={close}>
							Применить
						</Button>
					</ModalFooter>
				</Modal>
			</>
		);
	}
};

export const ScrollableContent: Story = {
	name: "Длинный контент",
	args: {
		size: "lg",
		height: "min(38rem, 75dvh)",
		title: "Журнал изменений"
	},
	render: function Render() {
		const { args, close, updateArgs } = useModalStoryArgs();

		return (
			<>
				<Button onClick={() => updateArgs({ isOpen: true })}>Открыть длинный контент</Button>
				<Modal {...args} isOpen={args.isOpen} onClose={close}>
					<ModalContent>
						<div style={{ display: "grid", gap: 12 }}>
							{Array.from({ length: 18 }, (_, index) => (
								<div
									key={index}
									style={{
										padding: 12,
										borderRadius: 8,
										border: "1px solid var(--border-1)",
										background: "var(--surface-1)"
									}}>
									<div style={{ fontWeight: 600 }}>Событие #{index + 1}</div>
									<div style={{ opacity: 0.72 }}>
										Пользователь обновил настройки карточки, изменил состав полей и подтвердил сохранение конфигурации.
									</div>
								</div>
							))}
						</div>
					</ModalContent>
					<ModalFooter>
						<Button onClick={close}>Закрыть</Button>
					</ModalFooter>
				</Modal>
			</>
		);
	}
};

export const Sizes: Story = {
	name: "Размеры",
	args: {
		size: "sm",
		title: "Размер SM"
	},
	render: function Render() {
		const { args, close, updateArgs } = useModalStoryArgs();

		return (
			<>
				<div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
					{(["sm", "md", "lg", "xl", "inside"] as const).map((size) => (
						<Button
							key={size}
							variant="transparent"
							onClick={() => updateArgs({ isOpen: true, size, title: `Размер ${size.toUpperCase()}` })}>
							{size.toUpperCase()}
						</Button>
					))}
				</div>

				<Modal {...args} isOpen={args.isOpen} onClose={close}>
					<ModalContent>
						<div style={{ display: "grid", gap: 12 }}>
							<div>Этот сценарий помогает быстро сравнить ширину и поведение модалки для разных размеров.</div>
							<div style={{ opacity: 0.72 }}>Проверьте отступы, читабельность и поведение при `Escape`.</div>
						</div>
					</ModalContent>
					<ModalFooter>
						<Button onClick={close}>Понятно</Button>
					</ModalFooter>
				</Modal>
			</>
		);
	}
};

export const StackedModals: Story = {
	name: "Стек модалок",
	args: {
		size: "lg",
		title: "Первая модалка"
	},
	render: function Render() {
		const { args, updateArgs } = useModalStoryArgs();
		const [innerOpen, setInnerOpen] = useState(false);
		const closeOuter = () => {
			setInnerOpen(false);
			args.onClose();
			updateArgs({ isOpen: false });
		};

		return (
			<>
				<Button onClick={() => updateArgs({ isOpen: true })}>Открыть первую модалку</Button>

				<Modal {...args} isOpen={args.isOpen} onClose={closeOuter}>
					<ModalContent>
						<div style={{ display: "grid", gap: 16 }}>
							<div>Откройте вторую модалку и проверьте, что `Escape` закрывает только верхний слой.</div>
							<Button variant="transparent" onClick={() => setInnerOpen(true)}>
								Открыть вторую модалку
							</Button>
						</div>
					</ModalContent>
					<ModalFooter>
						<Button variant="transparent" onClick={closeOuter}>
							Закрыть первую
						</Button>
					</ModalFooter>
				</Modal>

				<Modal isOpen={innerOpen} onClose={() => setInnerOpen(false)} size="sm" title="Вторая модалка">
					<ModalContent>
						<div style={{ display: "grid", gap: 12 }}>
							<div>Эта модалка должна считаться верхней в стеке.</div>
							<Input label="Короткое поле" value="Фокус внутри" onChange={() => {}} />
						</div>
					</ModalContent>
					<ModalFooter>
						<Button onClick={() => setInnerOpen(false)}>Закрыть вторую</Button>
					</ModalFooter>
				</Modal>
			</>
		);
	}
};
