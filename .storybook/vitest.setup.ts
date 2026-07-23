import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/react-vite";

import * as projectAnnotations from "./preview";

// Portable stories получают те же decorators и a11y-аннотации, что и браузерный Storybook.
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
