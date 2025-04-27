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

	private async getArtworkContext(artworkId: number): Promise<string> {
		try {
			const response = await fetch(
				`https://api.artic.edu/api/v1/artworks/${artworkId}?fields=id,title,artist_title,date_display,medium_display,dimensions,description`,
			);
			const data = await response.json();
			const artwork = data.data;

			return `You are currently viewing: "${artwork.title}" by ${
				artwork.artist_title || 'Unknown Artist'
			}
Date: ${artwork.date_display || 'Unknown'}
Medium: ${artwork.medium_display || 'Unknown'}
Description: ${artwork.description || 'No description available'}\n\n`;
		} catch (error) {
			console.error('Error fetching artwork context:', error);
			return '';
		}
	}

	public async sendMessage(
		message: string,
		artworkId?: number,
	): Promise<string> {
		try {
			let contextualizedMessage = message;

			if (artworkId) {
				const artworkContext = await this.getArtworkContext(artworkId);
				contextualizedMessage = `${artworkContext}User question: ${message}`;
			}

			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ message: contextualizedMessage }),
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
