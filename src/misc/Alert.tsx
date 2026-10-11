import { type AriaAttributes, type PropsWithChildren } from "react";

export function Alert(props: PropsWithChildren & AriaAttributes) {
	return <p role="alert" className="statusError fontBold" {...props} />;
}
