import { Artwork } from '@/lib/types';
import { ArtCard } from './ArtCard';

interface FeaturedArtworksProps {
	artworks: Artwork[];
	loading: boolean;
	error: string | null;
	onArtworkSelect: (id: number) => void;
}

export function FeaturedArtworks({
	artworks,
	loading,
	error,
	onArtworkSelect,
}: FeaturedArtworksProps) {
	return (
		<div className='mt-16'>
			<h2 className='text-2xl font-bold tracking-tight sm:text-2xl mb-8'>
				Featured Artifacts
			</h2>
			{error ? (
				<div className='text-center text-red-500'>{error}</div>
			) : loading ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-32'>
					{[1, 2, 3].map((n) => (
						<div
							key={n}
							className='animate-pulse bg-muted h-[600px] rounded-2xl'
						/>
					))}
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-32'>
					{artworks.map((artwork) => (
						<ArtCard
							key={artwork.id}
							artwork={artwork}
							onSelect={onArtworkSelect}
						/>
					))}
				</div>
			)}
		</div>
	);
}
