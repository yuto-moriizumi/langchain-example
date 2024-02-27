"use server";

import axios from "axios";
import { JSDOM } from "jsdom";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "@langchain/pinecone";
import { INDEX_NAME } from "../constants";
import { Document } from "langchain/document";
import { TokenTextSplitter } from "langchain/text_splitter";

const SOURCE = ["https://en.wikipedia.org/wiki/Nikkei_225"];

export async function update() {
  "use server";
  const urls = SOURCE;
  console.log(`pages: ${urls.length}`);

  const pages: string[] = [];
  for (let i = 0; i < urls.length; i++) {
    console.log(`page: ${i + 1}/${urls.length}`);
    const url = urls[i];
    const outerHTML = await getPageContent(url);
    pages.push(outerHTML);
  }

  const splitter = new TokenTextSplitter({
    chunkSize: 8192, // OpenAIEmbeddingsの最大入力長
    chunkOverlap: 0,
  });
  const docs = (await splitter.splitDocuments(await getDocument(pages))).map(
    (doc) => {
      if (!("Header 1" in doc.metadata)) return doc;
      // メタ情報に含まれる目次情報をテキストの先頭に挿入する
      const headers = [];
      headers.push(doc.metadata["Header 1"]);
      if ("Header 2" in doc.metadata) {
        headers.push(doc.metadata["Header 2"]);
        if ("Header 3" in doc.metadata) headers.push(doc.metadata["Header 3"]);
      }
      doc.pageContent = headers.join(" > ") + "\n" + doc.pageContent;
      return doc;
    },
  );

  /** pineconeは基本的に遅延がある。情報取得系の返却は基本数分前の情報が戻ってくることに注意。 */
  const pinecone = new Pinecone();
  try {
    await pinecone.deleteIndex(INDEX_NAME);
  } catch {
    /* empty */
  }
  await pinecone.createIndex({
    name: INDEX_NAME,
    dimension: 1536,
    metric: "cosine",
    spec: {
      serverless: {
        cloud: "aws",
        region: process.env.PINECONE_ENVIRONMENT ?? "us-west-2",
      },
    },
  });
  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings({}), {
    pineconeIndex: pinecone.index(INDEX_NAME),
  });

  return docs;
}

async function getPageContent(url: string) {
  try {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const content = dom.window.document.querySelector("main");
    if (content === null) return "";
    return content.outerHTML;
  } catch (error) {
    console.log(error);
    return "";
  }
}

async function getDocument(
  html: string[],
): Promise<Document<Record<string, unknown>>[]> {
  type Responce = {
    docs: { page_content: string; metadata: Record<string, unknown> }[];
  };
  const responce = await axios.post<Responce>(
    "https://nq5mej073e.execute-api.ap-northeast-1.amazonaws.com/split",
    { items: html },
  );
  return responce.data.docs.map(
    (doc) => new Document({ ...doc, pageContent: doc.page_content }),
  );
}
