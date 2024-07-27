import "dotenv/config";
import { readFile } from "node:fs/promises";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
// @langchain/community is where you want to go for all the ecosystem integrations
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

try {
    const text = await readFile("./info.txt", "utf-8");
    // assumes a 1000 char split.
    // larger chunks = more context
    // smaller chunks = more semantic info
    // either extreme can cost you tokens or performance.
    // set up a chunk size that makes sense
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        // default setting - paragraphs, sentences, spaces
        separators: ["\n\n", "\n", " ", "", "##"],
        // won't always see overlap, but it's good for linking chunks to each other for context
        chunkOverlap: 50,
    });
    const output = await splitter.createDocuments([text]);

    const SB_API_KEY = process.env.SUPABASE_API_KEY;
    const SB_URL = process.env.SUPABASE_URL_LC_CHATBOT;
    const OPEN_AI_KEY = process.env.OPENAI_PROJECT_KEY;

    const client = createClient(SB_URL, SB_API_KEY);

    await SupabaseVectorStore.fromDocuments(
        output,
        // should read from dotenv
        new OpenAIEmbeddings({ openAIApiKey: OPEN_AI_KEY }),
        {
            client,
            tableName: "documents",
        }
    );
} catch (err) {
    console.log(err);
}
