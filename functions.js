var num = 0; // global variable

function button1() {
    num++;
    document.getElementById("output").innerHTML = "Press x " + num;
}

function toggleStyleSheet(){
    // Task 1
    // Steps
    // 1 (a) Get style element by ID (hint: getElementById)
    var element = document.getElementById("mainStyleSheet");
    // 1 (b) Check the current stylesheet file name. (hint: element.getAttribute)
    var currentStyle = element.getAttribute('href');

    // 1 (c) Determine new stylesheet file name
    var newStyle;
    if (currentStyle === 'Style_Professional.css') {
        newStyle = 'Style_Art.css';
    } else {
        newStyle = 'Style_Professional.css';
    }
    // 1 (d) replace stylesheet with new stylesheet (hint: element.setAttribute)
    element.setAttribute('href', newStyle);

    // TASK 2
    // 2 (d) For persistence when page is refreshed. save new stylesheet name to localStorage
    // hint: localStorage.setItem(name, value)
    localStorage.setItem('stylesheet', newStyle);

}



window.onload = function(){
    // TASK 2
    // TODO: Make the last div color persist even when someone refreshes the page.

    // Steps
    // 2 (a) get stylesheet name from local storage hint: localStorage.getItem(name)
    var savedStyle = localStorage.getItem('stylesheet');
    if (savedStyle === null) {
        savedStyle = 'Style_Professional.css';
    }
    // 2 (b) get html style element by ID
    var element = document.getElementById('mainStyleSheet');

    // 2 (c) replace href attribute of html element.
    
        element.setAttribute('href', savedStyle)
}

