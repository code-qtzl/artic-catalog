import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { getImageUrl } from '@/config/api';

interface ArtCardProps {
	artwork: {
		id: number;
		image_id: string;
		title: string;
		artist_title: string;
		alt?: string;
		width: number;
		height: number;
	};
	onSelect: (id: number) => void;
}

export function ArtCard({ artwork, onSelect }: ArtCardProps) {
	const { toast } = useToast();

	if (!artwork) {
		return null;
	}

	const handleError = () => {
		toast({
			variant: 'destructive',
			title: 'Error loading artwork',
			description:
				'There was a problem loading the artwork. Please try again.',
		});
	};

	const imageUrl = getImageUrl(artwork.image_id);

	return (
		<div
			className='relative max-w-sm mx-auto group cursor-pointer'
			onClick={() => onSelect(artwork.id)}
		>
			{/* Image Mask Container - Fixed size with overflow hidden */}
			<div className='relative w-[250px] h-[400px] overflow-hidden rounded-2xl border-light/10 border dark:border-dark/10 bg-black/10 shadow-lg transition-transform duration-300 group-hover:scale-100'>
				{artwork.image_id ? (
					<div className='absolute inset-0'>
						<img
							src={imageUrl}
							alt={
								artwork.alt ||
								`${artwork.title} by ${artwork.artist_title}`
							}
							className='w-full h-auto object-cover absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform transition-transform duration-300 group-hover:scale-105'
							style={{
								aspectRatio:
									artwork.width && artwork.height
										? `${artwork.width}/${artwork.height}`
										: undefined,
							}}
							onError={handleError}
						/>
					</div>
				) : (
					<div className='w-full h-full bg-muted flex items-center justify-center'>
						<span className='text-muted-foreground'>
							No image available
						</span>
					</div>
				)}
			</div>

			{/* Content Box */}
			<div className='absolute -bottom-12 left-1/2 -translate-x-1/2 w-[80%]'>
				<Card className='p-6 shadow-xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80'>
					<h3 className='text-xl font-semibold tracking-tight mb-2'>
						{artwork.title}
					</h3>
					<p className='text-muted-foreground'>
						{artwork.artist_title}
					</p>
				</Card>
			</div>
		</div>
	);
}
