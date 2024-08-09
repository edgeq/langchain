import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const webLoader = new CheerioWebBaseLoader(
    'https://www.strymon.net/product/bigsky-mx/',
    {
        selector: 'h1, h2, h3, p, em, strong, i',
    }
)

const docs = await webLoader.load()

console.log(docs)
console.log(docs[0])