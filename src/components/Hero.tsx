import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
	LocalArtwork,
	getArtworkData,
	getFeaturedArtworks,
	getRandomArtwork,
} from '@/config/api';
import { FeaturedArtworks } from './FeaturedArtworks';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TruncatedText } from '@/components/truncated-text';

interface HeroProps {
	onArtworkSelect: (id: number) => void;
}

interface SearchResult extends LocalArtwork {
	matchScore?: number;
}

const stripHtmlTags = (html: string | null): string => {
	if (!html) return 'No description available';
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent || 'No description available';
};

const highlightMatch = (
	text: string,
	searchTerm: string,
): string | JSX.Element => {
	if (!text || !searchTerm.trim()) return text || '';

	// For TruncatedText, return plain text
	if (text.length > 40) {
		return text;
	}

	const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
	return (
		<>
			{parts.map((part, i) =>
				part.toLowerCase() === searchTerm.toLowerCase() ? (
					<span key={i} className='font-bold'>
						{part}
					</span>
				) : (
					part
				),
			)}
		</>
	);
};

const calculateMatchScore = (
	result: SearchResult,
	searchTerm: string,
): number => {
	const term = searchTerm.toLowerCase();
	let score = 0;

	if (result.artist_title?.toLowerCase().includes(term)) score += 15;
	if (result.title?.toLowerCase().includes(term)) score += 10;
	if (result.medium_display?.toLowerCase().includes(term)) score += 5;
	if (stripHtmlTags(result.description).toLowerCase().includes(term))
		score += 3;
	if (result.artist_title?.toLowerCase().startsWith(term)) score += 10;

	return score;
};

