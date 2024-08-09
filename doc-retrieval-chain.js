import { openai } from "./models/openai.js";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";


// {context} is what we will use to front-load our prompt
// {input} is what we will use to invoke the retriever - nneds to be {input}
// Any other variables can be passed in, but will need to be declared at invocation
const questionPrompt = ChatPromptTemplate.fromTemplate(
    `Answer the user's question from the following context.
    <context>
    {context}
    </context>
    
    If the context doesn't contain any relevant information to the question,
    don't make something up and just say "I don't know":
    
    Question: {input}
    `)
// DOCUMENT CHAINS
// are chains that can use docs as context to answer questions.
// createStuffDocumentsChain is a helper function that
// enables us to “stuff” all of the input documents
// as {context} into the prompt when we invoke.
const docsChain = await createStuffDocumentsChain({
    llm: openai,
    prompt: questionPrompt,
})

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

const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings
)

// Can return any number of docs. Default is 3-4
// const retriever = vectorStore.asRetriever(8)
const retriever = vectorStore.asRetriever()

const retrievalChain = await createRetrievalChain({
    combineDocsChain: docsChain,
    retriever,
})
const response = await retrievalChain.invoke({
    input: 'explain echo chambers',
})

console.log(response)
console.log(response.answer)
