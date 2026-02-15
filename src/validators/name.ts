const nameMinLength = 3;
const nameMaxLength = 16;

const rules: Array<(name: string) => string | null> = [
    (name) => !name ? "Name is empty" : null,
    (name) => !/^[a-zA-Z0-9_-]+$/.test(name) ? "Name can't contain symbols" : null,
    (name) => name.length < nameMinLength ? `Name is too short` : null,
    (name) => name.length > nameMaxLength ? `Name is too long` : null,
];

export function isNameValid(name: string): boolean {
    return !rules.some(rule => rule(name) !== null);
}

export function getNameValidationError(name: string): string {
    for (const rule of rules) {
        const brokenRule = rule(name);
        if (brokenRule) return brokenRule;
    }
    return "Name is valid";
}

