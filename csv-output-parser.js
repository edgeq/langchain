import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
const randomNumber = Math.floor(Math.random() * 2582)

const csvPath = './data/Chicago_Street_Names_20240808.csv'

const addressLoader = new CSVLoader(csvPath, {
    column: 'Street ',
});

const docs = await addressLoader.load()
console.log(docs[randomNumber]);