declare module '@modelcontextprotocol/sdk' {
	export class McpServer {
		constructor(options: {
			name: string;
			version: string;
			apiKey?: string;
		});
		addTool(tool: Tool): Promise<void>;
		start(): Promise<void>;
	}

	export interface Tool {
		name: string;
		description: string;
		input_schema: {
			type: string;
			required: string[];
			properties: Record<
				string,
				{
					type: string;
					description: string;
					default?: any;
				}
			>;
		};
		handler: (params: any) => Promise<any>;
	}
}
