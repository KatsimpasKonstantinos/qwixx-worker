const maxAvatar = 8;

const rules: Array<(avatar: number) => string | null> = [
    (avatar) => !avatar ? "Avatar is empty" : null,
    (avatar) => !/^[0-9]+$/.test(avatar.toString()) ? "Avatar must be a number" : null,
    (avatar) => avatar < 0 ? `Avatar cant be negative` : null,
    (avatar) => avatar > maxAvatar ? `Avatar is too long` : null,
];

export function isAvatarValid(avatar: number): boolean {
    return !rules.some(rule => rule(avatar) !== null);
}

export function getAvatarValidationError(avatar: number): string {
    for (const rule of rules) {
        const brokenRule = rule(avatar);
        if (brokenRule) return brokenRule;
    }
    return "Avatar is valid";
}

