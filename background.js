var second = 0;
var recording = false;
var track = null;

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		console.log(recording);
		// Start recording
		if (request.start == 'screen') {
			recording = true;
			setInterval(function () {
				addTime(request);
			}, 1000);
			chrome.desktopCapture.chooseDesktopMedia(["screen"], function (id) {
				accessToRecord(id, 'screen')
			});
		} else if (request.start == 'tab') {
			recording = true;
			setInterval(function () {
				addTime(request);
			}, 1000);
			chrome.desktopCapture.chooseDesktopMedia(["tab"], function (id) {
				accessToRecord(id, 'desktop')
			});
		}

		// Getter for second and recording

		if (request.get == 'second') {
			sendResponse({
				second: second
			});
		} else if (request.get == 'recording') {
			sendResponse({
				recording: recording
			});
		}
	}
);

function addTime(request) {
	chrome.runtime.sendMessage(request.id, {
		time: ++second
	});
}

function accessToRecord(id, type) {
	navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: type, // The media source must be 'tab' here.
				chromeMediaSourceId: id
			}
		}
	}).then(function (mediaStreamObj) {
		playCapturedStream(mediaStreamObj);
	}).catch(function (err) {
		console.log(err);
	});
}

function playCapturedStream(stream) {
	console.log('mi bna ka!');
	track = new MediaRecorder(stream);
	var chunks = [];
	track.start();
	var blob;
	var videoURL;

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			if (request.stop) {
				track.stop();

				var newPlayer = window.open('receiver.html');
				newPlayer.onload = function () {
					var receiver = newPlayer.document.getElementById('mainScreen');
					videoURL = newPlayer.URL.createObjectURL(blob);
					receiver.src = videoURL;
				}
			}
		}
	);

	track.ondataavailable = function (ev) {
		chunks.push(ev.data);
	}

	track.onstop = function (ev) {
		blob = new Blob(chunks, { 'type' : 'video/mp4;' });
		chunks = [];
	}
}