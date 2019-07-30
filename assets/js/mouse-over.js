var boxes = document.getElementsByClassName('image-box');
for (var i = 0; i < boxes.length; ++i) {
    var box = boxes[i];
    var screenShot = document.createElement('img');
    screenShot.style.display = 'none';
    screenShot.style.position = 'fixed';
    screenShot.style.left = '0';
    screenShot.style.top = '0';
    screenShot.setAttribute('src', `assets/images/screenshot-${i + 1}.jpg`);
    screenShot.setAttribute('width', '350px')
    box.appendChild(screenShot);
    box.addEventListener("mouseenter", event => {
        var style = event.target.lastElementChild.style;
        style.left = String(event.clientX) + 'px';
        style.top = String(event.clientY) + 'px';
        style.display = 'block';
        style.zIndex = '5';
    });
    box.addEventListener("mousemove", event => {
        var style = event.target.parentElement.lastElementChild.style;
        style.left = String(event.clientX) + 'px';
        style.top = String(event.clientY) + 'px';
    });
    box.addEventListener("mouseleave", event => {
        var style = event.target.lastElementChild.style;
        style.display = 'none';
    });
}
