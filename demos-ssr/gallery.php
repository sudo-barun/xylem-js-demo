<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

define('NODE_PATH', '');
// define('API_BASE_URL', '');

// $initialData = json_decode(file_get_contents(__DIR__ . '/data.json'), true);
// $initialData['galleryImages'] = array_map(function ($image) {
// 	$image['url'] = API_BASE_URL . $image['url'];
// 	return $image;
// }, $initialData['galleryImages']);
$galleryImages = json_decode(file_get_contents(__DIR__ . '/data-picsum-photos.json'), true);
// $galleryImages = json_decode(file_get_contents('https://picsum.photos/v2/list?page=10'), true);
$galleryImages = array_slice($galleryImages, 0, 10);
$galleryImages = array_map(function ($image) {
	return [
		'url' => $image['download_url'],
		'caption' => "{$image['download_url']} (by {$image['author']})",
	];
}, $galleryImages);
$initialData = [
	'galleryImages' => $galleryImages,
];
$jsonMinified = json_encode($initialData);

$tempFile = tmpfile();
fwrite($tempFile, $jsonMinified);
$tempFilePath = stream_get_meta_data($tempFile)['uri'];

$command = NODE_PATH . " generate-gallery.js $tempFilePath";

$html = exec($command, $output, $resultCode);
if ($resultCode !== 0) {
	throw new \Exception("Failed to execute command: $command");
}

fclose($tempFile);

$fileContents = file_get_contents(__DIR__ . '/gallery.html');

$fileContents = str_replace('__GENERATED_CONTENT__', $html, $fileContents);
$fileContents = str_replace('__INITIAL_DATA__', $jsonMinified, $fileContents);

echo $fileContents;
