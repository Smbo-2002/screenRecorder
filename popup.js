var tab = document.getElementById('tab');
var screen = document.getElementById('screen');
var navigation = document.getElementById('navigation');
var stopNav = document.getElementById('stop-nav');
var stop = document.getElementById('stop');
var time = document.getElementById('time');

var recording, time;

chrome.runtime.sendMessage({
    get: 'recording'
}, function (response) {
    if (response.recording) {
        recording = response.recording;
        stopNav.style.display = 'block';
        navigation.style.display = 'none';
    } else if (!response.recording) {
        recording = response.recording;
        navigation.style.display = 'block';
        stopNav.style.display = 'none';
    }
});

tab.onclick = function (element) {
    start('tab');
}

screen.onclick = function (element) {
    start('screen');
}

stop.onclick = function (element) {
    stopRecording();
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.time) {
            time.innerHTML = request.time + ' sec';
        }
    }
);


function start(type) {
    if (!recording) {
        recording = true;
        // Change styles
        navigation.style.display = 'none';
        stopNav.style.display = 'block';

        // Send event to background.js
        chrome.runtime.sendMessage({
            start: type
        });
    }
}

function stopRecording () {
    if (recording) {
        recording = false;
        // Change styles
        navigation.style.display = 'block';
        stopNav.style.display = 'none';

        // Send event to background.js
        chrome.runtime.sendMessage({
            stop: true
        });
    }
}