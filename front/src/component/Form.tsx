"use client";

import {
  TextField,
  Button,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { useState, KeyboardEvent } from "react";
import { MODEL } from "../constants"; // MODELをインポート

// onSubmitの型定義を更新
export function Form(props: {
  onSubmit: (message: string, model: keyof typeof MODEL) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [isPending, setIsPending] = useState(false);
  // MODELの最初のキーを初期選択モデルとする
  const modelKeys = Object.keys(MODEL) as (keyof typeof MODEL)[];
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODEL>(
    modelKeys[0],
  );

  async function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent new line in textarea
      await handleSend();
    }
  }

  async function handleSend() {
    const message = value.trim();
    if (!message) return; // メッセージが空の場合は送信しない
    setValue("");
    setIsPending(true);
    // 選択されたモデルをonSubmitに渡す
    await props.onSubmit(message, selectedModel);
    setIsPending(false);
  }

  const handleModelChange = (event: SelectChangeEvent<keyof typeof MODEL>) => {
    setSelectedModel(event.target.value as keyof typeof MODEL);
  };

  return (
    <Stack
      direction="column" // 縦方向に変更
      spacing={1} // 要素間のスペース
      padding={2}
      sx={(theme) => ({
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "background.paper",
        zIndex: 1, // 他の要素より手前に表示
        [theme.breakpoints.up("sm")]: {
          left: `${240}px`, // drawerWidth
        },
      })}
    >
      <FormControl fullWidth size="small">
        <InputLabel id="model-select-label">Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel}
          label="Model"
          onChange={handleModelChange}
        >
          {modelKeys.map((key) => (
            <MenuItem key={key} value={key}>
              {MODEL[key].name} ({MODEL[key].desc})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Stack direction="row" alignItems="center" width="100%">
        <TextField
          fullWidth
          multiline
          variant="outlined"
          value={value}
          placeholder="Input your question here"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          sx={{ mr: 1 }} // ボタンとの間に少しマージン
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={isPending || !value.trim()} // メッセージが空の場合も無効化
        >
          Submit
        </Button>
      </Stack>
    </Stack>
  );
}
