"use server";

import { ChatOpenAI } from "langchain/chat_models/openai";
import { INDEX_NAME, MODEL } from "./constants";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  StoredMessage,
} from "langchain/schema";
import { ChatMessageHistory } from "langchain/memory";
import { ChatPromptTemplate, PromptTemplate } from "langchain/prompts";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import { PineconeStore } from "@langchain/pinecone";

/** 関連情報検索結果のうち、上位何件をプロンプトに利用するか */
const TOP_K = 3;

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
Related info:
{context}
----
Chat History:
{chatHistory}
----
Question: {question}`,
  );

  const context = await getRelatedDocs(req.input);
  const prompt = await chatPrompt.format({
    question: req.input,
    chatHistory: await ChatPromptTemplate.fromMessages(
      await history.getMessages(),
    ).format({}),
    context,
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

  async function getRelatedDocs(text: string) {
    const vectorStore = new PineconeStore(new OpenAIEmbeddings({}), {
      pineconeIndex: new Pinecone().index(INDEX_NAME),
    });
    try {
      return formatDocumentsAsString(
        await vectorStore.similaritySearch(text, TOP_K),
      );
    } catch {
      return "関連情報の取得に失敗しました。";
    }
  }
}
