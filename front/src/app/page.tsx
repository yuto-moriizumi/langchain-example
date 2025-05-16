"use client";

import {
  Box,
  Button,
  Grid,
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { StoredMessage } from "@langchain/core/messages";
import { useHistory } from "./useHistory";
import { Tab } from "@/component/Tab";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const { sessions, saveSession, deleteSession, isLoading } = useHistory();
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

  // add default session if no session exists
  useEffect(() => {
    if (isLoading) return;
    if (Object.keys(sessions).length === 0) addSession();
  }, [addSession, isLoading, sessions]);

  // select first tab if current tab is not found
  useEffect(() => {
    if (isLoading || currentTab) return;
    const ids = Object.keys(sessions);
    if (ids.length > 0) setCurrentTab(ids[0]);
  }, [currentTab, isLoading, sessions]);

  return (
    <Grid container>
      <Grid
        size={{ sm: 3, md: 2 }}
        borderRight="1px lightgray solid"
        overflow="scroll"
        maxHeight="100vh"
      >
        <MenuList>
          {Object.entries(sessions).map(([id, messages]) => (
            <MenuItem
              key={id}
              onClick={() => setCurrentTab(id)}
              selected={id === currentTab}
            >
              <ListItemText primaryTypographyProps={{ noWrap: true }}>
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
      </Grid>
      <Grid size={{ sm: 9, md: 10 }} overflow="scroll" maxHeight="100vh">
        {Object.entries(sessions).map(([id, session]) => (
          <Tab
            key={id}
            open={id === currentTab}
            history={session}
            saveHistory={(messages) => saveSession(id, messages)}
          />
        ))}
      </Grid>
    </Grid>
  );
}

function getTabName(session: StoredMessage[]): string {
  if (session.length === 0) return "New chat";
  return session[0].data.content;
}
