import 'dotenv/config'
import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from '@langchain/core/output_parsers'
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";


const llm = new ChatOpenAI({
    model: 'gpt-4o-mini'
})
// Templates create space for variables to be used when we invoke()
const punctuationTemplate = `
    Given a sentance, add punctuation where needed.
    sentence: {sentence}
    sentence with punctuation: 
`
// PromptTemplate formats before making an API call
const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate);

const grammarTemplate = `
    Given a sentence, correct the grammar.
    sentence: {punctuated_sentence}
    sentence with correct grammar:
`
const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate)

const translationTemplate = `Given a sentence, translate that sentence into {language}
    sentence: {grammatically_correct_sentence}
    translated sentence:
    `
const translationPrompt = PromptTemplate.fromTemplate(translationTemplate)

/**
 * OPTION A - make one big runnable sequence. 
 *

const chain = RunnableSequence.from([
    punctuationPrompt,
    llm,
    new StringOutputParser(),
    // you can reference the previous output as an arrouw funtion
    {punctuated_sentence: prevResult => prevResult},
    grammarPrompt,
    llm,
    new StringOutputParser(),
])
 */

/**
 * OPTION B - break up runnable sequences and chain them as a RunnableSequence using RunnablePassthrough
 */
const punctuationChain = RunnableSequence.from([punctuationPrompt, llm, new StringOutputParser()])
const grammarChain = RunnableSequence.from([grammarPrompt, llm, new StringOutputParser()])
const translationChain = RunnableSequence.from([translationPrompt, llm, new StringOutputParser()])

const chain = RunnableSequence.from([
    {
        punctuated_sentence: punctuationChain,
        original_input: new RunnablePassthrough()
    },
    {
        grammatically_correct_sentence: grammarChain,
        language: ({ original_input }) => original_input?.language
    },
    translationChain,
])

const response = await chain.invoke({
    sentence: 'i dont liked sundayss',
    language: 'french'
})
console.log(response);
