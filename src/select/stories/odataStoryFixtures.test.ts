import { fetchMetadata } from "@ryuzaki13/react-foundation-api/odata";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { installODataStoryFetchMock, MOCK_ENTITY, MOCK_SERVICE, odataStoryOData } from "./odataStoryFixtures";

describe("installODataStoryFetchMock", () => {
	const environmentFetch = window.fetch;
	let delegatedFetch: ReturnType<typeof vi.fn<typeof window.fetch>>;
	let cleanups: Array<() => void>;

	beforeEach(() => {
		vi.stubGlobal("__SAP_CLIENT__", "100");
		delegatedFetch = vi.fn(async () => new Response("delegated"));
		window.fetch = delegatedFetch;
		cleanups = [];
	});

	afterEach(() => {
		for (const cleanup of cleanups.reverse()) {
			cleanup();
		}

		vi.unstubAllGlobals();
		vi.useRealTimers();
		window.fetch = environmentFetch;
	});

	function install(parameters: Record<string, unknown> = {}, canvasElement: object = {}) {
		const cleanup = installODataStoryFetchMock({ parameters, canvasElement });
		cleanups.push(cleanup);
		return cleanup;
	}

	function serviceUrl(service: string, path: string) {
		return `http://localhost/sap/opu/odata/sap/${service}/${path}`;
	}

	it("отдаёт валидные metadata до React render и восстанавливает исходный fetch", async () => {
		const cleanup = install({ odataMockMode: "success" });
		const metadata = await fetchMetadata({ service: MOCK_SERVICE })();

		expect(metadata.entities[MOCK_ENTITY]?.columns.map((column) => column.id)).toContain("REGION");
		expect(delegatedFetch).not.toHaveBeenCalled();

		cleanup();

		expect(window.fetch).toBe(delegatedFetch);
	});

	it("делегирует запросы других сервисов исходному fetch", async () => {
		const cleanup = install();

		await expect(window.fetch("http://localhost/unrelated")).resolves.toHaveProperty("status", 200);
		expect(delegatedFetch).toHaveBeenCalledOnce();

		cleanup();
	});

	it("сохраняет общий mock при cleanup регистраций не в LIFO-порядке", async () => {
		const cleanupError = install({ odataMockMode: "metadataError" });
		const cleanupSuccess = install({ odataMockMode: "success" });
		const errorResponse = await window.fetch(serviceUrl(odataStoryOData.metadataError.service, "$metadata"));

		expect(errorResponse.status).toBe(500);

		cleanupError();

		await expect(fetchMetadata({ service: MOCK_SERVICE })()).resolves.toMatchObject({
			entities: { [MOCK_ENTITY]: expect.any(Object) }
		});
		expect(window.fetch).not.toBe(delegatedFetch);

		cleanupSuccess();

		expect(window.fetch).toBe(delegatedFetch);
	});

	it("разделяет success и error-режимы одновременно смонтированных Canvas по service path", async () => {
		install({ odataMockMode: "success" });
		install({ odataMockMode: "metadataError" });
		install({ odataMockMode: "collectionError" });

		const metadataErrorResponse = await window.fetch(serviceUrl(odataStoryOData.metadataError.service, "$metadata"));
		const collectionErrorResponse = await window.fetch(serviceUrl(odataStoryOData.collectionError.service, MOCK_ENTITY));
		const successCollectionResponse = await window.fetch(serviceUrl(odataStoryOData.success.service, MOCK_ENTITY));
		const successCollection = (await successCollectionResponse.json()) as { d: { results: unknown[] } };

		await expect(fetchMetadata({ service: MOCK_SERVICE })()).resolves.toMatchObject({
			entities: { [MOCK_ENTITY]: expect.any(Object) }
		});
		expect(metadataErrorResponse.status).toBe(500);
		expect(collectionErrorResponse.status).toBe(500);
		expect(successCollectionResponse.status).toBe(200);
		expect(successCollection.d.results.length).toBeGreaterThan(0);
	});

	it("обновляет регистрацию одного Canvas при повторном Storybook render без утечки", async () => {
		const canvasElement = {};
		const cleanupSuccess = install({ odataMockMode: "success" }, canvasElement);
		const cleanupError = install({ odataMockMode: "metadataError" }, canvasElement);

		cleanupSuccess();

		const response = await window.fetch(serviceUrl(odataStoryOData.metadataError.service, "$metadata"));
		expect(response.status).toBe(500);
		expect(window.fetch).not.toBe(delegatedFetch);

		cleanupError();

		expect(window.fetch).toBe(delegatedFetch);
	});

	it("сохраняет loading-state до завершения заданной задержки", async () => {
		vi.useFakeTimers();
		install({ odataMockMode: "loading" });
		const responsePromise = window.fetch(serviceUrl(odataStoryOData.loading.service, "$metadata"));
		let settled = false;
		void responsePromise.finally(() => {
			settled = true;
		});

		await vi.advanceTimersByTimeAsync(1199);
		expect(settled).toBe(false);

		await vi.advanceTimersByTimeAsync(1);
		await expect(responsePromise).resolves.toHaveProperty("status", 200);
	});

	it("прерывает loading-задержку вместе с отменённым OData-запросом", async () => {
		vi.useFakeTimers();
		install({ odataMockMode: "loading" });
		const abortController = new AbortController();
		const responsePromise = window.fetch(serviceUrl(odataStoryOData.loading.service, "$metadata"), {
			signal: abortController.signal
		});

		abortController.abort();

		await expect(responsePromise).rejects.toMatchObject({ name: "AbortError" });
		expect(vi.getTimerCount()).toBe(0);
	});
});
