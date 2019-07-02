var seconds = 0;
var recording = false;
var track = null;
var cancelId = null;
var interval;

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		// Start recording
		if (request.start == 'screen') {
			cancelId = chrome.desktopCapture.chooseDesktopMedia(["screen"], function (id) {
				if (id) {
					accessToRecord(id, 'screen', request);
				}
			});
		} else if (request.start == 'tab') {
			cancelId = chrome.desktopCapture.chooseDesktopMedia(["tab"], function (id) {
				if (id) {
					accessToRecord(id, 'desktop', request);
				}
			});
		}

		// Getter for seconds and recording

		if (request.get == 'seconds') {
			sendResponse({
				seconds: seconds
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
		time: ++seconds
	});
}

function accessToRecord(id, type, request) {
	navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			mandatory: {
				chromeMediaSource: type,
				chromeMediaSourceId: id
			}
		}
	}).then(function (mediaStreamObj) {
		interval = setInterval(function () {
			addTime(request);
		}, 1000);
		recording = true;
		playCapturedStream(mediaStreamObj);
	}).catch(function (err) {
		console.log(err);
	});
}

function playCapturedStream(stream) {
	track = new MediaRecorder(stream);

	var chunks = [];
	
	var blob = null;
	var videoURL = null;

	track.start();

	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
			if (request.stop) {
				stream.getTracks().forEach(element => {
					element.stop();
				});
				track.stop();
				chrome.desktopCapture.cancelChooseDesktopMedia(cancelId);
			}
		}
		);

		stream.getVideoTracks()[0].onended = function () {
			stream.getTracks().forEach(element => {
				element.stop();
			});
			track.stop();
			chrome.desktopCapture.cancelChooseDesktopMedia(cancelId);
		};
		
		track.ondataavailable = function (ev) {
			chunks.push(ev.data);
		}
		
		track.onstop = function (ev) {
			var newPlayer = window.open('receiver.html');
			blob = new Blob(chunks, {
				'type': 'video/mp4;'
			});
			chunks = [];
			newPlayer.onload = function () {
				var receiver = newPlayer.document.getElementById('mainScreen');
				videoURL = newPlayer.URL.createObjectURL(blob);
				receiver.src = videoURL;
			}
			recording = false;
			seconds = 0;
			clearInterval(interval);
	}
}