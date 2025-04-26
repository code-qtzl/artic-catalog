import { McpServer, type Tool } from '@modelcontextprotocol/sdk';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define interface for tool input parameters
interface SearchByTitleParams {
	title: string;
	page?: number;
	limit?: number;
}

interface GetArtworkByIdParams {
	id: number;
}

interface FullTextSearchParams {
	query: string;
	page?: number;
	limit?: number;
}

const API_URL = process.env.VITE_API_BASE_URL || 'https://api.artic.edu/api/v1';
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
	throw new Error('ANTHROPIC_API_KEY environment variable is not set');
}

// Create MCP server instance
const server = new McpServer({
	name: 'artic-museum',
	version: '1.0.0',
	apiKey: API_KEY,
});

// Helper function to make API calls
async function callArticAPI(
	endpoint: string,
	params: Record<string, string | number>,
) {
	const queryString = Object.entries(params)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join('&');

	const url = `${API_URL}${endpoint}?${queryString}`;
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`API call failed: ${response.statusText}`);
	}

	return response.json();
}

// Define the available tools
const tools: Tool[] = [
	{
		name: 'search-by-title',
		description:
			'Search for artworks by title in the Art Institute of Chicago',
		input_schema: {
			type: 'object',
			required: ['title'],
			properties: {
				title: {
					type: 'string',
					description: 'The title of the artwork to search for',
				},
				page: {
					type: 'number',
					description: 'The page of results to return',
					default: 1,
				},
				limit: {
					type: 'number',
					description: 'The number of results per page',
					default: 10,
				},
			},
		},
		handler: async ({
			title,
			page = 1,
			limit = 10,
		}: SearchByTitleParams) => {
			return await callArticAPI('/artworks/search', {
				q: title,
				page,
				limit,
				fields: 'id,title,artist_display,date_display,main_reference_number,image_id',
			});
		},
	},
	{
		name: 'get-artwork-by-id',
		description: 'Get detailed information about a specific artwork',
		input_schema: {
			type: 'object',
			required: ['id'],
			properties: {
				id: {
					type: 'number',
					description: 'The ID of the artwork to retrieve',
				},
			},
		},
		handler: async ({ id }: GetArtworkByIdParams) => {
			return await callArticAPI(`/artworks/${id}`, {
				fields: 'id,title,artist_display,date_display,main_reference_number,image_id,description,provenance_text',
			});
		},
	},
	{
		name: 'full-text-search',
		description: 'Search for artworks using full-text search',
		input_schema: {
			type: 'object',
			required: ['query'],
			properties: {
				query: {
					type: 'string',
					description: 'The search query',
				},
				page: {
					type: 'number',
					description: 'The page of results to return',
					default: 1,
				},
				limit: {
					type: 'number',
					description: 'The number of results per page',
					default: 10,
				},
			},
		},
		handler: async ({
			query,
			page = 1,
			limit = 10,
		}: FullTextSearchParams) => {
			return await callArticAPI('/artworks/search', {
				q: query,
				page,
				limit,
				fields: 'id,title,artist_display,date_display,main_reference_number,image_id,description',
			});
		},
	},
];

// Initialize server with tools
async function initializeServer() {
	try {
		// Add tools to the server
		for (const tool of tools) {
			await server.addTool(tool);
		}

		// Start the server
		await server.start();

		console.log('MCP Server initialized successfully');
		console.log(
			'Available tools:',
			tools.map((t) => t.name),
		);
	} catch (error) {
		console.error('Error initializing MCP server:', error);
		throw error;
	}
}

// Initialize the server
initializeServer().catch(console.error);

export default server;
