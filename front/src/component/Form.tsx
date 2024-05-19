"use client";

import { TextField, Button, Stack } from "@mui/material";
import { useState, KeyboardEvent } from "react";

export function Form(props: { onSubmit: (value: string) => Promise<void> }) {
  const [value, setValue] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent new line in textarea
      await handleSend();
    }
  }

  async function handleSend() {
    const message = value.trim();
    setValue("");
    setIsPending(true);
    await props.onSubmit(message);
    setIsPending(false);
  }

  return (
    <Stack direction="row" alignItems="center" padding={2}>
      <TextField
        fullWidth
        multiline
        variant="outlined"
        value={value}
        placeholder="Input your question here"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <Button
        variant="contained"
        onClick={handleSend}
        sx={{ ml: 2 }}
        disabled={isPending}
      >
        Submit
      </Button>
    </Stack>
  );
}
