<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

$config = parse_ini_file(__DIR__ . '/.config.ini');

define('NODE_PATH', $config['NODE_PATH']);
define('BUN_PATH', $config['BUN_PATH']);
define('DENO_PATH', $config['DENO_PATH']);
define('QUICKJS_PATH', $config['QUICKJS_PATH']);
define('INTERPRETER', $config['INTERPRETER']);

// define('API_BASE_URL', '');

// $initialData = json_decode(file_get_contents(__DIR__ . '/data.json'), true);
// $initialData['galleryImages'] = array_map(function ($image) {
// 	$image['url'] = API_BASE_URL . $image['url'];
// 	return $image;
// }, $initialData['galleryImages']);
$galleryImages = json_decode(file_get_contents(__DIR__ . '/data-picsum-photos.json'), true);
// $galleryImages = json_decode(file_get_contents('https://picsum.photos/v2/list?page=10'), true);
$initialData = [
	'galleryImages' => $galleryImages,
];
$jsonMinified = json_encode($initialData);

$tempFile = tmpfile();
fwrite($tempFile, $jsonMinified);
$tempFilePath = stream_get_meta_data($tempFile)['uri'];

function getCommand($tempFilePath) {
	switch(INTERPRETER) {
		case 'BUN':
			return BUN_PATH . " run " . __DIR__ . "/generate-gallery.js" . ' ' . $tempFilePath;
		case 'QUICKJS':
			return QUICKJS_PATH . " " . __DIR__ . "/generate-gallery.quickjs.js" . ' ' . $tempFilePath;
		case 'DENO':
			return DENO_PATH . " run -A " . __DIR__ . "/generate-gallery.deno.js" . ' ' . $tempFilePath;
		case 'NODE':
		default:
			return NODE_PATH . " " . __DIR__ . "/generate-gallery.js" . ' ' . $tempFilePath;
	}
}

$command = getCommand($tempFilePath);

exec($command, $output, $resultCode);
$outputWithoutLast = array_slice($output, 0, count($output) - 1);
if ($outputWithoutLast) {
	error_log(
		"\n" . join("\n", $outputWithoutLast) . "\n\n",
		3,
		'php://stdout'
	);
}
if ($resultCode !== 0) {
	error_log("Failed to execute command: $command");
	error_log("Result code = " . $resultCode);
	throw new \Exception("Failed to render.");
}

fclose($tempFile);

$fileContents = file_get_contents(__DIR__ . '/gallery.html');

$lastOutput = $output[count($output) - 1];
$fileContents = str_replace('__GENERATED_CONTENT__', $lastOutput, $fileContents);
$fileContents = str_replace('__INITIAL_DATA__', $jsonMinified, $fileContents);

echo $fileContents;
