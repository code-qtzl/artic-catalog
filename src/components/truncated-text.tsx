import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ReactNode, ReactElement } from 'react';

interface TruncatedTextProps {
	content: string | ReactNode;
	maxLength?: number;
}

const truncateToWord = (str: string, maxLength: number): string => {
	if (!str || typeof str !== 'string') return '';
	if (str.length <= maxLength) return str;
	const truncated = str.slice(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');
	return lastSpace > 0
		? truncated.slice(0, lastSpace) + '...'
		: truncated + '...';
};

const getTextContent = (node: ReactNode): string => {
	try {
		if (!node) return '';
		if (typeof node === 'string') return node;
		if (typeof node === 'number') return node.toString();

		if (Array.isArray(node)) {
			return node.map((child) => getTextContent(child)).join('');
		}

		if (typeof node === 'object') {
			const element = node as ReactElement;
			if (element.props) {
				const { children } = element.props;
				return getTextContent(children);
			}
		}

		return '';
	} catch (error) {
		console.error('Error in getTextContent:', error);
		return '';
	}
};

export function TruncatedText({ content, maxLength = 50 }: TruncatedTextProps) {
	try {
		// Handle null or undefined content
		if (!content) return null;

		const textContent =
			typeof content === 'string' ? content : getTextContent(content);

		// If content is empty after processing, return null
		if (!textContent.trim()) return null;

		const shouldTruncate = textContent.length > maxLength;

		if (!shouldTruncate) {
			return <span>{textContent}</span>;
		}

		const truncatedText = truncateToWord(textContent, maxLength);

		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<span className='cursor-help'>{truncatedText}</span>
				</TooltipTrigger>
				<TooltipContent>
					<p className='max-w-xs whitespace-normal break-words'>
						{textContent}
					</p>
				</TooltipContent>
			</Tooltip>
		);
	} catch (error) {
		console.error('Error in TruncatedText:', error);
		return null;
	}
}
