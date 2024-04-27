"use client";

import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  return (
    <main className="">
      <ol>
        <li>
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-muted-foreground">
              ollama
            </div>
            <div>shit</div>
          </div>
        </li>
      </ol>
      <Textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
      />
    </main>
  );
}
