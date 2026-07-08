import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { getSortableReorderResult, resolveSortableStrategy } from "./sortableUtils";

import type { DragEndEvent } from "@dnd-kit/core";

import { Sortable } from "./index";

function createDragEndEvent(params: {
	activeId: string;
	overId?: string | null;
	activeContainerId?: string | null;
	overContainerId?: string | null;
}): DragEndEvent {
	return {
		active: {
			id: params.activeId,
			data: {
				current: {
					sortable: {
						containerId: params.activeContainerId ?? "demo"
					}
				}
			}
		},
		over: params.overId
			? {
					id: params.overId,
					data: {
						current: {
							sortable: {
								containerId: params.overContainerId ?? "demo"
							}
						}
					}
				}
			: null
	} as unknown as DragEndEvent;
}

function hasElementAttribute(html: string, testId: string, attribute: string, value: string) {
	const patterns = [
		new RegExp(`<[^>]+data-testid="${testId}"[^>]+${attribute}="${value}"`),
		new RegExp(`<[^>]+${attribute}="${value}"[^>]+data-testid="${testId}"`)
	];

	return patterns.some((pattern) => pattern.test(html));
}

describe("getSortableReorderResult", () => {
	it("возвращает индексы для перестановки внутри одного контейнера", () => {
		const event = createDragEndEvent({ activeId: "a", overId: "c" });

		expect(getSortableReorderResult({ event, items: ["a", "b", "c"] })).toEqual({
			containerId: "demo",
			activeId: "a",
			overId: "c",
			fromIndex: 0,
			toIndex: 2
		});
	});

	it("возвращает null, если over отсутствует", () => {
		const event = createDragEndEvent({ activeId: "a", overId: null });

		expect(getSortableReorderResult({ event, items: ["a", "b", "c"] })).toBeNull();
	});

	it("возвращает null, если активный и целевой id совпадают", () => {
		const event = createDragEndEvent({ activeId: "a", overId: "a" });

		expect(getSortableReorderResult({ event, items: ["a", "b", "c"] })).toBeNull();
	});

	it("возвращает null, если контейнеры различаются", () => {
		const event = createDragEndEvent({
			activeId: "a",
			overId: "c",
			activeContainerId: "left",
			overContainerId: "right"
		});

		expect(
			getSortableReorderResult({
				event,
				items: {
					left: ["a", "b"],
					right: ["c", "d"]
				}
			})
		).toBeNull();
	});

	it("возвращает null, если индекс элемента не найден", () => {
		const event = createDragEndEvent({ activeId: "z", overId: "c" });

		expect(getSortableReorderResult({ event, items: ["a", "b", "c"] })).toBeNull();
	});
});

describe("resolveSortableStrategy", () => {
	it("выбирает стандартную стратегию по layout", async () => {
		const sortable = await import("@dnd-kit/sortable");

		expect(resolveSortableStrategy("vertical")).toBe(sortable.verticalListSortingStrategy);
		expect(resolveSortableStrategy("horizontal")).toBe(sortable.horizontalListSortingStrategy);
		expect(resolveSortableStrategy("grid")).toBe(sortable.rectSortingStrategy);
	});
});

