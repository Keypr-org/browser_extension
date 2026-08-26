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