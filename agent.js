/**
 * Follow along with LangChain Docs: 
 * https://js.langchain.com/v0.2/docs/tutorials/agents/
 */
import 'dotenv/config';
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

const searchTool = new TavilySearchResults();
const toolResult = await searchTool.invoke('What are the latest stereo delay pedals?');

console.log(toolResult);