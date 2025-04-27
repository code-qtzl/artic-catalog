import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ArtworkDetail } from '@/components/ArtworkDetail';
import { Chat } from '@/components/Chat';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
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
	const [isChatOpen, setIsChatOpen] = useState(false);

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
			<div className='flex min-h-screen flex-col'>
				<Navbar />
				<div className='flex flex-1 relative'>
					<main
						className={`flex-1 transition-all duration-300 ease-in-out ${
							isChatOpen ? 'mr-[400px]' : ''
						}`}
					>
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

					<Button
						className={`fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg transition-transform duration-300 ${
							isChatOpen ? 'translate-x-[-420px]' : ''
						}`}
						onClick={() => setIsChatOpen(!isChatOpen)}
					>
						{isChatOpen ? (
							<X className='h-6 w-6' />
						) : (
							<MessageCircle className='h-6 w-6' />
						)}
					</Button>

					<Chat
						isOpen={isChatOpen}
						onClose={() => setIsChatOpen(false)}
						selectedArtworkId={viewState.artworkId ?? undefined}
					/>
				</div>
			</div>
		</div>
	);
}

export default App;
