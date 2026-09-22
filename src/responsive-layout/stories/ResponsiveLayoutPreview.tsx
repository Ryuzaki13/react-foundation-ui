import type { ReactNode } from "react";

import styles from "./ResponsiveLayoutPreview.module.scss";

type ResponsiveLayoutPreviewProps = {
	title: string;
	description: string;
	legend: readonly ReactNode[];
	children: ReactNode;
};

/** Общая рамка stories показывает CSS-режим, не повторяя breakpoint-значения в TypeScript. */
export function ResponsiveLayoutPreview({ title, description, legend, children }: ResponsiveLayoutPreviewProps) {
	return (
		<section className={styles.frame}>
			<header className={styles.header}>
				<h2 className={styles.title}>{title}</h2>
				<p className={styles.description}>{description}</p>
				<span className={styles.breakpoint} aria-label="Активный CSS breakpoint">
					Активный режим:
				</span>
				<ul className={styles.legend}>
					{legend.map((item, index) => (
						<li key={index}>{item}</li>
					))}
				</ul>
			</header>
			<div className={styles.content}>{children}</div>
		</section>
	);
}
