/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useMemo } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { mockCollectionItems } from "./odataStoryCollection";

import type {
	ODataCollectionConfig,
	ODataCollectionModel,
	ODataCollectionSegment,
	ODataDependentBaseProps
} from "@ryuzaki13/react-foundation-api/odata";
import type { Decorator } from "@storybook/react-vite";

export const MOCK_SERVICE = "DEMO_REFERENCE_SRV";
export const MOCK_ENTITY = "DemoReferenceItems";

const mockMetadataXml = `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx xmlns:edmx="http://schemas.microsoft.com/ado/2007/06/edmx">
	<edmx:DataServices xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" m:DataServiceVersion="2.0">
		<Schema Namespace="DEMO_REFERENCE_SRV" xmlns="http://schemas.microsoft.com/ado/2008/09/edm" xmlns:sap="http://www.sap.com/Protocols/SAPData">
			<EntityType Name="DemoReferenceItemsType" sap:semantics="aggregate" sap:label="Демо-справочник" sap:content-version="1">
				<Key>
					<PropertyRef Name="ID" />
				</Key>
				<Property Name="ID" Type="Edm.String" Nullable="false" sap:sortable="false" sap:filterable="false" />
				<Property Name="REGION" Type="Edm.String" MaxLength="4" sap:aggregation-role="dimension" sap:display-format="UpperCase" sap:text="REGION_Text" />
				<Property Name="REGION_Text" Type="Edm.String" MaxLength="40" sap:label="Регион" sap:quickinfo="Краткое описание" sap:creatable="false" sap:updatable="false" />
				<Property Name="BRANCH" Type="Edm.String" MaxLength="8" sap:aggregation-role="dimension" sap:display-format="UpperCase" sap:text="BRANCH_Text" />
				<Property Name="BRANCH_Text" Type="Edm.String" MaxLength="40" sap:label="Подразделение" sap:quickinfo="Среднее описание" sap:creatable="false" sap:updatable="false" />
				<Property Name="TEAM" Type="Edm.String" MaxLength="8" sap:aggregation-role="dimension" sap:display-format="UpperCase" sap:text="TEAM_Text" />
				<Property Name="TEAM_Text" Type="Edm.String" MaxLength="40" sap:label="Команда" sap:quickinfo="Среднее описание" sap:creatable="false" sap:updatable="false" />
				<Property Name="OWNER" Type="Edm.String" MaxLength="8" sap:aggregation-role="dimension" sap:display-format="UpperCase" sap:text="OWNER_Text" />
				<Property Name="OWNER_Text" Type="Edm.String" MaxLength="40" sap:label="Ответственный" sap:quickinfo="Среднее описание" sap:creatable="false" sap:updatable="false" />
				<Property Name="CNT" Type="Edm.Byte" sap:aggregation-role="measure" sap:filterable="false" />
			</EntityType>
			<EntityContainer Name="DEMO_REFERENCE_SRV_Entities" m:IsDefaultEntityContainer="true">
				<EntitySet Name="DemoReferenceItems" EntityType="DEMO_REFERENCE_SRV.DemoReferenceItemsType" sap:creatable="false" sap:updatable="false" sap:deletable="false" sap:content-version="1" />
			</EntityContainer>
		</Schema>
	</edmx:DataServices>
</edmx:Edmx>`;

export const storyValues = {
	region: "R01",
	regionText: "Северный регион",
	branch: "B0101",
	branchAlt: "B0102",
	team: "T0101",
	teamAlt: "T0201",
	owner: "P0001",
	ownerAlt: "P0006"
} as const;

export const treeSegments = {
	REGION: { placeholder: "Регион" },
	BRANCH: { placeholder: "Подразделение", hideCode: true },
	TEAM: { placeholder: "Команда" },
	OWNER: { placeholder: "Ответственный" }
} satisfies ODataDependentBaseProps["segments"];

export type ODataMockMode = "success" | "loading" | "metadataError" | "collectionError";

const odataStoryServices = {
	success: MOCK_SERVICE,
	loading: "DEMO_REFERENCE_LOADING_SRV",
	metadataError: "DEMO_REFERENCE_METADATA_ERROR_SRV",
	collectionError: "DEMO_REFERENCE_COLLECTION_ERROR_SRV"
} satisfies Record<ODataMockMode, string>;

function createMockResponse(body: BodyInit, contentType: string, status = 200) {
	return new Response(body, {
		status,
		headers: {
			"Content-Type": contentType
		}
	});
}

function wait(ms: number, signal?: AbortSignal) {
	return new Promise<void>((resolve, reject) => {
		const handleAbort = () => {
			window.clearTimeout(timeoutId);
			reject(signal?.reason ?? new DOMException("Ожидание OData mock отменено", "AbortError"));
		};
		const timeoutId = window.setTimeout(() => {
			signal?.removeEventListener("abort", handleAbort);
			resolve();
		}, ms);

		if (signal?.aborted) {
			handleAbort();
			return;
		}

		signal?.addEventListener("abort", handleAbort, { once: true });
	});
}

type ODataStoryContext = {
	readonly canvasElement?: object;
	readonly parameters: Record<string, unknown>;
};

type ODataStoryFetchRegistration = {
	readonly mode: ODataMockMode;
	readonly service: string;
	readonly version: symbol;
};

