const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
	throw new Error(
		'Anthropic API key is not set in the environment variables.',
	);
}

class ChatService {
	private static instance: ChatService;

	private constructor() {}

	public static getInstance(): ChatService {
		if (!ChatService.instance) {
			ChatService.instance = new ChatService();
		}
		return ChatService.instance;
	}

	public async sendMessage(message: string): Promise<string> {
		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ message }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to send message');
			}

			if (data.error) {
				throw new Error(data.error);
			}

			if (!data.content) {
				throw new Error('Received empty response from server');
			}

			return data.content;
		} catch (error) {
			console.error('Error sending message:', error);
			throw error;
		}
	}
}

export const chatService = ChatService.getInstance();
