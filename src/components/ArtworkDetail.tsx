import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Artwork } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ArtworkDetailProps {
	artworkId: number;
	onBack: () => void;
}

export function ArtworkDetail({ artworkId, onBack }: ArtworkDetailProps) {
	const [artwork, setArtwork] = useState<Artwork | null>(null);
	const [loading, setLoading] = useState(true);
	const { toast } = useToast();

	useEffect(() => {
		const fetchArtwork = async () => {
			try {
				setLoading(true);
				const response = await fetch(
					`https://api.artic.edu/api/v1/artworks/${artworkId}?fields=id,title,artist_title,date_display,medium_display,dimensions,description,image_id,thumbnail`,
				);
				const data = await response.json();
				setArtwork(data.data);
			} catch (error) {
				toast({
					variant: 'destructive',
					title: 'Error',
					description:
						error instanceof Error
							? error.message
							: 'An error occurred while fetching the artwork. Please try again.',
				});
				setArtwork(null);
			} finally {
				setLoading(false);
			}
		};

		fetchArtwork();
	}, [artworkId, toast]);

	if (loading) {
		return (
			<div className='container mx-auto mt-8 px-4'>
				<Button variant='ghost' onClick={onBack} className='mb-6'>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Back
				</Button>
				<div className='animate-pulse'>Loading...</div>
			</div>
		);
	}

	if (!artwork) {
		return (
			<div className='container mx-auto mt-8 px-4'>
				<Button variant='ghost' onClick={onBack} className='mb-6'>
					<ArrowLeft className='mr-2 h-4 w-4' />
					Back
				</Button>
				<p>Artwork not found</p>
			</div>
		);
	}

	const imageUrl = artwork.image_id
		? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/843,/0/default.jpg`
		: '';

	return (
		<div className='container mx-auto mt-8 px-4'>
			<Button variant='ghost' onClick={onBack} className='mb-6'>
				<ArrowLeft className='mr-2 h-4 w-4' />
				Back
			</Button>

			<Card className='p-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
					<div className='relative min-h-[500px] md:min-h-[600px] lg:min-h-[700px] bg-black/5 rounded-lg'>
						{artwork.image_id ? (
							<img
								src={imageUrl}
								alt={
									artwork.thumbnail?.alt_text || artwork.title
								}
								className='absolute inset-0 w-full h-full object-contain rounded-lg'
								style={{
									maxHeight: '80vh',
								}}
							/>
						) : (
							<div className='w-full h-full bg-muted flex items-center justify-center rounded-lg'>
								<span className='text-muted-foreground'>
									No image available
								</span>
							</div>
						)}
					</div>
					<div className='flex flex-col justify-start'>
						<h1 className='text-3xl font-bold mb-4'>
							{artwork.title}
						</h1>
						<p className='text-xl text-muted-foreground mb-4'>
							{artwork.artist_title}
						</p>
						<div className='space-y-4'>
							{artwork.date_display && (
								<p>
									<strong>Date:</strong>{' '}
									{artwork.date_display}
								</p>
							)}
							{artwork.medium_display && (
								<p>
									<strong>Medium:</strong>{' '}
									{artwork.medium_display}
								</p>
							)}
							{artwork.dimensions && (
								<p>
									<strong>Dimensions:</strong>{' '}
									{artwork.dimensions}
								</p>
							)}
							{artwork.description && (
								<div>
									<strong>Description:</strong>
									<div
										className='mt-2 prose prose-sm dark:prose-invert'
										dangerouslySetInnerHTML={{
											__html: artwork.description,
										}}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
}
