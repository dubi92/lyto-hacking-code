const robot = require('robotjs');
const cv = require('opencv4nodejs');

/*
robot.setMouseDelay(2);
var twoPI = Math.PI * 2.0;
var screenSize = robot.getScreenSize();
var height = (screenSize.height / 2) - 10;
var width = screenSize.width;

for (var x = 0; x < width; x++)
{
    y = height * Math.sin((twoPI * x) / width) + height;
    robot.moveMouse(x, y);
}*/

while (true) {
    // Get mouse position.
    var mouse = robot.getMousePos();

// Get pixel color in hex format.
    var hex = robot.getPixelColor(mouse.x, mouse.y);
    console.log("#" + hex + " at x:" + mouse.x + " y:" + mouse.y);
}
