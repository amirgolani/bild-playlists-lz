const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

async function convertToWebm(inputFilePath, outputFilePath) {
  return new Promise((resolve, reject) => {
    const outputDirectory = path.dirname(outputFilePath);
    const tempBackgroundPath = path.join(outputDirectory, 'background.png');

    ffmpeg()
      .input(inputFilePath)
      .inputFormat('any')
      .fps(25)
      .videoCodec('libvpx')
      .audioCodec('libvorbis')
      .size('1920x1080')
      .outputOptions('-deadline best')
      .output(outputFilePath)
      .on('end', () => {
        // Clean up temporary background file
        ffmpeg()
          .input(inputFilePath)
          .inputFormat('any')
          .videoFilters('scale=2*iw:2*ih,boxblur=50')
          .videoCodec('png')
          .output(tempBackgroundPath)
          .on('end', () => {
            resolve();
          })
          .on('error', (err) => {
            reject(err);
          })
          .run();
      })
      .on('error', (err) => {
        reject(err);
      })
      .run();
  });
}

// Example usage:
const inputVideoPath = '/path/to/your/input-video.mp4';
const outputWebmPath = '/incoming-webm/output-video.webm';

convertToWebm(inputVideoPath, outputWebmPath)
  .then(() => {
    console.log('Conversion complete.');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
