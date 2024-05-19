"use client";

import {
  Box,
  Button,
  Drawer,
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
  Stack,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { StoredMessage } from "langchain/schema";
import { useHistory } from "./useHistory";
import { Tab } from "@/component/Tab";
import { DRAWER_WIDTH } from "@/constants";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const { sessions, saveSession, deleteSession } = useHistory();
  const [currentTab, setCurrentTab] = useState<string>();

  const addSession = useCallback(() => {
    const id = uuidv4();
    saveSession(id, []);
    setCurrentTab(id);
  }, [saveSession]);

  function removeSession(id: string) {
    if (id === currentTab) setCurrentTab(Object.keys(sessions)[0]);
    deleteSession(id);
  }

  useEffect(() => {
    if (Object.keys(sessions).length === 0) {
      addSession();
    }
  }, [addSession, sessions]);

  return (
    <Stack direction="row">
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: DRAWER_WIDTH,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        <MenuList>
          {Object.entries(sessions).map(([id, messages]) => (
            <MenuItem
              key={id}
              onClick={() => setCurrentTab(id)}
              selected={id === currentTab}
            >
              <ListItemText
                primaryTypographyProps={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {getTabName(messages)}
              </ListItemText>
              <IconButton
                onClick={(e) => (e.stopPropagation(), removeSession(id))}
              >
                <DeleteForeverIcon />
              </IconButton>
            </MenuItem>
          ))}
        </MenuList>
        <Box textAlign="center">
          <Button variant="contained" onClick={addSession}>
            New Chat
          </Button>
        </Box>
      </Drawer>
      {Object.entries(sessions).map(([id, session]) => (
        <Tab
          key={id}
          open={id === currentTab}
          history={session}
          saveHistory={(messages) => saveSession(id, messages)}
        />
      ))}
    </Stack>
  );
}

function getTabName(session: StoredMessage[]): string {
  if (session.length === 0) return "New chat";
  return session[0].data.content;
}
