/*jslint plusplus: true */
/*global console */
/*global self */
/*global importScripts */
/*global lamejs */
/*global ArrayBuffer */
/*global Int8Array */

importScripts('/shared/js/audio_recordings/lame.min.js');

self.clg = self.clg || {};
self.clg.audio = self.clg.audio || {};
self.clg.audio.recorder = self.clg.audio.recorder || {};

(function (ns) {
  'use strict';

  ns.Mp3Encoder = function (config) {
    var pcmChunkSize;
    var encoder;

    var convert = function (message) {
      var index;
      var pcmSamples = message.samples;
      var pcmChunk;
      var mp3Chunk;
      var mp3Chunks = [];

      message.timings.push({
        converted: Date.now()
      });
      var remaining = pcmSamples.length;
      var totalByteLength = 0;
      for (index = 0; remaining >= 0; index += pcmChunkSize) {
        pcmChunk = pcmSamples.subarray(index, index + pcmChunkSize);
        mp3Chunk = encoder.encodeBuffer(pcmChunk);
        totalByteLength += mp3Chunk.byteLength;
        mp3Chunks.push(new Int8Array(mp3Chunk));
        remaining -= pcmChunkSize;
      }

      message.timings.push({
        combined: Date.now()
      });
      var mp3Data = new Int8Array(new ArrayBuffer(totalByteLength));
      var chunkCounter = 0;
      var i;
      for (i = 0; i < mp3Chunks.length; i++) {
        mp3Chunk = mp3Chunks[i];
        var j;
        for (j = 0; j < mp3Chunk.length; j++) {
          mp3Data[chunkCounter++] = mp3Chunk[j];
        }
      }

      message.timings.push({
        delivered: Date.now()
      });
      self.postMessage({
        segment: message.segment,
        timings: message.timings,
        mp3Data: mp3Data.buffer
      });
    };

    (function () {
      pcmChunkSize = config.chunkSize;
      encoder = new lamejs.Mp3Encoder(1, config.sampleRate, config.bitRate);
    }());

    return {
      convert: convert
    };
  };
}(self.clg.audio.recorder));

//Pollyfills
Math.log10 = Math.log10 || function (x) {
  'use strict';
  return Math.log(x) * Math.LOG10E;
};

var mp3Encoder;
self.onmessage = function (event) {
  'use strict';

  switch (event.data.action) {
  case "init":
    mp3Encoder = new self.clg.audio.recorder.Mp3Encoder(event.data.config);
    break;
  case "convert":
    mp3Encoder.convert(event.data);
    break;
  }
};