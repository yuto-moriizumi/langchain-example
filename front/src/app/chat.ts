"use server";

import { MODEL } from "../constants";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  StoredMessage,
} from "@langchain/core/messages";
import { ChatMessageHistory } from "langchain/memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, DallEAPIWrapper } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import {
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { BaseMessage } from "langchain/schema";

type ChatRequest = {
  input: string;
  model?: (typeof MODEL)[keyof typeof MODEL];
  history?: StoredMessage[];
};
type ChatResponse = {
  output: string;
  history: StoredMessage[];
};

const imageGenerationTool = new DallEAPIWrapper({
  model: "dall-e-2",
  size: "256x256",
});
const nickname = process.env.NEXT_PUBLIC_NICKNAME ?? "AI";
const llm = new ChatOpenAI({ modelName: MODEL.GPT4O });

type Schema = {
  input: string;
  chat_history: BaseMessage[];
  agent_scratchpad: BaseMessage[];
};
type InvokeSchema = Omit<Schema, "agent_scratchpad">;
const prompt = new ChatPromptTemplate<Schema>({
  inputVariables: ["input", "agent_scratchpad", "chat_history"],
  promptMessages: [
    new SystemMessage(
      `You are an AI agent named '${nickname}'.` +
        " You are a joker, so you have a habit of replacing other people in conversations with yourself." +
        ` Please answer the questions based on the following information.`,
    ),
    new MessagesPlaceholder("chat_history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
    new MessagesPlaceholder("agent_scratchpad"),
  ],
});

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  "use server";

  const history = new ChatMessageHistory(
    deserializeMessages(req.history ?? []),
  );

  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools: [imageGenerationTool],
    prompt,
  });

  const agentExecutor = new AgentExecutor({
    agent,
    tools: [imageGenerationTool],
    verbose: true,
  });

  const { output } = (await agentExecutor.invoke(
    {
      input: req.input,
      chat_history: await history.getMessages(),
    } satisfies InvokeSchema,
    { recursionLimit: 1 }, // save my money from too much recursion
  )) as { output: string };

  await history.addUserMessage(req.input);
  await history.addAIMessage(output);

  return {
    output,
    history: (await history.getMessages()).map((m) => m.toDict()),
  };
}

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
