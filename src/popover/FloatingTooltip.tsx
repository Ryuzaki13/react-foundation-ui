import React, { useEffect, useRef } from "react";

import { arrow, flip, offset, shift, useFloating } from "@floating-ui/react";

import { FloatingArrow } from "../floating-arrow/FloatingArrow";

import styles from "./Popover.module.scss";

export function FloatingTooltip({ x, y, children }: { x: number; y: number; children: React.ReactNode }) {
	const arrowRef = useRef<HTMLDivElement | null>(null);

	const {
		refs,
		floatingStyles,
		middlewareData,
		placement: computedPlacement
	} = useFloating({
		strategy: "absolute",
		placement: "top",
		// eslint-disable-next-line react-hooks/refs
		middleware: [offset(6), flip(), shift({ padding: 16 }), arrow({ element: arrowRef })]
	});

	useEffect(() => {
		if (refs.setReference) {
			refs.setReference({
				getBoundingClientRect: () =>
					({
						x,
						y,
						width: 0,
						height: 0,
						top: y,
						left: x,
						bottom: y,
						right: x,
						toJSON: () => {}
					}) as DOMRect
			});
		}
	}, [x, y, refs]);

	return (
		<div ref={refs.setFloating} style={{ ...floatingStyles, position: "absolute", pointerEvents: "none" }} className={styles.tooltip}>
			{children}

			<FloatingArrow ref={arrowRef} placement={computedPlacement} middlewareData={middlewareData} />
		</div>
	);
}
