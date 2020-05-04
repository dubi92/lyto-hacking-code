const screenshot = require('screenshot-desktop');
const cv = require('opencv4nodejs');
const robot = require('robotjs');
const _ = require('lodash');
robot.setMouseDelay(2);

const startX = 50;
const startY = 500;

const grayImage = async () => {
    while (true) {
        try {
            const imgSrc = await screenshot();
            const img = await cv.imdecodeAsync(imgSrc);
            const ROI = img.getRegion(new cv.Rect(startX, startY, 500, 500));
            const grayImg = await ROI.bgrToGrayAsync();
            const circles = grayImg.houghCircles(cv.HOUGH_GRADIENT, 1, 10, 40, 40, 0, 100);
            const averageRadius = _.meanBy(circles, (p) => p.z);
            const validCircle = _.filter(circles, circle => Math.abs(circle.z - averageRadius) < 2);
            if (validCircle.length < 4) {
                return;
            }
            if (validCircle.length === 0) {
                console.log("Cannot find circle");
                continue;
            }
            const colors = [];
            for (let i = 0; i < validCircle.length; ++i) {
                let x = Math.round(validCircle[i].x);
                let y = Math.round(validCircle[i].y);
                let color = ROI.at(y, x);
                let radius = validCircle[i].z;
                let center = new cv.Point2(x, y);
                colors.push({color: color, vector: {radius, center}});
            }
            if (colors.length > 49) {
                return;
            }
            let uniqueColor = null;
            for (let i = 0; i < colors.length; i++) {
                let temp = colors[i];
                for (let j = 0; j < colors.length; j++) {
                    if (i !== j) {
                        if (colors[j].color.x === temp.color.x && colors[j].color.y === temp.color.y && colors[j].color.z === temp.color.z) {
                            temp = null;
                            break;
                        }
                    }
                }
                if (temp !== null) {
                    uniqueColor = temp;
                    break;
                }
            }
            if (uniqueColor === null) {
                continue;
            }
            console.log("Color: ", colors);
            console.log("Unique Color: ", uniqueColor);
            const colorImg = grayImg.cvtColor(cv.COLOR_GRAY2BGR);
            robot.moveMouse(0.8 * (uniqueColor.vector.center.x + startX), 0.8 * (uniqueColor.vector.center.y + startY));
            robot.mouseClick();
            colorImg.drawCircle(uniqueColor.vector.center, uniqueColor.vector.radius, new cv.Vec(196, 0, 0), 4, cv.LINE_AA);
            await cv.imshow('canvasOutput', colorImg);
            cv.waitKey(150);
        } catch (err) {
            console.error(err);
        }
    }
};

grayImage().then(result => console.log(result));
