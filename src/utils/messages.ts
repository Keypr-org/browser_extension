/**
 * @file Message Type Definitions
 * @brief Defines all message types used for inter-process communication
 * @details Contains interfaces for login field detection, credential filling, and native messaging
 * between content scripts, service worker, popup, and native host.
 */

// ============================================================================
// Login Fields Detection Messages
// ============================================================================

/** Represents login fields found on a page (either or both may be present) */
export interface LoginFields {
    username?: HTMLInputElement;
    password?: HTMLInputElement;
}

/** Describes a form field by its HTML attributes for later retrieval */
export interface FieldDescriptor {
    type: string;
    class: string;
    name: string;
    placeholder: string;
    id: string;
    autocomplete?: string;
}

/** Message sent when login fields are detected on a page */
export interface LoginFieldsDetectedMessage {
    type: "LOGIN_FIELDS_DETECTED";
    fields: {
        username?: FieldDescriptor;
        password?: FieldDescriptor;
    };
}

/** Information about a tab including its ID, URL, and frame ID */
export interface TabInfo {
    tabId: number;
    url: string;
    frameId: number;
}

/** Stored login fields information for a specific tab/frame combination */
export interface FrameLoginFields {
    tab: TabInfo;
    fields: LoginFieldsDetectedMessage["fields"];
}

/** Message containing credentials to be filled into form fields */
export interface FillCredentialsMessage {
    type: "FILL_CREDENTIALS";
    username?: string;
    password?: string;
    usernameField?: FieldDescriptor;
    passwordField?: FieldDescriptor;
}

// ============================================================================
// Native Messaging Message Types
// ============================================================================

/** Request to retrieve credential entries for a specific URL */
export interface GetEntriesMessage {
    type: "GET_ENTRIES";
    url: string;
}

/** Request to retrieve the password for a specific credential entry */
export interface GetPasswordMessage {
    type: "GET_PASSWORD";
    id: string;
}

/** Represents a credential entry with display information (password not included) */
export interface Entry {
    id: string;
    url: string;
    username: string;
}

/** Credential entry data received from native host (password retrieved separately) */
export interface ReceivedEntry {
    id: string;
    username: string;
}

/** Response message containing credential entries for display */
export interface EntriesMessage {
    type: "ENTRIES";
    entries: ReceivedEntry[];
}

/** Response message containing a password for credential filling */
export interface PasswordMessage {
    type: "PASSWORD";
    password: string;
}

/** Error response message from native host */
export interface ErrorMessage {
    type: "ERROR";
    code: string;
}

/** Union type representing all possible native messaging message types */
export type NativeMessage =
    | GetEntriesMessage
    | GetPasswordMessage
    | EntriesMessage
    | PasswordMessage
    | ErrorMessage;