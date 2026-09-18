import { OptionMultiSelect, type OptionMultiSelectProps } from "../src/multi-select";

type CatalogOption =
	| {
			id: string;
			kind: "catalog";
			label: string;
			displayCode: string;
			rank: number;
	  }
	| {
			id: string;
			kind: "external";
			label: string;
			externalId: number;
	  };

type Equal<Left, Right> = (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2 ? true : false;
type Expect<Value extends true> = Value;

const options: readonly CatalogOption[] = [
	{ id: "catalog-1", kind: "catalog", label: "Каталог", displayCode: "CAT", rank: 1 },
	{ id: "external-1", kind: "external", label: "Внешняя опция", externalId: 101 }
];

const props = {
	label: "Опции",
	options,
	value: options.slice(0, 1),
	onChange: (nextOptions) => {
		const firstOption: CatalogOption | undefined = nextOptions[0];
		void firstOption;
	},
	getOptionKey: (option) => option.id,
	getOptionLabel: (option) => option.label,
	getOptionCode: (option) => (option.kind === "catalog" ? option.displayCode : undefined),
	getOptionGroup: (option) => ({ key: option.kind, label: option.kind }),
	getOptionSearchText: (option) =>
		option.kind === "catalog" ? [option.label, option.displayCode] : [option.label, String(option.externalId)],
	getOptionDisabled: (option, context) =>
		context.selectedKeys.has(option.id) && context.selectedOptions.some((selectedOption) => selectedOption.id === option.id),
	renderOption: (option, state) => ({
		text: option.label,
		code: state.selected && option.kind === "catalog" ? option.displayCode : undefined
	}),
	renderToken: (context) => context.selectedOptions.map((option) => option.label).join(", ")
} satisfies OptionMultiSelectProps<CatalogOption>;

const inferredElement = <OptionMultiSelect {...props} />;
const explicitElement = <OptionMultiSelect<CatalogOption> {...props} />;

void inferredElement;
void explicitElement;

export type OptionMultiSelectKeyContract = Expect<Equal<ReturnType<OptionMultiSelectProps<CatalogOption>["getOptionKey"]>, string>>;
export type OptionMultiSelectChangeContract = Expect<
	Equal<Parameters<OptionMultiSelectProps<CatalogOption>["onChange"]>[0], CatalogOption[]>
>;
export type OptionMultiSelectDisableContextContract = Expect<
	Equal<
		Parameters<NonNullable<OptionMultiSelectProps<CatalogOption>["getOptionDisabled"]>>[1]["selectedOptions"],
		readonly CatalogOption[]
	>
>;
