"use client";

import ollama from "ollama/browser";

import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

type Message = {
  role: "user" | "assistant";
  content: string;
  images?: Uint8Array[] | string[];
};

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

            setMessages((messages) => [...messages, response.message]);
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
