import type { LoginFieldsDetectedMessage, FieldDescriptor, DetectedFieldsHTML, PasswordsFieldsHTML } from "../utils/messages.js";

function getInputFields(): HTMLInputElement[] {
    return Array.from(
        document.querySelectorAll<HTMLInputElement>("input")
    ).filter(
        (field) => !field.disabled && !field.readOnly
    );
}

function findPasswordFields(): PasswordsFieldsHTML {
    const passwordFields = getInputFields().filter(
        (field) => field.type.toLowerCase() === "password"
    );

    if (passwordFields.length === 0) {
        return {};
    }

    const confirmPassword = passwordFields.find((field) => {
        const name = field.name.toLowerCase();
        const id = field.id.toLowerCase();
        const placeholder = field.placeholder.toLowerCase();

        return (
            name.includes("confirm") ||
            name.includes("repeat") ||
            name.includes("reenter") ||
            name.includes("re-enter") ||
            id.includes("confirm") ||
            id.includes("repeat") ||
            id.includes("reenter") ||
            id.includes("re-enter") ||
            placeholder.includes("confirm") ||
            placeholder.includes("repeat") ||
            placeholder.includes("re-enter") ||
            placeholder.includes("reenter")
        );
    });

    // Explicitly identified confirmation field
    if (confirmPassword) {
        const password = passwordFields.find(
            (field) => field !== confirmPassword
        );

        return {
            password,
            confirmPassword
        };
    }

    // Fallback: if there are exactly two password fields,
    // assume the first is the password and the second is the confirmation.
    if (passwordFields.length === 2) {
        return {
            password: passwordFields[0],
            confirmPassword: passwordFields[1]
        };
    }

    // Only one password field
    return {
        password: passwordFields[0]
    };
}

function scoreField(field: HTMLInputElement, keywords: string[]): number {
    let score = 0;

    const autocomplete = field.autocomplete.toLowerCase();
    const type = field.type.toLowerCase();
    const name = field.name.toLowerCase();
    const id = field.id.toLowerCase();
    const placeholder = field.placeholder.toLowerCase();

    for (const keyword of keywords) {
        if (autocomplete.includes(keyword)) {
            score += 100;
        }

        if (name.includes(keyword)) {
            score += 40;
        }

        if (id.includes(keyword)) {
            score += 40;
        }

        if (placeholder.includes(keyword)) {
            score += 20;
        }
    }

    if (keywords.includes("email") && type === "email") {
        score += 50;
    }

    return score;
}

function findField(fields: HTMLInputElement[], keywords: string[]): HTMLInputElement | undefined {
    let bestField: HTMLInputElement | undefined;
    let bestScore = 0;

    for (const field of fields) {
        const score = scoreField(field, keywords);

        if (score > bestScore) {
            bestScore = score;
            bestField = field;
        }
    }

    return bestField;
}

function findUsernameField(fields: HTMLInputElement[]): HTMLInputElement | undefined {
    return findField(fields, [
        "username",
        "login"
    ]);
}

function findFirstnameField(fields: HTMLInputElement[]): HTMLInputElement | undefined {
    return findField(fields, [
        "given-name",
        "firstname",
        "first-name",
        "first_name",
        "fname"
    ]);
}

function findLastnameField(fields: HTMLInputElement[]): HTMLInputElement | undefined {
    return findField(fields, [
        "family-name",
        "lastname",
        "last-name",
        "last_name",
        "surname",
        "lname"
    ]);
}

function findEmailField(fields: HTMLInputElement[]): HTMLInputElement | undefined {
    return findField(fields, [
        "email"
    ]);
}

function findAddressField(fields: HTMLInputElement[]): HTMLInputElement | undefined {
    return findField(fields, [
        "street",
        "address",
        "address-line1",
        "address-line2"
    ]);
}

function findCityField(fields: HTMLInputElement[]): HTMLInputElement | undefined {
    return findField(fields, [
        "city",
        "address-level2"
    ]);
}

function findPostalCodeField(fields: HTMLInputElement[]): HTMLInputElement | undefined {
    return findField(fields, [
        "postal",
        "postcode",
        "zip"
    ]);
}

function findCountryField(fields: HTMLInputElement[]): HTMLInputElement | undefined {
    return findField(fields, [
        "country",
        "country-name"
    ]);
}

export function findLoginFields(): DetectedFieldsHTML {
    const fields = getInputFields();
    const passwords = findPasswordFields();

    return {
        username: findUsernameField(fields),
        password: passwords.password,
        confirmPassword: passwords.confirmPassword,
        firstname: findFirstnameField(fields),
        lastname: findLastnameField(fields),
        email: findEmailField(fields),
        address: findAddressField(fields),
        city: findCityField(fields),
        postalCode: findPostalCodeField(fields),
        country: findCountryField(fields)
    };
}

function createFieldDescriptor(field: HTMLInputElement): FieldDescriptor {
    return {
        type: field.type,
        class: field.className,
        name: field.name,
        placeholder: field.placeholder,
        id: field.id,
        autocomplete: field.autocomplete
    };
}

export function createMessageLoginField(): LoginFieldsDetectedMessage {
    const fields = findLoginFields();

    return {
        type: "LOGIN_FIELDS_DETECTED",
        fields: {
            username: fields.username
                ? createFieldDescriptor(fields.username)
                : undefined,

            password: fields.password
                ? createFieldDescriptor(fields.password)
                : undefined,

            confirmPassword: fields.confirmPassword
                ? createFieldDescriptor(fields.confirmPassword)
                : undefined,

            firstname: fields.firstname
                ? createFieldDescriptor(fields.firstname)
                : undefined,

            lastname: fields.lastname
                ? createFieldDescriptor(fields.lastname)
                : undefined,

            email: fields.email
                ? createFieldDescriptor(fields.email)
                : undefined,

            address: fields.address
                ? createFieldDescriptor(fields.address)
                : undefined,

            city: fields.city
                ? createFieldDescriptor(fields.city)
                : undefined,

            postalCode: fields.postalCode
                ? createFieldDescriptor(fields.postalCode)
                : undefined,

            country: fields.country
                ? createFieldDescriptor(fields.country)
                : undefined
        }
    };
}