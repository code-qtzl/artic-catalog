import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { chatService } from '@/config/chat';

interface Message {
	role: 'user' | 'assistant';
	content: string;
}

interface ChatProps {
	onClose: () => void;
}

export function Chat({ onClose }: ChatProps) {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSend = async () => {
		if (!input.trim() || isLoading) return;

		const userMessage: Message = {
			role: 'user',
			content: input.trim(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setIsLoading(true);

		try {
			const response = await chatService.sendMessage(userMessage.content);

			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content: response,
				},
			]);
		} catch (error) {
			console.error('Chat error:', error);
			setMessages((prev) => [
				...prev,
				{
					role: 'assistant',
					content:
						'I apologize, but I encountered an error. Please try again.',
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<Card className='fixed bottom-4 right-4 w-[400px] h-[600px] shadow-xl flex flex-col'>
			<div className='flex justify-between items-center p-4 border-b'>
				<h3 className='font-semibold'>Art Institute Assistant</h3>
				<Button variant='ghost' size='sm' onClick={onClose}>
					✕
				</Button>
			</div>

			<ScrollArea className='flex-1 p-4'>
				<div className='space-y-4'>
					{messages.length === 0 && (
						<div className='text-center text-muted-foreground'>
							Ask me anything about the Art Institute of Chicago's
							collection!
						</div>
					)}
					{messages.map((message, i) => (
						<div
							key={i}
							className={`flex ${
								message.role === 'user'
									? 'justify-end'
									: 'justify-start'
							}`}
						>
							<div
								className={`max-w-[80%] rounded-lg p-3 ${
									message.role === 'user'
										? 'bg-primary text-primary-foreground'
										: 'bg-muted'
								}`}
							>
								{message.content}
							</div>
						</div>
					))}
					{isLoading && (
						<div className='flex justify-start'>
							<div className='max-w-[80%] rounded-lg p-3 bg-muted'>
								<div className='flex space-x-2'>
									<div className='w-2 h-2 rounded-full bg-foreground/30 animate-bounce' />
									<div className='w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.2s]' />
									<div className='w-2 h-2 rounded-full bg-foreground/30 animate-bounce [animation-delay:0.4s]' />
								</div>
							</div>
						</div>
					)}
				</div>
			</ScrollArea>

			<div className='p-4 border-t'>
				<div className='flex gap-2'>
					<Input
						placeholder='Ask about artworks...'
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyPress={handleKeyPress}
						disabled={isLoading}
					/>
					<Button
						onClick={handleSend}
						disabled={isLoading || !input.trim()}
						size='icon'
					>
						<Send className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</Card>
	);
}
