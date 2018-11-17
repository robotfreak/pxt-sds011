// Nova Fun SDS011 dust sensor
// See spec here: https://cdn.sparkfun.com/assets/parts/1/2/2/7/5/Laser_Dust_Sensor_Control_Protocol_V1.3.pdf
// 
// Message format:
//   0 AA
//   1 Commander No. C0
//   2 DATA 1 PM2.5 Low byte
//   3 DATA 2 PM2.5 High byte
//   4 DATA 3 PM10 Low byte
//   5 DATA 4 PM10 High byte
//   6 DATA 5 0(Reserved)
//   7 DATA 6 0(Reserved)
//   8 Check-sum Check-sum
//   9 message tail AB

//% color=#fabe58 icon="\uf108" block="Nova SDS011"
namespace sds011 {

    /**
 * Parse Message from SDS011 device 
 * @param rawBuffer Message Buffer
 */
    //% subcategory="SDS011"
    //% blockId="sds011_parse_message" block="parse SDS011 device message"
    //% weight=50
    export function parseMessage(rawBuffer: Buffer) {

        // crc check
        if (!crcOk(rawBuffer)) {
            return {
                pm2_5: 0,
                pm10: 0
            }
        }

        // Extract PM values. Formula from the spec:
        //   PM2.5 value: PM2.5 (ug/m3) = ((PM2.5 High byte *256) + PM2.5 low byte) / 10
        //   PM10 value: PM10 (ug/m3) = ((PM10 high byte*256) + PM10 low byte) / 10
        const pm2_5 = (rawBuffer[2] | (rawBuffer[3] << 8)) / 10.0;
        const pm10 = (rawBuffer[4] | (rawBuffer[5] << 8)) / 10.0;

        return {
            pm2_5: pm2_5,
            pm10: pm10
        }
    }

    // Check-sum: Check-sum=DATA1+DATA2+...+DATA6
    function crc(buffer: Buffer) {
        let calcCrc = 0;

        for (let i = 2; i < 8; i++) {
            calcCrc += buffer[i];
            calcCrc &= 0xFF;
        }

        return calcCrc;
    }

    // Compare calculated checksum with the checksum in the buffer
    function crcOk(buffer: Buffer) {
        const novaCrc = buffer[8];
        const calcCrc = crc(buffer);

        return (calcCrc == novaCrc);
    }

    /**
 * Connects to serial SDS011 device 
 * @param sdsRX MP3 device receiver pin (RX), eg: Mi.A0
 * @param sdsTX MP3 device transmitter pin (TX), eg: Pin.A1
 */
    //% subcategory="SDS011"
    //% blockId="sds011_connect" block="connect SDS011 device with RX attached to %sdsRX | and TX to %sdsTX"
    //% weight=50
    export function connectSDS011(sdsRX: number, sdsTX: number): void {
        serial.redirect(sdsRX, sdsTX, BaudRate.BaudRate9600)
    }


}