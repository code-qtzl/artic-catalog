import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { POST as chatHandler } from './api/chat';
import type { Request as ExpressRequest, Response } from 'express';

// Load environment variables before anything else
config();

// Make sure required environment variables are set
if (!process.env.ANTHROPIC_API_KEY) {
	console.error('Missing ANTHROPIC_API_KEY environment variable');
	process.exit(1);
}

export const app = express();
export const port = process.env.PORT || 3001; // Changed to 3001

app.use(cors());
app.use(express.json());

// Chat endpoint
app.post('/api/chat', async (req: ExpressRequest, res: Response) => {
	try {
		const fetchRequest = new Request('http://localhost/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(req.body),
		});

		const response = await chatHandler(fetchRequest);
		const data = await response.json();
		res.json(data);
	} catch (error) {
		console.error('Error in chat endpoint:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
