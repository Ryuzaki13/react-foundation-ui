/* eslint-disable react-hooks/rules-of-hooks */
import { useLayoutEffect, useMemo } from "react";

import { createQueryClient } from "@ryuzaki13/react-foundation-lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";

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

function createMockResponse(body: BodyInit, contentType: string, status = 200) {
	return new Response(body, {
		status,
		headers: {
			"Content-Type": contentType
		}
	});
}

function wait(ms: number) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export const withMockedOData: Decorator = (storyRenderer, context) => {
	const queryClient = useMemo(() => createQueryClient({}), []);
	const StoryComponent = storyRenderer;

	useLayoutEffect(() => {
		const originalFetch = window.fetch.bind(window);
		const mode = (context.parameters.odataMockMode as ODataMockMode | undefined) ?? "success";

		window.fetch = async (input, init) => {
			const requestUrl = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
			const url = new URL(requestUrl, window.location.origin);
			const path = url.pathname;

			if (!path.includes(`/${MOCK_SERVICE}/`)) {
				return originalFetch(input, init);
			}

			if (mode === "loading") {
				await wait(1200);
			}

			if (path.endsWith(`/${MOCK_SERVICE}/$metadata`)) {
				if (mode === "metadataError") {
					return createMockResponse("Ошибка чтения metadata", "text/plain", 500);
				}

				return createMockResponse(mockMetadataXml, "application/xml");
			}

			if (path.endsWith(`/${MOCK_SERVICE}/${MOCK_ENTITY}`)) {
				if (mode === "collectionError") {
					return createMockResponse(JSON.stringify({ error: "Ошибка загрузки справочника" }), "application/json", 500);
				}

				return createMockResponse(JSON.stringify({ d: { results: mockCollectionItems } }), "application/json");
			}

			return originalFetch(input, init);
		};

		return () => {
			window.fetch = originalFetch;
			queryClient.clear();
		};
	}, [context.id, context.parameters.odataMockMode, queryClient]);

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
