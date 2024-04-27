"use client";

import ollama from "ollama/browser";

import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";

const MESSAGE_SCHEMA = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  images: z
    .union([z.array(z.instanceof(Uint8Array)), z.array(z.string())])
    .optional(),
});

type Message = z.infer<typeof MESSAGE_SCHEMA>;

export default function Page() {
  const [newMessageText, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  return (
    <main className="">
      <pre>{JSON.stringify(messages, null, 2)}</pre>
      <ol>
        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}
      </ol>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            const newUserMessage: Message = {
              role: "user",
              content: newMessageText.trim(),
            };
            setInput("");
            setMessages((messages) => [...messages, newUserMessage]);
            const response = await ollama.chat({
              model: "llama3",
              messages: [...messages, newUserMessage],
            });
            const newAssistantMessage = MESSAGE_SCHEMA.parse(response.message);

            setMessages((messages) => [...messages, newAssistantMessage]);
          });
        }}
      >
        <Textarea
          value={newMessageText}
          onChange={(event) => setInput(event.target.value)}
          disabled={isPending}
        />
        <Button disabled={isPending}>Send</Button>
      </form>
    </main>
  );
}
type MessageProps = { message: Message };

function Message(props: MessageProps) {
  return (
    <li className="flex flex-col">
      <div className="text-sm font-semibold text-muted-foreground">
        {props.message.role}
      </div>
      <div>{props.message.content}</div>
    </li>
  );
}
