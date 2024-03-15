"use server";

import { MODEL } from "./constants";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  StoredMessage,
} from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/memory";
import { ChatPromptTemplate, PromptTemplate } from "@langchain/core/prompts";
import { ChatAnthropic } from "@langchain/anthropic";

type ChatRequest = {
  input: string;
  model?: (typeof MODEL)[keyof typeof MODEL];
  history?: StoredMessage[];
};
type ChatResponse = {
  output: string;
  history: StoredMessage[];
};

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  "use server";

  const model = new ChatAnthropic({
    modelName: MODEL.SONNET,
  });

  const history = new ChatMessageHistory(
    deserializeMessages(req.history ?? []),
  );

  const nickname = process.env.NEXT_PUBLIC_NICKNAME ?? "AI";
  const chatPrompt = PromptTemplate.fromTemplate(
    `You are an AI agent named '${nickname}'. You are a joker, so you have a habit of replacing other people in conversations with yourself.` +
      ` Please answer the questions based on the following information.\n` +
      `----
Chat History:
{chatHistory}
----
Question: {question}`,
  );

  const prompt = await chatPrompt.format({
    question: req.input,
    chatHistory: await ChatPromptTemplate.fromMessages(
      await history.getMessages(),
    ).format({}),
  });
  console.log(prompt);

  await history.addUserMessage(req.input);
  const result = (await model.invoke(prompt)).content.toString();
  await history.addAIMessage(result);

  return {
    output: result,
    history: (await history.getMessages()).map((m) => m.toDict()),
  };

  function deserializeMessages(messages: StoredMessage[]) {
    return messages.map((m) => {
      switch (m.type) {
        case "human":
          return new HumanMessage(m.data);
        case "ai":
          return new AIMessage(m.data);
        case "system":
          return new SystemMessage(m.data);
        default:
          throw new Error(`Unknown message type: ${m.type}`);
      }
    });
  }
}
