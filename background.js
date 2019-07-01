var second = 0;
var recording = false;

chrome.runtime.onMessage.addListener(
	function (request, sender, sendResponse) {
		console.log(recording);
		// Start recording
		if (request.start == 'screen') {
			recording = true;
			setInterval(function () {
				addTime(request);
			}, 1000);
		} else if (request.start == 'tab') {
			recording = true;
			setInterval(function () {
				addTime(request);
			}, 1000);
		}

		// Getter for second and recording

		if (request.get == 'second') {
			sendResponse({second: second});
		}
		else if (request.get == 'recording') {
			sendResponse({recording: recording});
		}
	}
);

function addTime(request) {
	chrome.runtime.sendMessage(request.id, {time: ++second});
}
