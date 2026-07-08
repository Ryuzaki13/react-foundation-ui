import { PropsWithChildren } from "react";

interface SectionProps extends PropsWithChildren {
	title?: string;
	description?: string;
	className?: string;
}

export function Section({ title, description, className, children }: SectionProps) {
	return (
		<section className={className}>
			{title && <h3>{title}</h3>}
			{description && <p>{description}</p>}

			{children}
		</section>
	);
}
