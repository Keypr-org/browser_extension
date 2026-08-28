import { findLoginFields } from "./login-fields.js";

const fields = findLoginFields();

console.log("Username field:", fields.username);
console.log("Password field:", fields.password);