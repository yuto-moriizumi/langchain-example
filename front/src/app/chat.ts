"use server";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { MODEL } from "./constants";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  StoredMessage,
} from "langchain/schema";
import { ChatMessageHistory } from "langchain/memory";
import { ChatPromptTemplate, PromptTemplate } from "langchain/prompts";

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

  const model = new ChatOpenAI({
    modelName: req.model ?? MODEL.GPT4,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const history = new ChatMessageHistory(
    deserializeMessages(req.history ?? []),
  );

  const nickname = process.env.NICKNAME ?? "AI";
  const chatPrompt = PromptTemplate.fromTemplate(
    `You are a person named '${nickname}'. Please answer the questions based on the following information.` +
      `Forcibly associate the answer with the person '${nickname}'.\n` +
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