describe("Sortable item bindings", () => {
	it("передает drag-атрибуты только в handle-режиме на Sortable.Handle", () => {
		const html = renderToStaticMarkup(
			<Sortable.Root>
				<Sortable.Container containerId="demo" items={["row-1"]}>
					<Sortable.Item id="row-1" data-testid="item">
						<Sortable.Handle data-testid="handle">Перетаскивание</Sortable.Handle>
					</Sortable.Item>
				</Sortable.Container>
			</Sortable.Root>
		);

		expect(hasElementAttribute(html, "item", "role", "button")).toBe(false);
		expect(hasElementAttribute(html, "handle", "role", "button")).toBe(true);
	});

	it("передает drag-атрибуты на wrapper в режиме dragActivator=item", () => {
		const html = renderToStaticMarkup(
			<Sortable.Root>
				<Sortable.Container containerId="demo" items={["row-1"]}>
					<Sortable.Item id="row-1" dragActivator="item" data-testid="item">
						<Sortable.Handle data-testid="handle">Перетаскивание</Sortable.Handle>
					</Sortable.Item>
				</Sortable.Container>
			</Sortable.Root>
		);

		expect(hasElementAttribute(html, "item", "role", "button")).toBe(true);
		expect(hasElementAttribute(html, "handle", "role", "button")).toBe(false);
	});

	it("отключает drag bindings для disabled-элемента", () => {
		const html = renderToStaticMarkup(
			<Sortable.Root>
				<Sortable.Container containerId="demo" items={["row-1"]}>
					<Sortable.Item id="row-1" disabled data-testid="item">
						<Sortable.Handle data-testid="handle">Перетаскивание</Sortable.Handle>
					</Sortable.Item>
				</Sortable.Container>
			</Sortable.Root>
		);

		expect(hasElementAttribute(html, "item", "role", "button")).toBe(false);
		expect(hasElementAttribute(html, "handle", "role", "button")).toBe(false);
		expect(hasElementAttribute(html, "handle", "data-sortable-handle-disabled", "true")).toBe(true);
	});

	it("рендерит стандартную визуальную ручку Sortable.DragHandle поверх Sortable.Handle", () => {
		const html = renderToStaticMarkup(
			<Sortable.Root>
				<Sortable.Container containerId="demo" items={["row-1"]}>
					<Sortable.Item id="row-1" disabled>
						<Sortable.DragHandle data-testid="handle" title="Перетащить строку" />
					</Sortable.Item>
				</Sortable.Container>
			</Sortable.Root>
		);

		expect(hasElementAttribute(html, "handle", "data-sortable-handle", "true")).toBe(true);
		expect(hasElementAttribute(html, "handle", "data-sortable-handle-disabled", "true")).toBe(true);
		expect(hasElementAttribute(html, "handle", "data-sortable-handle-dragging", "false")).toBe(true);
		expect(html).toContain("<svg");
	});
});

describe("Sortable layouts smoke", () => {
	it("рендерит nested-контейнеры внутри одного DndContext", () => {
		const html = renderToStaticMarkup(
			<Sortable.Root>
				<Sortable.Container containerId="top" items={["group-1"]}>
					<Sortable.Item id="group-1" data-testid="top-item">
						<div>Группа</div>
						<Sortable.Container containerId="parent:group-1" items={["child-1"]}>
							<Sortable.Item id="child-1" data-testid="child-item">
								<Sortable.Handle data-testid="child-handle">Child</Sortable.Handle>
							</Sortable.Item>
						</Sortable.Container>
					</Sortable.Item>
				</Sortable.Container>
			</Sortable.Root>
		);

		expect(html).toContain('data-testid="top-item"');
		expect(html).toContain('data-testid="child-item"');
		expect(hasElementAttribute(html, "child-handle", "role", "button")).toBe(true);
	});

	it("рендерит grid-контейнер без ошибок", () => {
		const html = renderToStaticMarkup(
			<Sortable.Root>
				<Sortable.Container containerId="grid" items={["first", "second", "third"]} layout="grid">
					<div>
						<Sortable.Item id="first" data-testid="first">
							<Sortable.Handle>first</Sortable.Handle>
						</Sortable.Item>
						<Sortable.Item id="second" data-testid="second">
							<Sortable.Handle>second</Sortable.Handle>
						</Sortable.Item>
						<Sortable.Item id="third" data-testid="third">
							<Sortable.Handle>third</Sortable.Handle>
						</Sortable.Item>
					</div>
				</Sortable.Container>
			</Sortable.Root>
		);

		expect(html).toContain('data-testid="first"');
		expect(html).toContain('data-testid="second"');
		expect(html).toContain('data-testid="third"');
	});
});
