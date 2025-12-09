"use client";

import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useCallback, useEffect, useState } from "react";
import { StoredMessage } from "@langchain/core/messages";
import { useHistory } from "./useHistory";
import { Tab } from "@/component/Tab";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { v4 as uuidv4 } from "uuid";
import { NICKNAME } from "@/constants";

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sessions, saveSession, deleteSession, isLoading } = useHistory();
  const [currentTab, setCurrentTab] = useState<string>();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const addSession = useCallback(() => {
    const id = uuidv4();
    saveSession(id, []);
    setCurrentTab(id);
  }, [saveSession]);

  function removeSession(id: string) {
    if (id === currentTab) setCurrentTab(Object.keys(sessions)[0]);
    deleteSession(id);
  }

  // Derive currentTab from sessions - select first available tab if current is not found
  const sessionIds = Object.keys(sessions);
  const validCurrentTab = currentTab && sessionIds.includes(currentTab) ? currentTab : sessionIds[0];

  // Initialize with default session if none exists
  if (!isLoading && sessionIds.length === 0) {
    const id = uuidv4();
    saveSession(id, []);
    return null;
  }

  const drawerWidth = 240;

  const drawerContent = (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <MenuList sx={{ flexGrow: 1 }}>
        {Object.entries(sessions).map(([id, messages]) => (
           <MenuItem
             key={id}
             onClick={() => {
               setCurrentTab(id);
               if (isMobile) setMobileOpen(false);
             }}
             selected={id === validCurrentTab}
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
      <Box textAlign="center" sx={{ p: 2 }}>
        <Button variant="contained" onClick={addSession}>
          New Chat
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          display: { xs: "block", sm: "none" }, // Show only on mobile
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Box>
            <Typography variant="h6">LLM Example App</Typography>
            <Typography variant="subtitle2">
              AI {NICKNAME ? NICKNAME + " " : ""} will answer to your questions!
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          overflowY: "auto",
          overflowX: "hidden",
        }}
        aria-label="mailbox folders"
      >
        {/* Drawer for mobile */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        {/* Drawer for desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              position: "relative", // To ensure it stays within the flex container
              height: "100%",
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // p: 3, // Remove default padding if not needed
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          // overflow: "auto", // Removed as Tab component will handle its own scroll
          paddingTop: { xs: "64px", sm: "0" }, // Adjust for AppBar height on mobile
          // paddingBottom: "80px", // Removed as Tab component's paddingBottom will handle this
        }}
      >
        {/* <Toolbar sx={{ display: { xs: "block", sm: "none" } }} />  This Toolbar is for spacing if AppBar is not fixed */}
         {Object.entries(sessions).map(([id, messages]) => (
           <Tab
             key={id}
             open={id === validCurrentTab}
             history={messages}
             saveHistory={(messages) => saveSession(id, messages)}
           />
         ))}
      </Box>
    </Box>
  );
}

function getTabName(session: StoredMessage[]): string {
  if (session.length === 0) return "New chat";
  return session[0].data.content;
}
