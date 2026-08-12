import { type ReactElement } from "react";

import { OptionCode, type OptionCodeProps } from "./OptionCode";
import { OptionText, type OptionTextProps } from "./OptionText";

export type OptionTextChildren = ReactElement<OptionTextProps, typeof OptionText>;
export type OptionCodeChildren = ReactElement<OptionCodeProps, typeof OptionCode>;
