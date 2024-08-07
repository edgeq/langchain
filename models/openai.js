import 'dotenv/config'
import { ChatOpenAI } from '@langchain/openai'

export const openai = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0.5,
})