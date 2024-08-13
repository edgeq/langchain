import { openai } from "./models/openai.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { HumanMessage } from "@langchain/core/messages"


// {context} is what we will use to front-load our prompt
const SYSTEM_TEMPLATE =
    `Answer the user's question from the following context.
    If the context doesn't contain any relevant information to the question,
    don't make something up and just say "I don't know":
    <context>
    {context}
    </context>
    `

const webLoader = new CheerioWebBaseLoader(
    'https://en.wikipedia.org/wiki/Reverb_effect',
    {
        selector: '#bodyContent > h1, h2, p',
    }
)

const docs = await webLoader.load()

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 30,
})

const splitDocs = await splitter.splitDocuments(docs)

const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small'
})
//  A vector store takes care of storing embedded data and performing vector search for you.
// https://js.langchain.com/v0.2/docs/concepts/#vectorstores
// In-memory vector store is NEAT... but you want a persistent store for production
// https://js.langchain.com/v0.2/docs/integrations/vectorstores/memory/
// Here's another way to work with in-memory vectro stores
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)
// Only return 4 docs that match the string we give it
const retriever = vectorStore.asRetriever(4)
// I guess this front-loads the docs with a 'topic'?
const retrieverDocs = await retriever.invoke('reverb')

// DOCUMENT CHAINS
// are chains that can use docs as context to answer questions.
const questionPrompt = ChatPromptTemplate.fromMessages([
    ["system", SYSTEM_TEMPLATE],
    // a placeholder for chat history messages named messages. 
    new MessagesPlaceholder("messages")
])

// createStuffDocumentsChain is a helper function that
// enables us to “stuff” all of the input documents
// as {context} into the prompt when we invoke.
const docsChain = await createStuffDocumentsChain({
    llm: openai,
    prompt: questionPrompt,
})

const docsChainRespones = await docsChain.invoke({
    messages: [new HumanMessage('What is convolution reverb?')],
    context: retrieverDocs,
})

console.log(docsChainRespones)