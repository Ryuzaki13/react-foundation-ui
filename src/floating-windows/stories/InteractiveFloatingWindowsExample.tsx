import { useState } from "react";

import { Button } from "../../button";
import { FlexContainer } from "../../flex";
import { InputText } from "../../input";
import { Textarea } from "../../textarea";
import { FloatingWindow, FloatingWindows } from "../index";

/** Сценарий хранит черновики снаружи окон, чтобы закрытие панели не удаляло введённый текст. */
export function InteractiveFloatingWindowsExample() {
	const [notesOpen, setNotesOpen] = useState(true);
	const [detailsOpen, setDetailsOpen] = useState(true);
	const [notes, setNotes] = useState("Проверьте ввод текста, выделение и прокрутку независимо от перемещения окна.");
	const [name, setName] = useState("Рабочий набросок");
	const [saved, setSaved] = useState(false);

	return (
		<FlexContainer column gap="md">
			<p>
				Перемещайте окна за кнопку в заголовке. С клавиатуры: Space или Enter включает перемещение, стрелки меняют положение, Shift
				уменьшает шаг, Escape отменяет перемещение.
			</p>
			<FlexContainer wrap gap="sm">
				<Button
					type="button"
					data-floating-windows-example-action="open-notes"
					disabled={notesOpen}
					onClick={() => setNotesOpen(true)}>
					Открыть заметки
				</Button>
				<Button
					type="button"
					data-floating-windows-example-action="open-details"
					disabled={detailsOpen}
					onClick={() => setDetailsOpen(true)}>
					Открыть сведения
				</Button>
			</FlexContainer>
			<FloatingWindows style={{ height: "min(70dvh, 36rem)", background: "var(--surface-2)" }}>
				{notesOpen && (
					<FloatingWindow
						id="notes"
						title="Заметки"
						width="24rem"
						height="21rem"
						defaultPosition={{ x: 20, y: 24 }}
						onClose={() => setNotesOpen(false)}
						actions={
							<Button
								type="button"
								appearance="ghost"
								data-floating-windows-example-action="clear-notes"
								onClick={() => setNotes("")}>
								Очистить
							</Button>
						}>
						<FlexContainer column gap="md">
							<Textarea
								label="Текст заметки"
								value={notes}
								onChange={setNotes}
								rows={5}
								data-floating-windows-example-field="notes"
							/>
							<p>Закройте окно и откройте снова: черновик остаётся у владельца этого примера.</p>
						</FlexContainer>
					</FloatingWindow>
				)}
				{detailsOpen && (
					<FloatingWindow
						id="details"
						title="Сведения"
						width="22rem"
						height="19rem"
						defaultPosition={{ x: 320, y: 120 }}
						onClose={() => setDetailsOpen(false)}>
						<FlexContainer column gap="md">
							<InputText label="Название" value={name} onChange={setName} data-floating-windows-example-field="name" />
							<Button type="button" data-floating-windows-example-action="save-details" onClick={() => setSaved(true)}>
								Сохранить в примере
							</Button>
							<p role="status">{saved ? "Изменения отмечены как сохранённые." : "Поля и кнопки остаются интерактивными."}</p>
						</FlexContainer>
					</FloatingWindow>
				)}
			</FloatingWindows>
		</FlexContainer>
	);
}
