import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';

import "../js/lib/ts/core/createStore.js";
import parse from "../js/lib/ts/server/parse.js";
import Root from "../js/ts/gallery/components/Root.js";

const PORT = 8000;

const MIME_TYPES = {
	default: 'application/octet-stream',
	html: 'text/html; charset=UTF-8',
	js: 'application/javascript',
	css: 'text/css',
	png: 'image/png',
	jpg: 'image/jpg',
	gif: 'image/gif',
	ico: 'image/x-icon',
	svg: 'image/svg+xml',
};

const STATIC_PATH = path.join(process.cwd(), './');

const toBool = [() => true, () => false];

const prepareFile = async (url) => {
	const paths = [STATIC_PATH, url];
	if (url.endsWith('/')) paths.push('index.html');
	const filePath = path.join(...paths);

	const pathTraversal = !filePath.startsWith(STATIC_PATH);
	const exists = await fs.promises.access(filePath).then(...toBool);
	const found = !pathTraversal && exists;
	const streamPath = found ? filePath : '404.html';
	const ext = path.extname(streamPath).substring(1).toLowerCase();
	const stream = fs.createReadStream(streamPath);
	return { found, ext, stream };
};

http.createServer(async (req, res) => {

	if (req.url !== '/') {

		const file = await prepareFile(req.url);
		const statusCode = file.found ? 200 : 404;
		const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default;
		res.writeHead(statusCode, { 'Content-Type': mimeType });
		file.stream.pipe(res);
		console.log(`${req.method} ${req.url} ${statusCode}`);

	} else {

		const component = new Root();
		component.setModifier(modifier);
		const html = parse(component);

		const fileContent = await fs.promises.readFile('gallery.html', 'utf-8');

		const responseBody = fileContent
			.replace('__INITIAL_DATA__', JSON.stringify(initialData))
			.replace('__GENERATED_CONTENT__', html)
		;
	
		const mimeType = MIME_TYPES['html'];
		res.writeHead(200, { 'Content-Type': mimeType });
	
		res.write(responseBody);
		res.end();

	}

}).listen(PORT);

console.log(`Server running at http://127.0.0.1:${PORT}/`);


const API_BASE_URL = '';

const initialData = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

initialData.galleryImages = initialData.galleryImages.map((image) => {
	image.url = API_BASE_URL + image.url;
	return image;
});

function modifier(component)
{
	if (component instanceof Root) {
		component.injectAttributes({
			apiBaseUrl: '',
			initialData,
		});
	}
}
