"use client";

import ollama from "ollama/browser";

import { Textarea } from "@/components/ui/textarea";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Message, MESSAGE_SCHEMA } from "./message";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Page() {
  const [newMessageText, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();

  const submitMessage = useCallback(() => {
    const newUserMessage: Message = {
      role: "user",
      content: newMessageText.trim(),
    };
    setInput("");
    setMessages((messages) => [...messages, newUserMessage]);

    startTransition(async () => {
      const response = await ollama.chat({
        model: "llama3",
        messages: [...messages, newUserMessage],
      });
      const newAssistantMessage = MESSAGE_SCHEMA.parse(response.message);

      setMessages((messages) => [...messages, newAssistantMessage]);
    });
  }, [messages, newMessageText]);

  // Add keyboard shortcut for sending message.
  useEffect(() => {
    function handleKeypress(event: KeyboardEvent) {
      if (event.metaKey && event.key === "Enter") submitMessage();
    }

    window.addEventListener("keydown", handleKeypress);
    return () => window.removeEventListener("keydown", handleKeypress);
  });

  return (
    <main>
      <section className="grow p-4">
        <MessageList>
          {messages.map((message, index) => (
            <MessageListItem key={index} message={message} />
          ))}
        </MessageList>
      </section>

      <section className="p-4 shrink-0 sticky bottom-0 left-0 right-0 bg-muted">
        <form
          className="flex items-end flex-col gap-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage();
          }}
        >
          <Textarea
            value={newMessageText}
            onChange={(event) => setInput(event.target.value)}
            disabled={isPending}
          />
          <Button size="sm" disabled={isPending}>
            Send
          </Button>
        </form>
      </section>
    </main>
  );
}
type MessageListItemProps = { message: Message };

function MessageListItem(props: MessageListItemProps) {
  return (
    <li className="flex flex-col border rounded-xl py-3 px-4 bg-background gap-y-1">
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
