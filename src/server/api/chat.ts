import { Anthropic } from '@anthropic-ai/sdk';

// Use environment variable for API key
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
	throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

const anthropic = new Anthropic({
	apiKey: apiKey,
});

export async function POST(request: Request) {
	try {
		const { message } = await request.json();

		const response = await anthropic.messages.create({
			model: 'claude-3-opus-20240229',
			max_tokens: 1024,
			messages: [{ role: 'user', content: message }],
			system: "You are an AI assistant helping users learn about artworks in the Art Institute of Chicago's collection. Provide engaging and informative responses about art history, artists, and specific works in the collection.",
		});

		return new Response(
			JSON.stringify({
				content:
					response.content[0].type === 'text'
						? response.content[0].text
						: null,
			}),
			{
				headers: { 'Content-Type': 'application/json' },
			},
		);
	} catch (error) {
		console.error('Error processing chat:', error);
		return new Response(
			JSON.stringify({ error: 'Failed to process chat request' }),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	}
}
