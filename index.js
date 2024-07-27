import { readFile } from 'node:fs/promises'
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

try {
    const text = await readFile('./info.txt', 'utf-8')
    // assumes a 1000 char split. 
    // larger chunks = more context
    // smaller chunks = more semantic info
    // either extreme can cost you tokens or performance.
    // set up a chunk size that makes sense
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        // default setting - paragraphs, sentences, spaces
        separators: ['\n\n', '\n', ' ', '', '##'],
        // won't always see overlap, but it's good for linking chunks to each other for context
        chunkOverlap: 50,
    })
    const output = await splitter.createDocuments([text])
    console.log(output[0].metadata)
    console.log(output[0])
    console.log(output[1].metadata)
    console.log(output[1])
} catch (err) {
    console.log(err)
}