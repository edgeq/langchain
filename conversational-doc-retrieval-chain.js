import { openai } from "./models/openai.js";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";

// SCRAPE FOR DOCUMENTS
const createVectorStore = async () => {
    const webLoader = new CheerioWebBaseLoader(
        // needed a little more data so let's use this blog post
        'https://www.andertons.co.uk/guitar-reverb-pedal-guide',
        {
            selector: 'section > #66584177eddf2299dd189cf2.shogun-root > h1, h2, h3, p, .bulleted-list'
        }
    )
    const docs = await webLoader.load()
    // SPLIT DOCS FOR EMBEDDINGS
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 30,
    })
    const splitDocs = await splitter.splitDocuments(docs)
    // console.log(splitDocs);
    // EMBEDDINGS ASSIGN MEANING VIA MATRIX VECTORS
    const embeddings = new OpenAIEmbeddings({
        model: 'text-embedding-3-small'
    })
    const vectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings
    )
    return vectorStore;
}
const createChain = async (vectorStore) => {
    // {context} is what we will use to front-load our prompt
    // {input} is what we will use to invoke the retriever - needs to be {input}
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
    // enables us to “stuff” all of the scraped documents
    // as {context} into the prompt when we invoke.
    const docsChain = await createStuffDocumentsChain({
        llm: openai,
        prompt: questionPrompt,
    })
    // Can return any number of docs. Default is 3-4
    // const retriever = vectorStore.asRetriever(8)
    const retriever = vectorStore.asRetriever()
    
    const conversationChain = await createRetrievalChain({
        combineDocsChain: docsChain, // them model config and the prompt to stuff into
        retriever, // the context we want to "stuff" into using the relevant docs and embeddings
    })

    return conversationChain;
}

const vectorStore = await createVectorStore();
const chain = await createChain(vectorStore)
const response = await chain.invoke({
    // Remember how we had to do that weird retriever.invoke() thing?
    // We bypass that step altogether by using a retrieval chain 
    // ths input our prompt expects
    input: 'How do I make a sound that sounds like a cathedral?',
})

// console.log(response)
console.log(response.answer)
