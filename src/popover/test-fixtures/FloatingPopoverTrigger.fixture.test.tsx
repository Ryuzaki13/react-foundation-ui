import { type ComponentPropsWithRef } from "react";

type FloatingPopoverTriggerFixtureProps = ComponentPropsWithRef<"button">;

/** Проверяет контракт custom trigger: ref и props доходят до одного DOM-элемента. */
export function FloatingPopoverTriggerFixture(props: FloatingPopoverTriggerFixtureProps) {
	return <button type="button" data-testid="custom-trigger" {...props} />;
}
