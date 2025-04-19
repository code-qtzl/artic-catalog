import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
	LocalArtwork,
	getArtworkData,
	getFeaturedArtworks,
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
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [searching, setSearching] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const loadingRef = useRef<HTMLTableRowElement | null>(null);

	const loadMoreResults = useCallback(async () => {
		if (searching || !hasMore || searchTerm.length < 2) return;

		setSearching(true);
		try {
			const newResults = await getArtworkData(searchTerm);

			if (newResults.length > 0) {
				const processedResults = newResults.map(
					(item: LocalArtwork) => ({
						...item,
						matchScore: calculateMatchScore(item, searchTerm),
					}),
				);

				const uniqueResults = processedResults.filter(
					(newItem: SearchResult) =>
						!searchResults.some(
							(existing) => existing.id === newItem.id,
						),
				);

				if (uniqueResults.length > 0) {
					setSearchResults((prev) => {
						const combined = [...prev, ...uniqueResults];
						combined.sort(
							(a, b) => (b.matchScore || 0) - (a.matchScore || 0),
						);
						return combined;
					});
				}

				setHasMore(uniqueResults.length > 0);
			} else {
				setHasMore(false);
			}
		} catch (error) {
			console.error('Search error:', error);
			setError(
				error instanceof Error
					? error.message
					: 'Failed to load more results',
			);
			setHasMore(false);
		} finally {
			setSearching(false);
		}
	}, [searchTerm, searching, hasMore, searchResults]);

	useEffect(() => {
		const options = {
			root: document.querySelector('.scroll-area-viewport'),
			threshold: 0.1,
		};

		const observer = new IntersectionObserver((entries) => {
			const target = entries[0];
			if (target.isIntersecting && !searching && hasMore) {
				loadMoreResults();
			}
		}, options);

		const currentLoadingRef = loadingRef.current;
		if (currentLoadingRef) {
			observer.observe(currentLoadingRef);
		}

		return () => {
			if (currentLoadingRef) {
				observer.disconnect();
			}
		};
	}, [loadMoreResults, searching, hasMore]);

	const handleSearch = useCallback((term: string) => {
		if (!term.trim()) {
			setSearchResults([]);
			setSearching(false);
			return;
		}

		setSearching(true);
		setError('');

		const performSearch = async () => {
			try {
				const results = await getArtworkData(term);
				setSearchResults(results || []);
			} catch (err) {
				console.error('Search error:', err);
				setError(
					'An error occurred while searching. Please try again.',
				);
				setSearchResults([]);
			} finally {
				setSearching(false);
			}
		};

		performSearch();
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setSearchTerm(value);
		handleSearch(value);
	};

	useEffect(() => {
		const fetchFeaturedArtworks = async () => {
			try {
				setLoading(true);
				setError(null);

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
					<div className='mt-10 relative max-w-2xl mx-auto'>
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
								onClick={() => handleSearch(searchTerm)}
								disabled={searching}
							>
								{searching ? (
									'Searching...'
								) : (
									<Search className='h-5 w-5' />
								)}
								<span className='sr-only'>Search</span>
							</Button>
						</div>

						{searchTerm.length >= 2 && (
							<div className='absolute w-full mt-2 bg-background border-2 shadow-lg z-50'>
								<ScrollArea className='max-h-[400px] overflow-y-auto'>
									<div className='scroll-area-viewport'>
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
												{searching &&
												searchResults.length === 0 ? (
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
													<>
														{searchResults.map(
															(result) => (
																<TableRow
																	key={
																		result.id
																	}
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
														)}
														<TableRow
															ref={loadingRef}
														>
															<TableCell
																colSpan={5}
																className='text-center py-2 text-sm text-muted-foreground'
															>
																{searching ? (
																	<div className='flex items-center justify-center gap-2'>
																		<div className='h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent'></div>
																		Loading
																		more...
																	</div>
																) : hasMore ? (
																	'Scroll for more results'
																) : (
																	'No more results'
																)}
															</TableCell>
														</TableRow>
													</>
												)}
											</TableBody>
										</Table>
									</div>
								</ScrollArea>
							</div>
						)}
					</div>
					<div className='mt-10 flex items-center justify-center gap-x-6'>
						<Button className='rounded-none border-2 h-12 px-6'>
							Surprise Me
							<ArrowRight className='ml-2 h-4 w-4' />
						</Button>
						<Button
							variant='outline'
							className='rounded-none border-2 h-12 px-6'
						>
							Collections
						</Button>
					</div>
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
