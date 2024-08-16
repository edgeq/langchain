/**
 * Riffing along with LangChain Docs: 
 * https://js.langchain.com/v0.2/docs/tutorials/agents/
 */
import 'dotenv/config';
import { openai } from './models/openai.js';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import { retriever } from './cheerio-scraper.js';
import { createRetrieverTool } from 'langchain/tools/retriever';
import { ChatPromptTemplate } from "@langchain/core/prompts";
// import * as hub from "langchain/hub"; // this lets us grab a pre-written prompt
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import readline from 'node:readline'


// We will use the searchTool to do some internet searches
const searchTool = new TavilySearchResults();
// We will use the retriever tool to search our local knowledge base.
// In this case, it's a scraped webpage, but it could be a PDF, or word doc, etc...
const retrieverTool = createRetrieverTool(retriever, {
    name: 'cheerio_search',
    description: 'Search for information about reverb effects. For any questions about reverb effects, you must use this tool!'
})

const tools = [searchTool, retrieverTool]

// This is a pre-formatted prompt.
// const prompt = await hub.pull("hwchase17/openai-functions-agent");
// I've written it as a ChatPromptTemplate for clarity. 
const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are a helpful assistant"],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
])
// createOpenAiFunctionsAgent sets us up to use both our model
// and the tools we want to use
const agent = await createOpenAIFunctionsAgent({
    llm: openai,
    prompt,
    tools,
})
// Agent Executor is what we will invoke
const agentExecutor = new AgentExecutor({
    agent,
    tools,
})
// Sets up a terminal interface
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const chatHistory = []

function askQuestion() {
    rl.question('User: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
            rl.close()
            return
        }
        const response = await agentExecutor.invoke({
            input,
            chat_history: chatHistory,
        })
        console.log("Agent: ", response.output)
        chatHistory.push(new HumanMessage(input))
        chatHistory.push(new AIMessage(response.output))
        askQuestion()
    })
}

askQuestion()