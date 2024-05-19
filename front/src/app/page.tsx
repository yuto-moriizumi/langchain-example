"use client";

import { List, Stack, Box, Typography } from "@mui/material";
import { useState } from "react";
import { StoredMessage } from "langchain/schema";
import { chat } from "./chat";
import { Message } from "@/types";
import { History } from "@/component/History";
import { Form } from "@/component/Form";
import { NICKNAME } from "../constants";
import { useHistory } from "./useHistory";

export default function Home() {
  const { history, saveHistory } = useHistory();
  const [question, setQuestion] = useState<string>();

  const handleSend = async (content: string) => {
    setQuestion(content);
    const { history: newHistory } = await chat({ input: content, history });
    setQuestion(undefined);
    saveHistory(newHistory);
  };

  return (
    <Stack justifyContent="space-between" height="100vh">
      <Box padding={2}>
        <Typography variant="h3" textAlign="center">
          LLM Example App
        </Typography>
        <Typography textAlign="center">
          AI {NICKNAME ? NICKNAME + " " : ""} will answer to your questions!
        </Typography>
        <List>
          <History messages={getMessages(history, question)} />
        </List>
      </Box>
      <Form onSubmit={handleSend} />
    </Stack>
  );
}

function getMessages(history: StoredMessage[], question?: string): Message[] {
  if (question === undefined) return convertMessage(history);
  return [...convertMessage(history), { type: "human", content: question }];
}

function convertMessage(messages: StoredMessage[]): Message[] {
  return messages.map((m) => {
    if (m.type === "human" || m.type === "ai")
      return { type: m.type, content: m.data.content };
    throw new Error(`Unknown message type: ${m.type}`);
  });
}