export function Hero({ onArtworkSelect }: HeroProps) {
	const [featuredArtworks, setFeaturedArtworks] = useState<LocalArtwork[]>(
		[],
	);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [searching, setSearching] = useState(false);
	const [isLoadingRandom, setIsLoadingRandom] = useState(false);
	const searchTimeoutRef = useRef<number>();

	// Fetch featured artworks
	useEffect(() => {
		const fetchFeaturedArtworks = async () => {
			try {
				setLoading(true);
				const artworks = await getFeaturedArtworks();
				setFeaturedArtworks(artworks);
			} catch (error) {
				console.error('Error fetching artworks:', error);
				setError('Failed to load artworks');
			} finally {
				setLoading(false);
			}
		};

		fetchFeaturedArtworks();
	}, []);

	const handleSearch = useCallback(async (term: string) => {
		// If search term is empty or too short, just clear results without hiding UI
		if (!term.trim() || term.length < 2) {
			setSearchResults([]);
			setSearching(false);
			return;
		}

		try {
			setSearching(true);
			setError(null);

			const results = await getArtworkData(term);
			if (Array.isArray(results)) {
				const processedResults = results.map((item) => ({
					...item,
					matchScore: calculateMatchScore(item, term),
				}));
				processedResults.sort(
					(a, b) => (b.matchScore || 0) - (a.matchScore || 0),
				);
				setSearchResults(processedResults);
			} else {
				setSearchResults([]);
			}
		} catch (err) {
			console.error('Search error:', err);
			setError(
				err instanceof Error
					? err.message
					: 'An error occurred while searching',
			);
			setSearchResults([]);
		} finally {
			setSearching(false);
		}
	}, []);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setSearchTerm(value);

			// Clear any existing timeout
			if (searchTimeoutRef.current) {
				window.clearTimeout(searchTimeoutRef.current);
			}

			// Only search if we have 2 or more characters
			if (value.length >= 2) {
				searchTimeoutRef.current = window.setTimeout(() => {
					handleSearch(value);
				}, 300);
			} else {
				// Clear results but don't hide UI for short search terms
				setSearchResults([]);
				setError(null);
			}
		},
		[handleSearch],
	);

	const handleSurpriseMe = async () => {
		try {
			setIsLoadingRandom(true);
			const randomArtwork = await getRandomArtwork();
			if (randomArtwork) {
				onArtworkSelect(randomArtwork.id);
			}
		} catch (error) {
			console.error('Error getting random artwork:', error);
		} finally {
			setIsLoadingRandom(false);
		}
	};

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				window.clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className='relative px-6 pt-8 lg:px-8'>
			<div className='absolute inset-0 -z-10 overflow-hidden'>
				<div className='absolute left-0 top-1/4 h-48 w-48 -rotate-12 bg-foreground/5'></div>
				<div className='absolute right-1/4 bottom-1/4 h-64 w-64 rotate-45 bg-foreground/5'></div>
				<div className='absolute left-1/3 top-1/2 h-32 w-32 bg-foreground/5'></div>
			</div>
			<div className='mx-auto max-w-4xl pb-32 pt-44 sm:pb-48 sm:pt-36 lg:pb-56 lg:pt-20'>
				<div className='text-center'>
					<h1 className='text-4xl font-bold tracking-tight sm:text-6xl'>
						Artic Catalog
					</h1>
					<p className='mt-6 text-lg leading-8 text-muted-foreground'>
						Discover and explore a vast collection of artworks from
						various artists and mediums. The work is from the
						collection of{' '}
						<a
							href='https://api.artic.edu/docs/'
							target='_blank'
							rel='noopener noreferrer'
							className='text-l underline font-bold bg-gradient-to-br from-orange-600 via-yellow-500 to-orange-500
						 bg-clip-text text-transparent '
						>
							The Art Institute of Chicago
						</a>
						.
					</p>
					<div className='mt-10 relative max-w-2xl mx-auto'>
						<search
							role='search'
							aria-label='Search artworks, artists, description'
						>
							<div className='flex items-center'>
								<Input
									type='search'
									placeholder='Search artworks, artists, description...'
									className='h-12 text-base border-2 rounded-none pl-4 pr-12'
									value={searchTerm}
									onChange={handleInputChange}
								/>
								<Button
									size='icon'
									className='absolute right-0 h-12 w-12 rounded-none border-l-2'
									disabled={searching}
								>
									{searching ? (
										<div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
									) : (
										<Search className='h-5 w-5' />
									)}
								</Button>
							</div>

							{searchTerm.length >= 2 && (
								<div className='absolute w-full mt-2 bg-background border-2 shadow-lg z-50'>
									<ScrollArea className='max-h-[400px]'>
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className='w-[200px]'>
														Artist
													</TableHead>
													<TableHead className='w-[180px]'>
														Title
													</TableHead>
													<TableHead className='w-[150px]'>
														Medium
													</TableHead>
													<TableHead className='w-[200px]'>
														Description
													</TableHead>
													<TableHead className='w-[100px]'>
														Image Status
													</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{searching ? (
													<TableRow>
														<TableCell
															colSpan={5}
															className='text-center py-4'
														>
															<div className='flex items-center justify-center gap-2'>
																<div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
																Searching...
															</div>
														</TableCell>
													</TableRow>
												) : error ? (
													<TableRow>
														<TableCell
															colSpan={5}
															className='text-center py-4 text-red-500'
														>
															{error}
														</TableCell>
													</TableRow>
												) : searchResults.length ===
												  0 ? (
													<TableRow>
														<TableCell
															colSpan={5}
															className='text-center py-4'
														>
															No results found
														</TableCell>
													</TableRow>
												) : (
													searchResults.map(
														(result) => (
															<TableRow
																key={result.id}
																className='cursor-pointer hover:bg-muted/50'
																onClick={() =>
																	onArtworkSelect(
																		result.id,
																	)
																}
															>
																<TableCell>
																	{highlightMatch(
																		result.artist_title ||
																			'Unknown',
																		searchTerm,
																	)}
																</TableCell>
																<TableCell className='font-medium'>
																	{result.title && (
																		<TruncatedText
																			content={
																				result.title
																			}
																			maxLength={
																				35
																			}
																		/>
																	)}
																</TableCell>
																<TableCell>
																	{result.medium_display && (
																		<TruncatedText
																			content={
																				result.medium_display
																			}
																			maxLength={
																				30
																			}
																		/>
																	)}
																</TableCell>
																<TableCell>
																	{result.description && (
																		<TruncatedText
																			content={stripHtmlTags(
																				result.description,
																			)}
																			maxLength={
																				40
																			}
																		/>
																	)}
																</TableCell>
																<TableCell>
																	{result.image_id ? (
																		<span className='text-green-600'>
																			Available
																		</span>
																	) : (
																		<span className='text-red-600'>
																			Not
																			Available
																		</span>
																	)}
																</TableCell>
															</TableRow>
														),
													)
												)}
											</TableBody>
										</Table>
									</ScrollArea>
								</div>
							)}
						</search>
					</div>
				</div>

				<div className='mt-10 flex items-center justify-center gap-x-6'>
					<Button
						className='rounded-none border-2 h-12 px-6'
						onClick={handleSurpriseMe}
						disabled={isLoadingRandom}
					>
						{isLoadingRandom ? (
							<div className='h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
						) : (
							<>
								Surprise Me
								<ArrowRight className='ml-2 h-4 w-4' />
							</>
						)}
					</Button>
					<Button
						variant='outline'
						className='rounded-none border-2 h-12 px-6'
					>
						Collections
					</Button>
				</div>

				{!searchTerm && (
					<FeaturedArtworks
						artworks={featuredArtworks}
						loading={loading}
						error={error}
						onArtworkSelect={onArtworkSelect}
					/>
				)}
			</div>
		</div>
	);
}
