"use client";

import {
  List,
  Stack,
  Box,
  Typography,
  useMediaQuery,
  Theme,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { StoredMessage } from "@langchain/core/messages";
import { Message } from "@/types";
import { History } from "@/component/History";
import { Form } from "@/component/Form";
import { NICKNAME } from "../constants";
import { chat } from "@/app/chat";

export function Tab(props: {
  open: boolean;
  history: StoredMessage[];
  saveHistory: (history: StoredMessage[]) => void;
}) {
  const { open, history, saveHistory } = props;
  const [question, setQuestion] = useState<string>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSend = async (content: string) => {
    setQuestion(content);
    const { history: newHistory } = await chat({ input: content, history });
    setQuestion(undefined);
    saveHistory(newHistory);
  };

  return (
    <Stack
      justifyContent="space-between"
      height="100vh"
      flexGrow={1}
      display={open ? undefined : "none"}
    >
      <Box
        padding={2}
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          // Adjust paddingBottom to prevent content from being hidden by the Form
          // The Form has padding={2} (16px top/bottom) and some intrinsic height.
          // Let's assume an approximate height of 80px for the Form for now.
          // This might need fine-tuning.
          paddingBottom: "80px",
        }}
      >
        {!isMobile && (
          <>
            <Typography variant="h3" textAlign="center">
              LLM Example App
            </Typography>
            <Typography textAlign="center">
              AI {NICKNAME ? NICKNAME + " " : ""} will answer to your questions!
            </Typography>
          </>
        )}
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
