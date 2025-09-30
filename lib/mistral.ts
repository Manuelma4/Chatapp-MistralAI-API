export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };


export type ChatRequest = {
model: string;
messages: ChatMessage[];
temperature?: number;
};


export type ChatChoice = { index: number; message: ChatMessage };


export type ChatResponse = {
id: string;
object: string;
created: number;
model: string;
choices: ChatChoice[];
};


export async function callMistral(req: ChatRequest, apiKey: string): Promise<ChatResponse> {
const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${apiKey}`,
},
body: JSON.stringify({
model: req.model,
messages: req.messages,
temperature: req.temperature ?? 0.3,
stream: false
})
});


if (!res.ok) {
const text = await res.text();
throw new Error(`Mistral API error ${res.status}: ${text}`);
}
return res.json();
}