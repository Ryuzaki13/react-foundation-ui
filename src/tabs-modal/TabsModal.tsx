import { type JSX } from "react";

import { type ModalProps } from "../modal/Modal";
import { ModalCloseButton } from "../modal/ModalCloseButton";
import { ModalFrame } from "../modal/ModalFrame";
import { TabsLayout, type TabsLayoutProps } from "../tabs";
import { TabsLayoutView } from "../tabs/ui/TabsLayoutView";

import styles from "./TabsModal.module.scss";

export type TabsModalProps = Pick<ModalProps, "isOpen" | "size" | "height" | "onClose"> &
	Pick<TabsLayoutProps, "children" | "value" | "defaultValue" | "onValueChange" | "activationMode" | "loop"> & {
		/** Доступное имя окна: отдельный видимый заголовок не выводится. */
		title: string;
	};

type TabsModalComponent = ((props: TabsModalProps) => JSX.Element) & Pick<typeof TabsLayout, "Tab" | "Toolbar" | "Content" | "Footer">;

/**
 * Экспериментальное окно с горизонтальными вкладками. Общий каркас отвечает за модальность,
 * а прокруткой и секциями содержимого управляет активная вкладка.
 * При переключении содержимое предыдущей вкладки размонтируется.
 */
export const TabsModal: TabsModalComponent = Object.assign(
	function TabsModal({ isOpen, size, height, onClose, title, ...tabsProps }: TabsModalProps) {
		return (
			<ModalFrame isOpen={isOpen} size={size} height={height} onClose={onClose} aria-label={title} className={styles.frame}>
				<TabsLayoutView {...tabsProps} mountStrategy="unmount" tabBarAction={<ModalCloseButton onClose={onClose} />} />
			</ModalFrame>
		);
	},
	{
		Tab: TabsLayout.Tab,
		Toolbar: TabsLayout.Toolbar,
		Content: TabsLayout.Content,
		Footer: TabsLayout.Footer
	}
);
