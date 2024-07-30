import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts"

// const OPEN_AI_KEY = process.env.OPENAI_PROJECT_KEY

const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
})
/**
 * Challenge:
 * 1. Create a prompt to turn a user's question into a 
 *    standalone question. (Hint: the AI understands 
 *    the concept of a standalone question. You don't 
 *    need to explain it, just ask for it.)
*/
const questionTemplate = 'Given a question, convert it to a standalone question. Question: {question} standalone question:'
const questionPrompt = PromptTemplate.fromTemplate(questionTemplate);
/*
 * 2. Create a chain with the prompt and the model.
*/
const questionChain = questionPrompt.pipe(llm)
/**
 * 3. Invoke the chain remembering to pass in a question.
 * */
const response = await questionChain.invoke({
    question: 'What are the technical requirements for running Mac OS 14? I only have a very old laptop which is not that powerful.'
})
/*
 * 4. Log out the response.
 * **/
console.log(response)