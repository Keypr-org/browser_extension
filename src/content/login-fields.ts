export interface LoginFields {
    username?: HTMLInputElement;
    password?: HTMLInputElement;
}

function findPasswordField(): HTMLInputElement | undefined {
    const passwordFields = Array.from(
        document.querySelectorAll<HTMLInputElement>(
            'input[type="password"]'
        )
    );

    return passwordFields.find(
        (field) => !field.disabled && !field.readOnly
    );
}

function scoreUsernameField(field: HTMLInputElement): number {
    let score = 0;

    const autocomplete = field.autocomplete.toLowerCase();
    const type = field.type.toLowerCase();
    const name = field.name.toLowerCase();
    const id = field.id.toLowerCase();
    const placeholder = field.placeholder.toLowerCase();

    if (autocomplete === "username") {
        score += 100;
    }

    if (type === "email") {
        score += 50;
    }

    if (name.includes("username")) {
        score += 40;
    }

    if (name.includes("email")) {
        score += 40;
    }

    if (name.includes("login")) {
        score += 30;
    }

    if (id.includes("username")) {
        score += 40;
    }

    if (id.includes("email")) {
        score += 40;
    }

    if (id.includes("login")) {
        score += 30;
    }

    if (placeholder.includes("email")) {
        score += 20;
    }

    if (placeholder.includes("username")) {
        score += 20;
    }

    if (placeholder.includes("login")) {
        score += 15;
    }

    return score;
}

function findUsernameField(): HTMLInputElement | undefined {
    const fields = Array.from(
        document.querySelectorAll<HTMLInputElement>(
            'input:not([type="password"])'
        )
    ).filter(
        (field) => !field.disabled && !field.readOnly
    );

    let bestField: HTMLInputElement | undefined;
    let bestScore = 0;

    for (const field of fields) {
        const score = scoreUsernameField(field);

        if (score > bestScore) {
            bestScore = score;
            bestField = field;
        }
    }

    return bestField;
}

export function findLoginFields(): LoginFields {
    return {
        username: findUsernameField(),
        password: findPasswordField()
    };
}