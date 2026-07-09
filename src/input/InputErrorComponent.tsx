import styles from "../ui.module.scss";

interface InputErrorComponentProps {
	text: string;
}

export function InputErrorComponent({ text }: InputErrorComponentProps) {
	return <div className={styles.uiErrorElement}>{text}</div>;
}
