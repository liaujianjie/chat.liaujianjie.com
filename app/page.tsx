"use client";

import ollama from "ollama/browser";

import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Bot, CircleUser } from "lucide-react";

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
    <main className="p-4 flex flex-col items-stretch gap-y-4">
      <div className="grow">
        <MessageList>
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
        </MessageList>
      </div>
      <form
        className="flex items-end flex-col gap-y-4"
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
    <li className="flex flex-col border rounded-md py-3 px-4 bg-background gap-y-1">
      <div className="font-semibold text-muted-foreground flex items-center">
        {props.message.role === "assistant" && <div>👽 Assistant</div>}
        {props.message.role === "user" && <div>🐱 You</div>}
      </div>
      <div>{props.message.content}</div>
    </li>
  );
}

type MessageListProps = {
  children: React.ReactNode;
};

function MessageList(props: MessageListProps) {
  return (
    <ol className="flex flex-col items-stretch gap-y-4">{props.children}</ol>
  );
}
