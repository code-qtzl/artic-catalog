import { MCPClient } from '@modelcontextprotocol/sdk';

class ChatService {
	private static instance: ChatService;
	private mcpClient: MCPClient;

	private constructor() {
		this.mcpClient = new MCPClient({
			serverName: 'artic-museum',
			onError: (error) => {
				console.error('MCP Error:', error);
			},
		});
	}

	public static getInstance(): ChatService {
		if (!ChatService.instance) {
			ChatService.instance = new ChatService();
		}
		return ChatService.instance;
	}

	public async sendMessage(message: string): Promise<string> {
		try {
			const response = await this.mcpClient.send({
				type: 'chat',
				content: message,
			});

			return response.content;
		} catch (error) {
			console.error('Error sending message:', error);
			throw error;
		}
	}
}

export const chatService = ChatService.getInstance();
