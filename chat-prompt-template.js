import { openai } from "./models/openai.js";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// To control the nature of the conversation, 
// set up a template with system instructions
// {term} is a placeholder for dynamic variables
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
    ['system', templates.chefTemplate],
    ['user', '{ingredient}'],
])
/**
 * This is a bit more explicit than using the chain() method
 */
const prompt = await promptTemplate.invoke({
    // language: 'spanish',
    // text: 'Hello, how are you?',
    // topic: 'the electoral college',
    ingredient: 'bacon',
})

console.log(prompt.toChatMessages())

const result = await openai.invoke(prompt)

console.log(result.content)
