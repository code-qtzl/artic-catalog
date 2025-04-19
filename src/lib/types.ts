export interface DimensionDetail {
	width: number | null;
	height: number | null;
	depth?: number | null;
	diameter?: number | null;
}

export interface RawArtwork {
	id: number;
	title: string;
	artist_title: string;
	image_id: string;
	dimensions_detail?: DimensionDetail[];
	thumbnail?: {
		lqip: string;
		width: number;
		height: number;
		alt_text: string;
	} | null;
	date_display?: string;
	medium_display?: string;
	dimensions?: string;
	description?: string;
}

export interface Artwork {
	id: number;
	title: string;
	artist_title: string;
	image_id: string;
	thumbnail?: {
		lqip: string;
		width: number;
		height: number;
		alt_text: string;
	} | null;
	width: number;
	height: number;
	date_display?: string;
	medium_display?: string;
	dimensions?: string;
	description?: string;
}
