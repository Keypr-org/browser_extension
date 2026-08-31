// Login fields messages

export interface PasswordsFieldsHTML {
    password?: HTMLInputElement;
    confirmPassword?: HTMLInputElement;
}

export interface DetectedFieldsHTML {
    username?: HTMLInputElement;
    password?: HTMLInputElement;
    confirmPassword?: HTMLInputElement;
    firstname?: HTMLInputElement;
    lastname?: HTMLInputElement;
    email?: HTMLInputElement;
    address?: HTMLInputElement;
    city?: HTMLInputElement;
    postalCode?: HTMLInputElement;
    country?: HTMLInputElement;
    dateOfBirth?: HTMLInputElement;
}

export interface FieldDescriptor {
    type: string;
    class: string;
    name: string;
    placeholder: string;
    id: string;
    autocomplete?: string;
}

export interface LoginFieldsDetectedMessage {
    type: "LOGIN_FIELDS_DETECTED";
    fields: {
        username?: FieldDescriptor;
        password?: FieldDescriptor;
        confirmPassword?: FieldDescriptor;
        firstname?: FieldDescriptor;
        lastname?: FieldDescriptor;
        email?: FieldDescriptor;
        address?: FieldDescriptor;
        city?: FieldDescriptor;
        postalCode?: FieldDescriptor;
        country?: FieldDescriptor;
        dateOfBirth?: FieldDescriptor;
    };
}

export interface TabInfo {
    tabId: number;
    url: string;
    frameId: number;
}

export interface FrameLoginFields {
    tab: TabInfo;
    fields: LoginFieldsDetectedMessage["fields"];
}

export interface FillCredentialField {
    descriptor: FieldDescriptor;
    value: string;
}

export interface FillCredentialsMessage {
    type: "FILL_CREDENTIALS";

    fields: {
        username?: FillCredentialField;
        password?: FillCredentialField;
        firstname?: FillCredentialField;
        lastname?: FillCredentialField;
        email?: FillCredentialField;
        address?: FillCredentialField;
        city?: FillCredentialField;
        postalCode?: FillCredentialField;
        country?: FillCredentialField;
        dateOfBirth?: FillCredentialField;
        confirmPassword?: FillCredentialField;
    };
}

// Json messages

export interface GetEntriesMessage {
    type: "GET_ENTRIES";
    url: string;
}

export interface GetPasswordMessage {
    type: "GET_PASSWORD";
    id: number;
}

export interface Entry {
    id: number;
    url: string;
    username: string;
}

export interface ReceivedEntry {
    id: number;
    username: string;
}

export interface EntriesMessage {
    type: "ENTRIES";
    entries: ReceivedEntry[];
}

export interface PasswordMessage {
    type: "PASSWORD";
    password: string;
}

export interface ErrorMessage {
    type: "ERROR";
    code: string;
}

export type NativeMessage =
    | GetEntriesMessage
    | GetPasswordMessage
    | EntriesMessage
    | PasswordMessage
    | ErrorMessage;