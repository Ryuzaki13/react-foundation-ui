// @vitest-environment jsdom

import { composeStory } from "@storybook/react-vite";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import projectAnnotations from "../../../.storybook/preview";
import * as CheckBoxStories from "../../check-box/stories/CheckBox.stories";
import * as ContextMenuStories from "../../context-menu/stories/ContextMenu.stories";
import * as DateRangePresetSelectStories from "../../date-range-preset-select/stories/DateRangePresetSelect.stories";
import * as SingleDateTimeInputStories from "../../date-time-input/stories/SingleDateTimeInput.stories";
import * as DialogStories from "../../dialog/stories/Dialog.stories";
import * as DisclosureStories from "../../disclosure/stories/Disclosure.stories";
import * as DropZoneStories from "../../drop-zone/stories/DropZone.stories";
import * as ExpandableActionPanelStories from "../../expandable-action-panel/stories/ExpandableActionPanel.stories";
import * as InputStories from "../../input/stories/Input.stories";
import * as InputFileStories from "../../input-file/stories/InputFile.stories";
import * as InputFilesStories from "../../input-files/stories/InputFiles.stories";
import * as InputImageStories from "../../input-image/stories/InputImage.stories";
import * as PeriodSelectStories from "../../period-select/stories/PeriodSelect.stories";
import * as PopoverStories from "../../popover/stories/Popover.stories";
import * as PresetRangeDateInputStories from "../../preset-range-date-input/ui/stories/PresetRangeDateInput.stories";
import * as RadioButtonStories from "../../radio-button/stories/RadioButton.stories";
import * as RadioGroupStories from "../../radio-group/stories/RadioGroup.stories";
import * as SliderStories from "../../slider/stories/Slider.stories";
import * as SliderInputStories from "../../slider/stories/SliderInput.stories";
import * as SwitchStories from "../../switch/stories/Switch.stories";
import * as TabsStories from "../../tabs/stories/Tabs.stories";
import * as TagInputStories from "../../tag-input/stories/TagInput.stories";
import * as TextareaStories from "../../textarea/stories/Textarea.stories";
import * as ToggleStories from "../../toggle/stories/Toggle.stories";
import * as TreeMultiSelectStories from "../../tree-select/stories/TreeMultiSelect.stories";

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
	configurable: true,
	value: () => undefined
});

const catalogStories = [
	["InputText", composeStory(InputStories.TextControlled, InputStories.default, projectAnnotations)],
	["InputNumber", composeStory(InputStories.NumberControlled, InputStories.default, projectAnnotations)],
	["Textarea", composeStory(TextareaStories.Controlled, TextareaStories.default, projectAnnotations)],
	["CheckBox", composeStory(CheckBoxStories.Controlled, CheckBoxStories.default, projectAnnotations)],
	["RadioButton", composeStory(RadioButtonStories.Controlled, RadioButtonStories.default, projectAnnotations)],
	["RadioGroup", composeStory(RadioGroupStories.Controlled, RadioGroupStories.default, projectAnnotations)],
	["Switch", composeStory(SwitchStories.BiState, SwitchStories.default, projectAnnotations)],
	["Toggle", composeStory(ToggleStories.Controlled, ToggleStories.default, projectAnnotations)],
	["Slider", composeStory(SliderStories.SingleStep, SliderStories.default, projectAnnotations)],
	["SliderRange", composeStory(SliderStories.RangePlain, SliderStories.default, projectAnnotations)],
	["SliderInput", composeStory(SliderInputStories.Basic, SliderInputStories.default, projectAnnotations)],
	["SliderRangeInput", composeStory(SliderInputStories.RangeInputPlain, SliderInputStories.default, projectAnnotations)],
	["TreeMultiSelect", composeStory(TreeMultiSelectStories.Basic, TreeMultiSelectStories.default, projectAnnotations)],
	["TagInput", composeStory(TagInputStories.Controlled, TagInputStories.default, projectAnnotations)],
	["PeriodSelect", composeStory(PeriodSelectStories.Controlled, PeriodSelectStories.default, projectAnnotations)],
	["SingleDateTimeInput", composeStory(SingleDateTimeInputStories.Default, SingleDateTimeInputStories.default, projectAnnotations)],
	["DateRangePresetSelect", composeStory(DateRangePresetSelectStories.Default, DateRangePresetSelectStories.default, projectAnnotations)],
	["PresetRangeDateInput", composeStory(PresetRangeDateInputStories.Default, PresetRangeDateInputStories.default, projectAnnotations)],
	["InputFile", composeStory(InputFileStories.Controlled, InputFileStories.default, projectAnnotations)],
	["InputFiles", composeStory(InputFilesStories.Controlled, InputFilesStories.default, projectAnnotations)],
	["InputImage", composeStory(InputImageStories.Controlled, InputImageStories.default, projectAnnotations)],
	["DropZone", composeStory(DropZoneStories.Basic, DropZoneStories.default, projectAnnotations)],
	["TabsBox", composeStory(TabsStories.BoxBasic, TabsStories.default, projectAnnotations)],
	["Disclosure", composeStory(DisclosureStories.Basic, DisclosureStories.default, projectAnnotations)],
	["ExpandableActionPanel", composeStory(ExpandableActionPanelStories.Labeled, ExpandableActionPanelStories.default, projectAnnotations)],
	["Popover", composeStory(PopoverStories.Default, PopoverStories.default, projectAnnotations)],
	["DropdownMenu", composeStory(ContextMenuStories.DropdownMenuBasic, ContextMenuStories.default, projectAnnotations)],
	["ContextMenu", composeStory(ContextMenuStories.ContextMenuBasic, ContextMenuStories.default, projectAnnotations)],
	["Dialog", composeStory(DialogStories.Controlled, DialogStories.default, projectAnnotations)]
] as const;

describe("InteractiveComponents catalog stories", () => {
	for (const [name, CatalogStory] of catalogStories) {
		it(`mounts ${name} through the Storybook story context`, () => {
			expect(() => render(<CatalogStory />)).not.toThrow();
		});
	}
});
