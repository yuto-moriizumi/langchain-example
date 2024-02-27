"use client";

import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Document } from "langchain/document";
import { useState } from "react";
import { update } from "./update";

export default function Update() {
  const [docs, setDocs] = useState<Document<Record<string, unknown>>[]>([]);
  return (
    <main>
      <h1>Vector update page</h1>
      <Button variant="outlined" onClick={async () => setDocs(await update())}>
        Update
      </Button>
      {docs.length <= 0 ? null : (
        <>
          <Typography>The vector store has been updated!</Typography>
          <Typography>item count: {docs.length}</Typography>
          <List>
            {docs.map((doc, i) => (
              <ListItem key={i}>
                <ListItemText sx={{ whiteSpace: "pre-wrap", border: "solid" }}>
                  {doc.pageContent}
                  <br />
                  {JSON.stringify(doc.metadata)}
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </main>
  );
}
