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
import { MODEL, NICKNAME } from "../constants"; // MODELをインポート
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

  // handleSendのシグネチャを更新し、modelKeyを受け取る
  const handleSend = async (content: string, modelKey: keyof typeof MODEL) => {
    setQuestion(content);
    // 選択されたモデルオブジェクトをchat関数に渡す
    const selectedModelObject = MODEL[modelKey];
    const { history: newHistory } = await chat({
      input: content,
      history,
      model: selectedModelObject,
    });
    setQuestion(undefined);
    saveHistory(newHistory);
  };

  return (
    <Stack
      justifyContent="space-between"
      height="100%"
      display={open ? undefined : "none"}
    >
      <Box
        padding={2}
        sx={{
          overflowY: "auto",
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
