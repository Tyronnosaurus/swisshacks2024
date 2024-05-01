import { z } from "zod";

// Validator for chat messages sent by the user
export const SendMessageValidator = z.object({
    fileId: z.string(),
    message: z.string()
})