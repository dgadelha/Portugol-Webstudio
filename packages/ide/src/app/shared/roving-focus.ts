/**
 * Foco itinerante (roving tabindex) da WAI-ARIA, para barras de ferramentas e
 * listas de abas: as setas, o Home e o End movem o foco entre os itens, e só o
 * item em foco fica na ordem do Tab.
 *
 * Devolve o item que recebeu o foco, ou `undefined` se a tecla não é de
 * navegação.
 */
export function moveRovingFocus(
  event: KeyboardEvent,
  container: HTMLElement,
  selector: string,
  orientation: "vertical" | "horizontal",
) {
  const previous = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
  const next = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

  if (![previous, next, "Home", "End"].includes(event.key)) {
    return;
  }

  const items = [...container.querySelectorAll<HTMLElement>(selector)];
  const index = items.indexOf(document.activeElement as HTMLElement);

  let target: HTMLElement | undefined;

  if (event.key === "Home") {
    target = items[0];
  } else if (event.key === "End") {
    target = items.at(-1);
  } else {
    const step = event.key === next ? 1 : -1;
    target = items[(index + step + items.length) % items.length];
  }

  event.preventDefault();

  for (const item of items) {
    item.tabIndex = item === target ? 0 : -1;
  }

  target?.focus();
  return target;
}
