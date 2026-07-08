import React from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";

import { Disclosure, DisclosureProps } from "./Disclosure";
import styles from "./Disclosure.module.scss";

interface DisclosureGroupProps {
	children?:
		| (React.ReactElement<DisclosureProps, typeof Disclosure> | null | undefined | false)
		| (React.ReactElement<DisclosureProps, typeof Disclosure> | null | undefined | false)[];
	className?: string;
}

/**
 * Групповой контейнер для нескольких `Disclosure`. Помогает выстраивать последовательный список раскрывающихся секций.
 */
export function DisclosureGroup({ className, children }: DisclosureGroupProps) {
	return <div className={cn(styles.disclosureGroup, className)}>{children}</div>;
}
