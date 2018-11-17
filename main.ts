
basic.forever(function () {
    let buffer: Buffer
    buffer = serial.readBuffer(10);
    let result = sds011.parseMessage(buffer);
    let pm2_5: number = result.pm2_5;
    let pm10: number = result.pm10;
    basic.showNumber(pm2_5);
})
