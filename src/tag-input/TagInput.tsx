import {
	type ClipboardEvent,
	type CompositionEvent,
	type InputHTMLAttributes,
	type KeyboardEvent,
	type Ref,
	useImperativeHandle,
	useRef,
	useState
} from "react";

import { cn } from "@ryuzaki13/react-foundation-lib/utils";
import { XIcon } from "lucide-react";

import { InputUI, useInputFieldIds } from "../input";
import uiStyles from "../ui.module.scss";

import { joinTagInputAriaIds } from "./lib/joinTagInputAriaIds";
import { defaultGetRemoveButtonAriaLabel, defaultGetTagKey, defaultNormalizeTag } from "./lib/tagInputDefaults";
import styles from "./TagInput.module.scss";

import type { UiBaseProps } from "../types";

const TAG_DELIMITER_PATTERN = /[,\r\n]/;
const TAG_DELIMITER_SPLIT_PATTERN = /[,\r\n]+/;

export interface TagInputProps
	extends
		Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "defaultValue" | "disabled" | "onChange" | "readOnly" | "size" | "value">,
		UiBaseProps<string[], readonly string[]> {
	/** Ссылка на внутренний нативный `input`, передаваемая напрямую как React 19 prop. */
	ref?: Ref<HTMLInputElement>;

	/** Сообщение валидации, связанное с полем через `aria-describedby`. */
	error?: string;

	/** Сбрасывает внешнюю ошибку после изменения черновика или набора тегов. */
	onClearError?: () => void;

	/** Запрещает изменение набора тегов, сохраняя возможность выделять и копировать текст. */
	readOnly?: boolean;

	/** Максимальное количество тегов. Отсутствие значения не ограничивает набор. */
	maxTags?: number;

	/**
	 * Нормализует введённое значение перед проверкой дубликата и добавлением.
	 * По умолчанию удаляет пробелы в начале и конце.
	 */
	normalizeTag?: (value: string) => string;

	/**
	 * Возвращает ключ сравнения тегов. Позволяет, например, запретить дубликаты без учёта регистра.
	 * По умолчанию используется точное строковое сравнение.
	 */
	getTagKey?: (value: string) => string;

	/** Добавляет непустой черновик при уходе фокуса с input. По умолчанию включено. */
	addOnBlur?: boolean;

	/** Формирует доступное имя кнопки удаления конкретного тега. */
	getRemoveButtonAriaLabel?: (value: string, index: number) => string;

	/** Доступное имя списка уже добавленных тегов. */
	tokensAriaLabel?: string;

	/** CSS-класс непосредственно для внутреннего `input`; `className` применяется к оболочке поля. */
	inputClassName?: string;
}

/**
 * Controlled-поле для создания коротких строковых тегов.
 *
 * Новое значение фиксируется по `Enter`, запятой, вставке списка или потере фокуса. Компонент хранит
 * только незавершённый текст input, а окончательный набор всегда принадлежит потребителю через `value`.
 */
