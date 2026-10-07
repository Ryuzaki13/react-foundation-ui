import { type TextEditorCoreProps, TextEditorLexical } from "../index";

import styles from "./TextEditorCaretScrollExample.module.scss";

type TextEditorCaretScrollExampleProps = TextEditorCoreProps;

/** Scroll-host проверяет, что editable не распоряжается внешней прокруткой. */
export function TextEditorCaretScrollExample(props: TextEditorCaretScrollExampleProps) {
	return (
		<div className={styles.scrollHost}>
			<p>Прокрутите поверхность к редактору, оставив место ниже него.</p>
			<div className={styles.spacer} aria-hidden="true" />
			<TextEditorLexical {...props} presentation="compact" placeholder={null} />
			<div className={styles.spacer} aria-hidden="true" />
			<p>После нескольких Enter эта часть не должна приближаться к viewport.</p>
		</div>
	);
}
