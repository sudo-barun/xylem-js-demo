const fs = require('fs');

if (process.argv[2]) {
	const initialDataJSON = fs.readFileSync(process.argv[2], 'utf-8');
	global.INITIAL_DATA_JSON = initialDataJSON;
}


global.API_BASE_URL = '';

require('./generate-gallery-handler.bundle.cjs');
