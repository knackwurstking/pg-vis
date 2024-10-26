export function targetFromElementPath(target: Element, selector: string) {
    while (!target.matches(selector)) {
        if (!target.parentElement) {
            return null
        }

        target = target.parentElement
    }

    return target
}
