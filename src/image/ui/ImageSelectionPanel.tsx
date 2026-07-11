import { Button } from "../../button";
import { type ImageSelectionActionsData, type ImageSelectionPanelProps } from "../model/imageSelectionTypes";
import { useImageSelectionState } from "../model/useImageSelectionState";

import { ImageSelectionFields } from "./ImageSelectionFields";

/** Встраиваемая форма выбора и обрезки одного или нескольких изображений. */
export function ImageSelectionPanel({ disabled, renderActions, ...props }: ImageSelectionPanelProps) {
	const state = useImageSelectionState({ ...props, disabled });
	const actionsData: ImageSelectionActionsData = {
		value: state.value,
		activeIndex: state.activeIndex,
		hasSelected: state.hasSelected,
		canApply: state.canApply,
		apply: state.apply
	};

	return (
		<>
			<ImageSelectionFields {...props} disabled={disabled} state={state} />
			{renderActions
				? renderActions(actionsData)
				: props.onApply && (
						<div>
							<Button disabled={!state.canApply} tone="success" onClick={state.apply}>
								Применить
							</Button>
						</div>
					)}
		</>
	);
}
