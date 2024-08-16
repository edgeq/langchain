import 'dotenv/config';
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";


const webLoader = new CheerioWebBaseLoader(
    'https://www.andertons.co.uk/guitar-reverb-pedal-guide',
    {
        selector: 'section > #66584177eddf2299dd189cf2.shogun-root > h1, h2, h3, p, .bulleted-list'
    }
)

const rawDocs = await webLoader.load()
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 600,
    chunkOverlap: 30,
})
const docs = await splitter.splitDocuments(rawDocs)

const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings())

const retriever = vectorStore.asRetriever()

const retrieverResult = await retriever.invoke('what is reverb?')

// console.log(retrieverResult)
export { retriever }