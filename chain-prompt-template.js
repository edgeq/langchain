import { openai } from "./models/openai.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// To control the nature of the conversation, 
// set up a template with system instructions
// {wordsInBrackets} are a placeholder for dynamic variables
const translateTemplate = 'Translate the following into {language}'
const jokeTemplate = 'Tell me a joke about {topic}'
const chefTemplate = 'You are a talented chef, Create a recipe based on the main ingredient provided by a user: {ingredient}'

const templates = {
    translateTemplate,
    jokeTemplate,
    chefTemplate,
}
// Prompt templates enforce the nature of conversation
const promptTemplate = ChatPromptTemplate.fromMessages([
    ['system', templates.translateTemplate],
    ['user', '{text}'],
])

// const result = await openai.invoke(promptTemplate)
/**
 * You can also chain things together without having to invoke the promptTemplate first
 */

const chain = promptTemplate.pipe(openai)
const response = await chain.invoke({
    language: 'french',
    text: 'swim'
})

console.log(response.content)
