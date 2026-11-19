import { type ReactNode, useState } from "react";

import { type MediaViewerVideo } from "../model/imageViewerTypes";

import styles from "./ImageViewer.module.scss";

/** Браузеры сообщают об ошибках как на video, так и на вложенном source. */
export function VideoSlideFrame({
	children,
	download
}: {
	readonly children: ReactNode;
	readonly download?: MediaViewerVideo["download"];
}) {
	const [failed, setFailed] = useState(false);

	if (failed) {
		return (
			<div role="alert" className={styles.videoError}>
				<p>Не удалось воспроизвести видео. Откройте файл ещё раз.</p>
				{download && (
					<a href={download.url} download={download.filename}>
						Скачать оригинал
					</a>
				)}
			</div>
		);
	}

	return (
		<div className={styles.videoFrame} onErrorCapture={() => setFailed(true)}>
			{children}
		</div>
	);
}
