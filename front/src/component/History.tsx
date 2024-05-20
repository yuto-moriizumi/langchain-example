"use client";

import {
  ListItem,
  ListItemText,
  Typography,
  Avatar,
  ListItemAvatar,
} from "@mui/material";
import Markdown from "markdown-to-jsx";
import { Message, Type } from "@/types";
import { NICKNAME } from "@/constants";

export function History(props: { messages: Message[] }) {
  return props.messages.map((message, index) => (
    <ListItem key={index}>
      <ListItemAvatar>
        <Avatar
          src={message.type === "ai" ? "computer_jinkou_chinou.png" : undefined}
        />
      </ListItemAvatar>
      <ListItemText
        primary={getDisplayName(message.type)}
        secondary={
          <Markdown
            options={{
              overrides: {
                p: { component: Typography },
                span: { component: Typography },
              },
            }}
          >
            {message.content}
          </Markdown>
        }
        sx={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}
      />
      <Typography></Typography>
    </ListItem>
  ));
}

function getDisplayName(type: Type) {
  return type === "ai" ? NICKNAME ?? "AI" : "YOU";
}
