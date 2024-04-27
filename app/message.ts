import { z } from "zod";

export const MESSAGE_SCHEMA = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  images: z
    .union([z.array(z.instanceof(Uint8Array)), z.array(z.string())])
    .optional(),
});

export type Message = z.infer<typeof MESSAGE_SCHEMA>;