type ODataStoryFetchMockState = {
	readonly originalFetch: typeof window.fetch;
	readonly registrations: Map<symbol, ODataStoryFetchRegistration>;
	readonly registrationIdsByCanvas: WeakMap<object, symbol>;
	readonly mockedFetch: typeof window.fetch;
};

let activeFetchMockState: ODataStoryFetchMockState | undefined;

function resolveRequestRegistration(path: string, registrations: ReadonlyMap<symbol, ODataStoryFetchRegistration>) {
	for (const registration of registrations.values()) {
		if (path.includes(`/${registration.service}/`)) return registration;
	}
}

function createODataStoryFetchMockState(): ODataStoryFetchMockState {
	const originalFetch = window.fetch;
	const registrations = new Map<symbol, ODataStoryFetchRegistration>();
	const registrationIdsByCanvas = new WeakMap<object, symbol>();
	const mockedFetch: typeof window.fetch = async (input, init) => {
		const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
		const url = new URL(requestUrl, window.location.origin);
		const path = url.pathname;
		const registration = resolveRequestRegistration(path, registrations);

		if (!registration) {
			return originalFetch(input, init);
		}

		if (registration.mode === "loading") {
			const signal = init?.signal ?? (typeof Request !== "undefined" && input instanceof Request ? input.signal : undefined);
			await wait(1200, signal);
		}

		if (path.endsWith(`/${registration.service}/$metadata`)) {
			if (registration.mode === "metadataError") {
				return createMockResponse("Ошибка чтения metadata", "text/plain", 500);
			}

			return createMockResponse(mockMetadataXml, "application/xml");
		}

		if (path.endsWith(`/${registration.service}/${MOCK_ENTITY}`)) {
			if (registration.mode === "collectionError") {
				return createMockResponse(JSON.stringify({ error: "Ошибка загрузки справочника" }), "application/json", 500);
			}

			return createMockResponse(JSON.stringify({ d: { results: mockCollectionItems } }), "application/json");
		}

		return originalFetch(input, init);
	};

	return { originalFetch, registrations, registrationIdsByCanvas, mockedFetch };
}

/**
 * Устанавливает mock OData-запросов на Storybook boundary до React render.
 *
 * TanStack Query может начать metadata query при подписке дочернего компонента,
 * поэтому установка `fetch` из React effect создаёт race и иногда пропускает
 * первый запрос в static Storybook. Storybook `beforeEach` выполняет этот hook
 * заранее и вызывает возвращённый cleanup при переключении story.
 *
 * В docs несколько Canvas могут жить одновременно. Они делят один dispatcher,
 * но используют разные service path для success/loading/error-сценариев, поэтому
 * запрос однозначно связывается со своим mock. Регистрация привязана к canvas:
 * повторный Storybook render обновляет её без накопления записей, а cleanup-ы
 * разных render-циклов и Canvas можно вызывать в любом порядке.
 */
export function installODataStoryFetchMock(context: ODataStoryContext): () => void {
	const mode = (context.parameters.odataMockMode as ODataMockMode | undefined) ?? "success";
	const state = activeFetchMockState ?? createODataStoryFetchMockState();
	const registrationId =
		(context.canvasElement && state.registrationIdsByCanvas.get(context.canvasElement)) ?? Symbol("odata-story-fetch-mock");
	const registrationVersion = Symbol("odata-story-fetch-mock-version");

	activeFetchMockState = state;
	if (context.canvasElement) {
		state.registrationIdsByCanvas.set(context.canvasElement, registrationId);
	}
	state.registrations.delete(registrationId);
	state.registrations.set(registrationId, { mode, service: odataStoryServices[mode], version: registrationVersion });
	window.fetch = state.mockedFetch;

	return () => {
		if (state.registrations.get(registrationId)?.version !== registrationVersion) return;

		state.registrations.delete(registrationId);
		if (context.canvasElement) {
			state.registrationIdsByCanvas.delete(context.canvasElement);
		}

		if (state.registrations.size > 0 || activeFetchMockState !== state) return;

		if (window.fetch === state.mockedFetch) {
			window.fetch = state.originalFetch;
		}

		activeFetchMockState = undefined;
	};
}

/** Создаёт изолированный QueryClient без IndexedDB persistence для каждой OData story. */
export const withODataStoryQueryClient: Decorator = (storyRenderer) => {
	const queryClient = useMemo(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: { retry: false, throwOnError: false },
					mutations: { retry: false, throwOnError: false }
				}
			}),
		[]
	);
	const StoryComponent = storyRenderer;

	useEffect(
		() => () => {
			queryClient.clear();
		},
		[queryClient]
	);

	return (
		<QueryClientProvider client={queryClient}>
			<StoryComponent />
		</QueryClientProvider>
	);
};

export const baseOData: ODataCollectionConfig = {
	service: MOCK_SERVICE,
	target: MOCK_ENTITY
};

export const odataStoryOData = {
	success: baseOData,
	loading: { ...baseOData, service: odataStoryServices.loading },
	metadataError: { ...baseOData, service: odataStoryServices.metadataError },
	collectionError: { ...baseOData, service: odataStoryServices.collectionError }
} satisfies Record<ODataMockMode, ODataCollectionConfig>;

export const baseModel: ODataCollectionModel = {
	codeKey: "REGION",
	minSearchTextLength: 1,
	minSearchCodeLength: 1,
	searchDebounceDelay: 250,
	maxVisibleItems: 100
};

export const baseSegment: ODataCollectionSegment = {
	placeholder: "Регион"
};
