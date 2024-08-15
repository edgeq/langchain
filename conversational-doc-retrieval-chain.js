import { openai } from "./models/openai.js";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { createRetrievalChain } from "langchain/chains/retrieval";
/**
 * The types of messages currently supported in LangChain are
 * AIMessage, HumanMessage, SystemMessage, FunctionMessage, and ChatMessage
 * -- ChatMessage takes in an arbitrary role parameter. 
 * Most of the time, you'll just be dealing with HumanMessage, AIMessage, and SystemMessage
 * source: https://js.langchain.com/v0.1/docs/modules/model_io/chat/quick_start/
 */
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";

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
    const contextPrompt = `
        Answer the user's question from the following context.
        <context>
        {context}
        </context>

        If the context doesn't contain any relevant information to the question,
        don't make something up and just say "I don't know"
    `
    const questionPrompt = ChatPromptTemplate.fromMessages([
        ['system', contextPrompt],
        new MessagesPlaceholder('chat_history'),
        ['user', '{input}'],
    ])
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

    const retrieverPrompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder('chat_history'),
        ['user', '{input}'],
        ['user', 'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation']
    ])
    const historyAwareRetriever = await createHistoryAwareRetriever({
        llm: openai,
        retriever,
        rephrasePrompt: retrieverPrompt,
    })
    
    const conversationChain = await createRetrievalChain({
        combineDocsChain: docsChain, // them model config and the prompt to stuff into
        retriever: historyAwareRetriever, // the context we want to "stuff" into using the relevant docs and embeddings
    })

    return conversationChain;
}

const vectorStore = await createVectorStore()
const chain = await createChain(vectorStore)
// Mock Chat history
const chatHistory = [
    new HumanMessage('Hello'),
    new AIMessage('Hey, how can I help you?'),
    new HumanMessage('My name is Edge'),
    new AIMessage('Hi Edge!, what can I help you with?'),
    new HumanMessage('How can I get a slapback kind of sound?'),
    new AIMessage('Slapback is a delay effect, I am only able to answer questions about reverb.'),
]
const response = await chain.invoke({
    // the input our prompt expects
    input: 'What is cathedral reverb?',
    chat_history: chatHistory,
})

// console.log(response)
console.log(response.answer)
