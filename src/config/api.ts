const isDevelopment = import.meta.env.DEV;
const API_TIMEOUT = 5000; // Increased timeout to 5 seconds

export const API_CONFIG = {
	BASE_URL: 'https://api.artic.edu/api/v1',
	SEARCH_ENDPOINT: '/artworks/search',
	ARTWORK_ENDPOINT: '/artworks',
	FIELDS: [
		'id',
		'title',
		'image_id',
		'date_display',
		'artist_display',
		'medium_display',
		'dimensions',
		'thumbnail',
	].join(','),
};

interface ApiArtwork {
	id: number;
	title: string;
	artist_title: string;
	medium_display: string;
	description: string;
	image_id: string;
	dimensions_detail: Array<{
		width: number | null;
		height: number | null;
	}>;
}

export interface LocalArtwork {
	id: number;
	title: string;
	artist_title: string;
	medium_display: string;
	description: string;
	image_id: string;
	width: number; // Making these required instead of optional
	height: number;
}

// Map our local development artwork IDs to local image files
const LOCAL_IMAGE_MAP: Record<number, string> = {
	2: '/api-data/images/img1.jpg', // The Old Guitarist
	3: '/api-data/images/img2.jpg', // Woman with a Parasol
	1: '/api-data/images/img3.jpg', // A Sunday on La Grande Jatte
};

// Original Art Institute image IDs for fallback
const ART_INSTITUTE_IMAGE_MAP: Record<number, string> = {
	1: '27992c89-dc9b-4c17-9c16-68d7cfb3dd7f', // A Sunday on La Grande Jatte
	2: '8c864546-d205-2a60-4268-4654afc7d269', // The Old Guitarist
	3: '66d50b90-b5cf-bb54-05c9-9a2c8d9444e7', // Woman with a Parasol
};

// Helper function to fetch with timeout
const fetchWithTimeout = async (url: string, timeout: number) => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const response = await fetch(url, { signal: controller.signal });
		clearTimeout(timeoutId);
		return response;
	} catch (error) {
		clearTimeout(timeoutId);
		throw error;
	}
};

const processArtwork = (item: ApiArtwork): LocalArtwork => {
	const dimensions = item.dimensions_detail?.[0] || {
		width: null,
		height: null,
	};
	return {
		id: item.id,
		title: item.title,
		artist_title: item.artist_title,
		medium_display: item.medium_display,
		description: item.description,
		image_id: item.image_id,
		width: dimensions.width ?? 0, // Ensure we always have a number
		height: dimensions.height ?? 0,
	};
};

export const getLocalArtworkIds = async (): Promise<number[]> => {
	if (!isDevelopment) return [];

	try {
		const response = await fetch(`${API_CONFIG.BASE_URL}/artworks.json`);
		const data = (await response.json()) as LocalArtwork[];
		return data.map((artwork) => artwork.id);
	} catch (err) {
		console.error('Error fetching local artwork IDs:', err);
		return [];
	}
};

export const getLocalArtworkData = async (
	query: string,
): Promise<LocalArtwork[]> => {
	if (!isDevelopment) return [];

	try {
		// First get the list of artwork IDs
		const artworkIds = await getLocalArtworkIds();

		// Then fetch each individual artwork file
		const artworksPromises = artworkIds.map((id) =>
			fetch(`${API_CONFIG.BASE_URL}/artworks/${id}.json`)
				.then((res) => res.json() as Promise<LocalArtwork>)
				.catch((error) => {
					console.error(`Error fetching artwork ${id}:`, error);
					return null;
				}),
		);

		const artworks = (await Promise.all(artworksPromises)).filter(
			(artwork): artwork is LocalArtwork => artwork !== null,
		);

		// Filter artworks based on search query
		if (!query) return artworks;

		const searchTerm = query.toLowerCase();
		return artworks.filter((artwork) => {
			return (
				artwork.title?.toLowerCase().includes(searchTerm) ||
				artwork.artist_title?.toLowerCase().includes(searchTerm) ||
				artwork.medium_display?.toLowerCase().includes(searchTerm) ||
				artwork.description?.toLowerCase().includes(searchTerm)
			);
		});
	} catch (error) {
		console.error('Error fetching local artwork data:', error);
		return [];
	}
};

const API_BASE_URL = 'https://api.artic.edu/api/v1';

export async function getArtworkData(
	searchTerm: string,
): Promise<LocalArtwork[]> {
	try {
		const response = await fetch(
			`${API_BASE_URL}/artworks/search?q=${encodeURIComponent(
				searchTerm,
			)}&fields=id,title,artist_title,medium_display,description,image_id,dimensions_detail,thumbnail`,
		);

		if (!response.ok) {
			throw new Error(
				`API request failed with status ${response.status}`,
			);
		}

		const data = await response.json();

		if (!data.data || !Array.isArray(data.data)) {
			throw new Error('Invalid response format from API');
		}

		return data.data.map((item: ApiArtwork) => processArtwork(item));
	} catch (error) {
		console.error('Error fetching artwork data:', error);
		throw new Error(
			'Failed to fetch artwork data. Please try again later.',
		);
	}
}

export const getImageUrl = (imageId: string) => {
	// Check if we're in development and have a local image
	if (isDevelopment) {
		const localImage = LOCAL_IMAGE_MAP[Number(imageId)];
		if (localImage) {
			return localImage;
		}
	}

	// Fallback to Art Institute image
	const artInstituteId = ART_INSTITUTE_IMAGE_MAP[Number(imageId)] || imageId;
	return `https://www.artic.edu/iiif/2/${artInstituteId}/full/843,/0/default.jpg`;
};

export const handleApiError = (error: Error | unknown) => {
	console.error('API Error:', error);
	throw new Error('An error occurred while fetching data. Please try again.');
};

export const getFeaturedArtworks = async (): Promise<LocalArtwork[]> => {
	try {
		// Try API first
		const apiUrl = `${API_CONFIG.BASE_URL}/artworks?fields=id,title,artist_title,medium_display,description,image_id,dimensions_detail,thumbnail&limit=3`;
		const response = await fetchWithTimeout(apiUrl, API_TIMEOUT);
		const data = await response.json();

		if (data.data) {
			return data.data.map((item: ApiArtwork) => processArtwork(item));
		}
	} catch {
		console.log('API call failed or timed out, falling back to local data');
	}

	// Fallback to local data
	const localData = await getLocalArtworkData('');
	return localData.slice(0, 3);
};

export const getApiUrl = (endpoint: keyof typeof API_CONFIG) => {
	return `${API_CONFIG.BASE_URL}${API_CONFIG[endpoint]}`;
};

export const getDetailImageUrl = (imageId: string) => {
	return getImageUrl(imageId);
};
