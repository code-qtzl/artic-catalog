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

			if (!response.ok) {
				throw new Error('Failed to send message');
			}

			const data = await response.json();
			if (data.error) {
				throw new Error(data.error);
			}

			return (
				data.content ||
				'I apologize, but I received an unexpected response format.'
			);
		} catch (error) {
			console.error('Error sending message:', error);
			throw error;
		}
	}
}

export const chatService = ChatService.getInstance();
