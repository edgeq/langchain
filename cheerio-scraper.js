import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const webLoader = new CheerioWebBaseLoader(
    'https://en.wikipedia.org/wiki/Reverb_effect',
    {
        selector: '#bodyContent > h1, h2, p',
    }
)

const docs = await webLoader.load()

console.log(docs)