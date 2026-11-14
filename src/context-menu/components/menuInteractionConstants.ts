/** Режим определяет способ открытия и передаётся в состояние меню как источник события. */
export const MENU_TRIGGER_CLICK = "click";
export const MENU_TRIGGER_CONTEXT_MENU = "contextmenu";
export const MENU_OPEN_SOURCE_KEYBOARD = "keyboard";

export const MENU_INITIAL_FOCUS_FIRST = "first";
export const MENU_INITIAL_FOCUS_LAST = "last";

/** Разметка обоих меню использует один контракт клавиатурного обхода. */
export const MENU_NAVIGABLE_ITEM_SELECTOR = '[data-menu-item="true"]:not([data-disabled="true"])';
export const MENU_KEY_TAB = "Tab";
export const MENU_KEY_ARROW_DOWN = "ArrowDown";
export const MENU_KEY_ARROW_UP = "ArrowUp";
export const MENU_KEY_HOME = "Home";
export const MENU_KEY_END = "End";
export const MENU_KEY_SPACE = " ";
