type Image = {
	author: string;
	url: string;
	thumbnail: {
		url: string;
		width: number;
		height: number;
	};
	preview: {
		url: string;
		width: number;
		height: number;
	};
	caption: string;
}

export default Image;
