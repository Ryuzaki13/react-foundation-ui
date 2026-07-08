import { logError } from "@ryuzaki13/react-foundation-lib/utils";

import { Text } from "../text";

export function SimpleErrorDisplay({ error }: { error: Error }) {
	logError(error.stack);

	return (
		<Text color="error">
			<code>{error.message}</code>
		</Text>
	);
}
