import "dotenv/config";
import { OpenAIEmbeddings } from "@langchain/openai"
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { createClient } from "@supabase/supabase-js"


const embeddings = new OpenAIEmbeddings()
const SB_API_KEY = process.env.SUPABASE_API_KEY
const SB_URL = process.env.SUPABASE_URL_LC_CHATBOT
const client = createClient(SB_URL, SB_API_KEY)

const vectorstore = new SupabaseVectorStore(embeddings, {
    client,
    tableName: 'documents',
    queryName: 'match_documents',
})

const retriever = vectorstore.asRetriever()

export { retriever }