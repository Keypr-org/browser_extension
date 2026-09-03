/**
 * @file Field Lookup Utility
 * @brief Locates input fields by descriptor properties
 * @details Provides utility function to find HTMLInputElement by ID or name attribute
 * based on FieldDescriptor information.
 */

import type { FieldDescriptor } from "./messages.js";

/**
 * Finds an input field by its ID or name attribute
 * @param descriptor The FieldDescriptor containing field identification information
 * @return The HTMLInputElement if found, undefined otherwise
 */
export function findField(descriptor: FieldDescriptor): HTMLInputElement | undefined {
    if (descriptor.id) {
        const field = document.getElementById(descriptor.id);

        if (field instanceof HTMLInputElement) {
            return field;
        }
    }

    if (descriptor.name) {
        return Array.from(
            document.querySelectorAll<HTMLInputElement>("input[name]")
        ).find((field) => field.name === descriptor.name);
    }

    return undefined;
}