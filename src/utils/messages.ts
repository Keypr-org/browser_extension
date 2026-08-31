// Login fields messages

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
    };
}

export interface TabInfo {
    tabId: number;
    url: string;
    frameId: number;
}

export interface FrameLoginFields {
    tab?: TabInfo;
    fields: LoginFieldsDetectedMessage["fields"];
}

export interface FillCredentialsMessage {
    type: "FILL_CREDENTIALS";
    username?: string;
    password?: string;
    usernameField?: FieldDescriptor;
    passwordField?: FieldDescriptor;
}

// Json messages

export interface GetEntriesMessage {
    type: "GET_ENTRIES";
    url: string;
}

export interface GetPasswordMessage {
    type: "GET_PASSWORD";
    id: number;
    url: string;
    username: string;
}

export interface Entry {
    id: number;
    url: string;
    username: string;
}

export interface EntriesMessage {
    type: "ENTRIES";
    entries: Entry[];
}

export interface PasswordMessage {
    type: "PASSWORD";
    id: number;
    url: string;
    username: string;
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