import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai"
import { PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from '@langchain/core/output_parsers'
import { retriever } from './utils/retriever.js'
import { combineDocs } from "./utils/combineDocs.js";


// const OPEN_AI_KEY = process.env.OPENAI_PROJECT_KEY

const llm = new ChatOpenAI({
    model: 'gpt-4o-mini',
})

const questionTemplate = 'Given a question, convert it to a standalone question. Question: {question} standalone question:'
const questionPrompt = PromptTemplate.fromTemplate(questionTemplate);

const answerTemplate = `
    You are a helpful and enthusiastic support bot who can answer a given question about Scrimba based on the context provided.
    Try to find the answer in the context.
    If you really don't know the answer, say
    "I'm sorry, I don't know the answer to that."
    And direct the questioner to email help@scrimba.com.
    Don't try to make up an answer. Always speak as if you were chatting to a friend.
    context: {context}
    question: {question}
    answer:
`
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate)
/*
 * 2. Create a chain with the prompt and the model.
*/
const questionChain = questionPrompt
    .pipe(llm)
    .pipe(new StringOutputParser())
    .pipe(retriever)
    .pipe(combineDocs)
    .pipe(answerPrompt)
/**
 * 3. Invoke the chain remembering to pass in a question.
 * */
const response = await questionChain.invoke({
    question: 'What are the technical requirements for running Scrimba? I only have a very old laptop which is not that powerful.'
})
/*
 * 4. Log out the response.
 * **/
console.log(response)