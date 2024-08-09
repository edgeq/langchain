import { OpenAIEmbeddings } from "@langchain/openai";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

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
const vectorStore = new MemoryVectorStore(embeddings)
await vectorStore.addDocuments(splitDocs)

// Direct query
const similaritySearch = await vectorStore.similaritySearchWithScore(
    'What is shimmer reverb?',
    2,
)

for (const [doc, score] of similaritySearch) {
    console.log(`* [SIM=${score.toFixed(3)}] ${doc.pageContent}`)
}