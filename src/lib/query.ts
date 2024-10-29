export function queryTargetFromElementPath<T extends Element>(
    target: Element,
    selector: string,
): T | null {
    while (!target.matches(selector)) {
        if (!target.parentElement) {
            return null;
        }

        target = target.parentElement;
    }

    return target as T;
}
