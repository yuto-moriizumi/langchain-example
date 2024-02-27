"use client";

import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  Box,
  Typography,
  Avatar,
  ListItemAvatar,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { StoredMessage } from "langchain/schema";
import { chat } from "./chat";

enum User {
  YOU = "You",
  AI = "AI",
}
type Message = { user: User; text: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [history, setHistory] = useState<StoredMessage[]>([]);
  const ref = useRef<HTMLUListElement>(null);

  const handleSend = async () => {
    setMessages((prev) => [...prev, { user: User.YOU, text: newMessage }]);
    setNewMessage("");
    const { output, history: newHistory } = await getChat({
      input: newMessage,
      history,
    });
    setMessages((prev) => [...prev, { user: User.AI, text: output }]);
    setHistory(newHistory);
  };

  useEffect(() => {
    ref.current?.scroll({ top: 999999, behavior: "smooth" });
  }, [messages]);

  return (
    <Stack justifyContent="space-between" height="100vh">
      <Box padding={2} ref={ref}>
        <Typography variant="h3" textAlign="center">
          LLM Example App
        </Typography>
        <Typography textAlign="center">
          AI will answer to your questions!
        </Typography>
        <List>
          {messages.map((message, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar />
              </ListItemAvatar>
              <ListItemText
                primary={message.user}
                secondary={message.text}
                sx={{ whiteSpace: "pre-wrap" }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      <Stack direction="row" alignItems="center" padding={2}>
        <TextField
          fullWidth
          variant="outlined"
          value={newMessage}
          placeholder="Input your question here"
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Button variant="contained" onClick={handleSend} sx={{ ml: 2 }}>
          Submit
        </Button>
      </Stack>
    </Stack>
  );
}

async function getChat(req: Request) {
  return chat(req);
}

type Request = {
  input: string;
  history?: StoredMessage[];
};
type Response = {
  output: string;
  history: StoredMessage[];
};
