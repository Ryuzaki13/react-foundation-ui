// @vitest-environment jsdom

import { act } from "react";

import { type DateRangeInput } from "@ryuzaki13/react-foundation-lib/formatters";
import { fireEvent } from "@testing-library/dom";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";

import { CalendarDayView } from "./CalendarDayView";
import styles from "./CalendarDayView.module.scss";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement | null = null;
let root: Root | null = null;

async function renderCalendar(value: DateRangeInput, selectsRange = false) {
	container = document.createElement("div");
	document.body.appendChild(container);
	root = createRoot(container);

	await act(async () => {
		root?.render(
			<CalendarDayView
				now={new Date(2026, 6, 10)}
				currentDate={new Date(2026, 6, 2)}
				value={value}
				onChange={() => undefined}
				selectsRange={selectsRange}
				selectionMode="week"
				weekEndDay="saturday"
			/>
		);
	});
}

function getFirstCalendarWeek(): HTMLButtonElement[] {
	const week = container?.querySelector(`.${styles.week}`);
	return Array.from(week?.querySelectorAll<HTMLButtonElement>("button") ?? []);
}

afterEach(async () => {
	if (root) {
		await act(async () => {
			root?.unmount();
		});
		root = null;
	}

	container?.remove();
	container = null;
});

describe("CalendarDayView", () => {
	it("отмечает выбранными дни одиночной недели до включительной границы", async () => {
		await renderCalendar(new Date(2026, 6, 2));

		const weekDays = getFirstCalendarWeek();

		expect(weekDays).toHaveLength(7);
		expect(weekDays.slice(0, 6).every((day) => day.getAttribute("aria-pressed") === "true")).toBe(true);
		expect(weekDays[6]?.getAttribute("aria-pressed")).toBe("false");
	});

	it("показывает preview всей одиночной недели при наведении", async () => {
		await renderCalendar(null);

		const weekDays = getFirstCalendarWeek();
		const hoveredDay = weekDays[3];

		await act(async () => {
			if (hoveredDay) fireEvent.mouseOver(hoveredDay);
		});

		expect(weekDays.slice(0, 6).every((day) => day.classList.contains(styles.periodPreview))).toBe(true);
		expect(weekDays[6]?.classList.contains(styles.periodPreview)).toBe(false);
	});

	it("показывает preview недели до первой границы диапазона", async () => {
		await renderCalendar([null, null], true);

		const weekDays = getFirstCalendarWeek();
		const hoveredDay = weekDays[3];

		await act(async () => {
			if (hoveredDay) fireEvent.mouseOver(hoveredDay);
		});

		expect(weekDays.slice(0, 6).every((day) => day.classList.contains(styles.periodPreview))).toBe(true);
		expect(weekDays[6]?.classList.contains(styles.periodPreview)).toBe(false);
	});
});
