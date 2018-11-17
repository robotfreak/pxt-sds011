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

namespace sds011 {

    export function parseMessage(rawBuffer: Buffer) {
        // Decodes the hex value string
        const buffer = toHex(rawBuffer);

        // crc check
        if (!crcOk(rawBuffer)) {
            return 0;
        }

        // Extract PM values. Formula from the spec:
        //   PM2.5 value: PM2.5 (ug/m3) = ((PM2.5 High byte *256) + PM2.5 low byte) / 10
        //   PM10 value: PM10 (ug/m3) = ((PM10 high byte*256) + PM10 low byte) / 10
        const pm2_5 = (buffer.charCodeAt(2) | (buffer.charCodeAt(3) << 8)) / 10.0;
        const pm10 = (buffer.charCodeAt(4) | (buffer.charCodeAt(5) << 8)) / 10.0;

        return {
            pm2_5: pm2_5,
            pm10: pm10
        }
    }

    // Check-sum: Check-sum=DATA1+DATA2+...+DATA6
    function crc(buffer: Buffer) {
        const part = buffer.slice(2, 8);

        var calcCrc = part.reduce(function (prev, curr) {
            return prev + curr
        });

        calcCrc &= 0xFF;

        return calcCrc;
    }

    // Compare calculated checksum with the checksum in the buffer
    function crcOk(buffer: Buffer) {
        const novaCrc = buffer[8];
        const calcCrc = crc(buffer);

        return (calcCrc == novaCrc);
    }

    function toHex(str: Buffer):string {
        let result = '';

        for (var i = 0; i < str.length; i++) {
            result += str[i].toString(16);
        }

        return result;
    };

}