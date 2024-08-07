import { openai } from "./models/openai.js"
import readline from 'node:readline'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

async function chatCompletion(text) {
    const response = await openai.invoke(text);
    /**
     * Other options are:
     * 
     *  .batch(['message1', 'message2'])
     * which allows for sequential prompts to get passed in.
     * This in turn responds with 2 AI messages
     * 
     *  .stream('prompt')
     * which requires a for loop to get the content back in chunks
     *  for await (const chunk of response) {
     *      console.log(chunk?.content)
     *  } 
     * 
     *  .streamLog('prompt') 
     * same as stream but with additional log info
     */
    console.log(`AI: ${response.content}`)
}

function getPrompt() {
    rl.question("Enter a prompt: ", (input) => {
        if (input.toUpperCase() === 'EXIT') {
            rl.close();
            return;
        }
        chatCompletion(input)
            .then(() => getPrompt())
    })
}

getPrompt()
