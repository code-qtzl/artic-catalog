import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ArtworkDetail } from '@/components/ArtworkDetail';
import { useState } from 'react';

interface ViewState {
	view: 'home' | 'detail';
	artworkId: number | null;
}

function App() {
	const [viewState, setViewState] = useState<ViewState>({
		view: 'home',
		artworkId: null,
	});
	const [isLoading, setIsLoading] = useState(false);

	const handleArtworkSelect = (id: number) => {
		try {
			setIsLoading(true);
			setViewState({ view: 'detail', artworkId: id });
		} finally {
			setIsLoading(false);
		}
	};

	const handleBackClick = () => {
		setViewState({ view: 'home', artworkId: null });
	};

	return (
		<div className='min-h-screen bg-background font-sans antialiased'>
			<div className='relative flex min-h-screen flex-col'>
				<Navbar />
				<main className='flex-1'>
					{isLoading ? (
						<div className='flex items-center justify-center h-screen'>
							<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
						</div>
					) : viewState.view === 'home' ? (
						<Hero onArtworkSelect={handleArtworkSelect} />
					) : (
						<ArtworkDetail
							artworkId={viewState.artworkId!}
							onBack={handleBackClick}
						/>
					)}
				</main>
			</div>
		</div>
	);
}

export default App;
