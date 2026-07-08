import React from "react";

export function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
	if (!ref) return;

	if (typeof ref === "function") {
		ref(value);
		return;
	}

	(ref as React.MutableRefObject<T>).current = value;
}

export function composeMouseHandlers<T extends HTMLElement>(
	userHandler: ((event: React.MouseEvent<T>) => void) | undefined,
	libraryHandler: (event: React.MouseEvent<T>) => void
) {
	return (event: React.MouseEvent<T>) => {
		userHandler?.(event);
		if (event.defaultPrevented) return;
		libraryHandler(event);
	};
}

export function composeKeyboardHandlers<T extends HTMLElement>(
	userHandler: ((event: React.KeyboardEvent<T>) => void) | undefined,
	libraryHandler: (event: React.KeyboardEvent<T>) => void
) {
	return (event: React.KeyboardEvent<T>) => {
		userHandler?.(event);
		if (event.defaultPrevented) return;
		libraryHandler(event);
	};
}