export function TagInput({
	ref,
	value,
	onChange,
	label,
	description,
	placeholder,
	size,
	disabled,
	readOnly = false,
	error,
	onClearError,
	maxTags,
	normalizeTag = defaultNormalizeTag,
	getTagKey = defaultGetTagKey,
	addOnBlur = true,
	getRemoveButtonAriaLabel = defaultGetRemoveButtonAriaLabel,
	tokensAriaLabel = "Добавленные теги",
	inputClassName,
	className,
	id: externalId,
	name,
	form,
	required,
	maxLength,
	onKeyDown,
	onPaste,
	onBlur,
	onCompositionStart,
	onCompositionEnd,
	"aria-describedby": externalAriaDescribedBy,
	"aria-labelledby": externalAriaLabelledBy,
	...inputProps
}: TagInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const controlRef = useRef<HTMLDivElement>(null);
	const isComposingRef = useRef(false);
	const [draft, setDraft] = useState("");
	const [announcement, setAnnouncement] = useState("");
	const { controlId, labelId, descriptionId, errorId, describedBy } = useInputFieldIds({
		id: externalId,
		hasLabel: label !== undefined && label !== null,
		hasDescription: !!description,
		hasError: !!error
	});
	const resolvedMaxTags = maxTags === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(maxTags));
	const isEditingDisabled = disabled || readOnly;
	const ariaDescribedBy = joinTagInputAriaIds(describedBy, externalAriaDescribedBy);
	const ariaLabelledBy = joinTagInputAriaIds(labelId, externalAriaLabelledBy);

	useImperativeHandle(
		ref,
		() => {
			const input = inputRef.current;

			if (!input) {
				throw new Error("TagInput: внутренний input недоступен при создании imperative handle.");
			}

			return input;
		},
		[]
	);

	/** Добавляет сразу несколько кандидатов одним controlled-обновлением и сообщает результат screen reader. */
	const appendTags = (rawTags: readonly string[]) => {
		if (isEditingDisabled) {
			return;
		}

		onClearError?.();

		const nextTags = [...value];
		const knownKeys = new Set(nextTags.map((tag) => getTagKey(tag)));
		const added: string[] = [];
		let duplicateCount = 0;
		let limitReached = false;

		for (const rawTag of rawTags) {
			const tag = normalizeTag(rawTag);

			if (!tag) continue;

			if (maxLength !== undefined && tag.length > maxLength) {
				setAnnouncement(`Тег «${tag}» длиннее допустимого значения.`);
				continue;
			}

			const key = getTagKey(tag);

			if (knownKeys.has(key)) {
				duplicateCount += 1;
				continue;
			}

			if (nextTags.length >= resolvedMaxTags) {
				limitReached = true;
				break;
			}

			knownKeys.add(key);
			nextTags.push(tag);
			added.push(tag);
		}

		if (added.length > 0) {
			onChange(nextTags);
			setAnnouncement(added.length === 1 ? `Добавлен тег «${added[0]}».` : `Добавлено тегов: ${added.length}.`);
		} else if (limitReached) {
			setAnnouncement(`Достигнуто максимальное количество тегов: ${resolvedMaxTags}.`);
		} else if (duplicateCount > 0) {
			setAnnouncement("Такой тег уже добавлен.");
		}
	};

	const commitDraft = () => {
		if (!draft) return false;

		appendTags(draft.split(TAG_DELIMITER_SPLIT_PATTERN));
		setDraft("");
		return true;
	};

	const removeTag = (index: number) => {
		if (isEditingDisabled) return;

		const removedTag = value[index];
		if (removedTag === undefined) return;

		onChange(value.filter((_, currentIndex) => currentIndex !== index));
		onClearError?.();
		setAnnouncement(`Удалён тег «${removedTag}».`);
		inputRef.current?.focus();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		onKeyDown?.(event);
		if (event.defaultPrevented || event.nativeEvent.isComposing || isComposingRef.current || isEditingDisabled) return;

		if (event.key === "Enter" || event.key === ",") {
			if (commitDraft() || event.key === ",") {
				event.preventDefault();
			}
			return;
		}

		if (event.key === "Backspace" && draft.length === 0 && value.length > 0) {
			event.preventDefault();
			removeTag(value.length - 1);
		}
	};

	const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
		onPaste?.(event);
		if (event.defaultPrevented || isEditingDisabled) return;

		const clipboardText = event.clipboardData.getData("text");
		if (!TAG_DELIMITER_PATTERN.test(clipboardText)) return;

		event.preventDefault();
		const selectionStart = event.currentTarget.selectionStart ?? draft.length;
		const selectionEnd = event.currentTarget.selectionEnd ?? selectionStart;
		const pastedValue = `${draft.slice(0, selectionStart)}${clipboardText}${draft.slice(selectionEnd)}`;

		appendTags(pastedValue.split(TAG_DELIMITER_SPLIT_PATTERN));
		setDraft("");
	};

	return (
		<InputUI
			label={label}
			description={description}
			disabled={disabled}
			className={className}
			size={size}
			error={error}
			controlId={controlId}
			labelId={labelId}
			descriptionId={descriptionId}
			errorId={errorId}>
			<div
				ref={controlRef}
				className={cn(uiStyles.uiControl, error && uiStyles.invalid, styles.control)}
				data-disabled={disabled ? "" : undefined}
				data-readonly={readOnly ? "" : undefined}
				data-invalid={error ? "" : undefined}
				onClick={() => inputRef.current?.focus()}>
				{value.length > 0 && (
					<ul className={styles.tagList} aria-label={tokensAriaLabel}>
						{value.map((tag, index) => (
							<li className={styles.tag} key={`${getTagKey(tag)}-${index}`}>
								<span className={styles.tagText}>{tag}</span>
								{!isEditingDisabled && (
									<button
										type="button"
										className={styles.removeButton}
										onClick={(event) => {
											event.stopPropagation();
											removeTag(index);
										}}
										aria-label={getRemoveButtonAriaLabel(tag, index)}>
										<XIcon aria-hidden="true" />
									</button>
								)}
							</li>
						))}
					</ul>
				)}

				<input
					{...inputProps}
					ref={inputRef}
					id={controlId}
					form={form}
					disabled={disabled}
					readOnly={readOnly}
					required={required && value.length === 0}
					maxLength={maxLength}
					value={draft}
					placeholder={value.length === 0 ? placeholder : undefined}
					aria-invalid={!!error || undefined}
					aria-labelledby={ariaLabelledBy}
					aria-describedby={ariaDescribedBy}
					className={cn(styles.input, inputClassName)}
					onChange={(event) => {
						const nextDraft = event.target.value;
						const hasDelimiter = TAG_DELIMITER_PATTERN.test(nextDraft);

						if (isComposingRef.current) {
							setDraft(nextDraft);
						} else if (hasDelimiter) {
							const parts = nextDraft.split(TAG_DELIMITER_SPLIT_PATTERN);
							const hasTrailingDelimiter = TAG_DELIMITER_PATTERN.test(nextDraft.at(-1) ?? "");
							const uncommittedPart = hasTrailingDelimiter ? "" : (parts.pop() ?? "");

							appendTags(parts);
							setDraft(uncommittedPart);
						} else {
							setDraft(nextDraft);
						}

						if (isComposingRef.current || !hasDelimiter) {
							onClearError?.();
						}
					}}
					onKeyDown={handleKeyDown}
					onPaste={handlePaste}
					onCompositionStart={(event: CompositionEvent<HTMLInputElement>) => {
						isComposingRef.current = true;
						onCompositionStart?.(event);
					}}
					onCompositionEnd={(event: CompositionEvent<HTMLInputElement>) => {
						isComposingRef.current = false;
						onCompositionEnd?.(event);
					}}
					onBlur={(event) => {
						onBlur?.(event);
						const nextFocusedNode = event.relatedTarget;
						const focusRemainsInside = nextFocusedNode instanceof Node && controlRef.current?.contains(nextFocusedNode);

						if (!event.defaultPrevented && !focusRemainsInside && addOnBlur && !isEditingDisabled) {
							commitDraft();
						}
					}}
				/>

				{name &&
					value.map((tag, index) => (
						<input key={`${getTagKey(tag)}-${index}`} type="hidden" name={name} value={tag} form={form} disabled={disabled} />
					))}
			</div>

			<span className="visuallyHidden" aria-live="polite" aria-atomic="true">
				{announcement}
			</span>
		</InputUI>
	);
}
