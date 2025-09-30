import { NextRequest } from 'next/server';
import { callMistral, ChatMessage } from '@/lib/mistral';


export const runtime = 'edge';


export async function POST(req: NextRequest) {
try {
const body = await req.json();
const { messages, model, temperature, mock } = body as {
messages: ChatMessage[];
model?: string;
temperature?: number;
mock?: boolean;
};


if (!messages?.length) {
return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 });
}


if (mock) {
return new Response(
JSON.stringify({
id: 'mock',
object: 'chat.completion',
created: Date.now() / 1000,
model: model || process.env.MISTRAL_MODEL || 'mistral-large-latest',
choices: [
{
index: 0,
message: { role: 'assistant', content: '🤖 Mock reply: Hello! Your setup works locally.' },
},
],
}),
{ status: 200, headers: { 'Content-Type': 'application/json' } }
);
}


const apiKey = process.env.MISTRAL_API_KEY;
if (!apiKey) {
return new Response(JSON.stringify({ error: 'Missing MISTRAL_API_KEY on server' }), { status: 500 });
}


const response = await callMistral(
{
model: model || process.env.MISTRAL_MODEL || 'mistral-large-latest',
messages,
temperature,
},
apiKey
);


return new Response(JSON.stringify(response), { status: 200, headers: { 'Content-Type': 'application/json' } });
} catch (e: any) {
return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
}
}