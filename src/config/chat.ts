interface MCPResponse {
    content: string;
}

class MCPClient {
    private serverName: string;
    private onError: (error: Error) => void;

    constructor({ serverName, onError }: { serverName: string; onError: (error: Error) => void }) {
        this.serverName = serverName;
        this.onError = onError;
    }

    async send({ type, content }: { type: string; content: string }): Promise<MCPResponse> {
        try {
            const response = await fetch('http://localhost:3000/mcp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    server: this.serverName,
                    type,
                    content,
                }),
            });

            if (!response.ok) {
                throw new Error(`MCP request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.onError(err);
            throw err;
        }
    }
}

class ChatService {
    private static instance: ChatService;
    private mcpClient: MCPClient;

    private constructor() {
        this.mcpClient = new MCPClient({
            serverName: 'artic-museum',
            onError: (error) => {
                console.error('MCP Error:', error);
            }
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
