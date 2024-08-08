import { openai } from './models/openai.js';
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
    StringOutputParser,
    CommaSeparatedListOutputParser,
    StructuredOutputParser,
} from '@langchain/core/output_parsers'
import { z } from "zod";
/**
 * console.log(response.content) works for inspecting a response...
 * but what if the output of response.content or even the whole response
 * might need to be formatted as another input for another langchain call?
 * 
 * Let's use parsers to format the response 
 * https://js.langchain.com/v0.2/docs/concepts/#output-parsers
 * https://v02.api.js.langchain.com/modules/langchain_core_output_parsers.html
 */

// Parses the chain response as a String
async function callStringOutputParser() {
    const jokeTemplate = 'Tell me a joke about {topic}'
    const promptTemplate = ChatPromptTemplate.fromMessages([
        ['system', jokeTemplate],
        ['user', '{topic}'],
    ])
    const parser = new StringOutputParser()
    const chain = promptTemplate.pipe(openai).pipe(parser)

    return await chain.invoke({
        topic: 'python',
    })
}
// Parses the chain response as an Array
async function callListOutputParser(word) {
    const prompt = ChatPromptTemplate.fromTemplate(`
        Provide 5 synonyms, seperated by commas, for the following word {word}
    `);
    const listParser = new CommaSeparatedListOutputParser()
    const chain = prompt.pipe(openai).pipe(listParser)

    return await chain.invoke({ word })
};

// Parses the chain response as structured output like a JSON schema
// Super handy for API requests
async function callStructuredParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`
        Extract information from the following phrase.
        Phrase: {phrase}
        Use these formating instruction: {format_instructions}
    `)
    // Model should extract {name: '', age: ''}
    const structuredParser = StructuredOutputParser.fromNamesAndDescriptions({
        name: 'the name of the person',
        age: 'the age of the person as a Number'
    })
    const chain = prompt.pipe(openai).pipe(structuredParser)
    
    return await chain.invoke({
        phrase: 'Edgar is a 7 year-old engineer learning AI development',
        format_instructions: structuredParser.getFormatInstructions(),
    })
}
// Parse using the zod schema package
async function callZodParser() {
    const prompt = ChatPromptTemplate.fromTemplate(`
        Extract information from the following phrase.
        Phrase: {phrase}.
        Use these formating instruction: {format_instructions}
    `)
    const zodParser = StructuredOutputParser.fromZodSchema(
        z.object({
            recipe: z.string().describe('name of recipe'),
            ingredients: z.array(z.string()).describe('ingredients'),
        })
    )

    const chain = prompt.pipe(openai).pipe(zodParser)
    return await chain.invoke({
        phrase: 'The ingredients for pupusas are corn flour, refried beans, melty cheese, and salsa roja',
        format_instructions: zodParser.getFormatInstructions(),

    })
}

// console.log(await callStringOutputParser())
// console.log(await callListOutputParser('foundation'))
// console.log(await callStructuredParser())
console.log(await callZodParser())
