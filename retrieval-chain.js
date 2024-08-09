import { openai } from "./models/openai.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";

const webLoader = new CheerioWebBaseLoader(
    'https://www.strymon.net/product/bigsky-mx/',
    {
        selector: 'h1, h2, h3, p, b, em, strong, i',
    }
)

const docs = await webLoader.load()

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 30,
})

const splitDocs = await splitter.splitDocuments(docs)
// console.log(splitDocs[0])
// console.log(splitDocs[20])
// console.log(splitDocs.length)

const embeddings = new OpenAIEmbeddings()
// In-memory vector store is NEAT... but you want a postgreSQL store for production
const vectorStore = new MemoryVectorStore(embeddings)
await vectorStore.addDocuments(splitDocs)

// console.log(vectorStore)

const retriever = vectorStore.asRetriever({
    k: 2,
})

// console.log(await retriever.invoke('IR-based'))

const prompt = ChatPromptTemplate.fromTemplate(
    // for retrieval chains the users input should be called {input}
    // {context} is what we will front-load our prompt with #promptEngineering
    `
    Answer the user's question to the best of your ability according to the {context} provided.
    Read through the {context} before providing an answer.
    If you don't have the answer, just say so. Don't make stuff up.
    Question: {input}`
);

const chain = prompt.pipe(openai)
const retrievalChain = await createRetrievalChain({
    combineDocsChain: chain,
    retriever,
})
const response = await retrievalChain.invoke({
        input: 'How many reverbs are there?',
        // don't need to pass constext since the retriever handles that
        // context: docs,
    });

console.log(response)