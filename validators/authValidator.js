const { z } = require("zod");

const loginSchema = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .trim()
    .min(10, { message: "Phone must be 10 characters" })
    .max(10, { message: "Phone must be 10 characters" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(7, { message: "Password must be at-least 7 characters" })
    .max(1024, { message: "Password must not be more than 1024 characters" }),
});

const registerSchema = loginSchema.extend({
    fullName: z
    .string({required_error: "Full name is required"})
    .trim()
    .min(4, {message: "Name should be at-least 4 characters"})
    .max(1024, {message: "Name must not be more than 1024 characters"}),
    email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid email address" })
    .min(3, { message: "Email must be at-least 3 characters" })
    .max(255, { message: "Email must not be more than 255 characters" }),
})

module.exports = { loginSchema, registerSchema };
