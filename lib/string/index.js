module.exports = class StringBuf {
  static hexSliceLookupTable = (function(){
    let alphabet = '0123456789abcdef'
    let table = new Array(256);
    for (var i = 0; i < 16; ++i) {
      var i16 = i * 16
      for (var j = 0; j < 16; ++j) {
        table[i16 + j] = alphabet[i] + alphabet[j]
      }
    }
    return table
  })();

  static lookup = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","0","1","2","3","4","5","6","7","8","9","+","/"];

  static revLookup = [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,62,null,62,null,63,52,53,54,55,56,57,58,59,60,61,null,null,null,null,null,null,null,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,null,null,null,null,63,null,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51];

  static hexSlice(bytes){
    let len = bytes.length

    let out = ''
    for (let i = 0; i < len; ++i) {
      out += StringBuf.hexSliceLookupTable[bytes[i]];
    }
    return out
  }

  static utf8Slice(bytes){
    let len = bytes.length;
    let res = [];

    let i = 0;
    while(i < len){
      let firstByte = bytes[i]
      let codePoint = null
      let bytesPerSequence = (firstByte > 0xEF) ? 4 : (firstByte > 0xDF) ? 3 : (firstByte > 0xBF) ? 2 : 1;

      if (i + bytesPerSequence <= len) {
        let secondByte, thirdByte, fourthByte, tempCodePoint

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) codePoint = firstByte
            break
          case 2:
            secondByte = bytes[i + 1]
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
              if (tempCodePoint > 0x7F) codePoint = tempCodePoint;
            }
            break
          case 3:
            secondByte = bytes[i + 1]
            thirdByte = bytes[i + 2]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) codePoint = tempCodePoint;
            }
            break
          case 4:
            secondByte = bytes[i + 1]
            thirdByte = bytes[i + 2]
            fourthByte = bytes[i + 3]
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) codePoint = tempCodePoint;
            }
        }
      }

      if (codePoint === null) {
        codePoint = 0xFFFD
        bytesPerSequence = 1
      } else if (codePoint > 0xFFFF) {
        codePoint -= 0x10000
        res.push(codePoint >>> 10 & 0x3FF | 0xD800)
        codePoint = 0xDC00 | codePoint & 0x3FF
      }

      res.push(codePoint)
      i += bytesPerSequence
    }

    return res.map(char => String.fromCharCode(char)).join("");
  }

  static asciiSlice(bytes){
    let ret = ''

    for (let i = 0; i < bytes.length; ++i) {
      ret += String.fromCharCode(bytes[i] & 0x7F)
    }
    return ret
  }

  static latin1Slice(bytes){
    let ret = ''

    for (let i = 0; i < bytes.length; ++i) {
      ret += String.fromCharCode(bytes[i])
    }
    return ret
  }

  static tripletToBase64(num){
    return StringBuf.lookup[num >> 18 & 0x3F] +
      StringBuf.lookup[num >> 12 & 0x3F] +
      StringBuf.lookup[num >> 6 & 0x3F] +
      StringBuf.lookup[num & 0x3F]
  }

  static encodeChunk(bytes, start, end){
    let tmp
    let output = []
    for (let i = start; i < end; i += 3) {
      tmp =
        ((bytes[i] << 16) & 0xFF0000) +
        ((bytes[i + 1] << 8) & 0xFF00) +
        (bytes[i + 2] & 0xFF)
      output.push(StringBuf.tripletToBase64(tmp))
    }
    return output.join('')
  }

  static base64Slice(bytes){
    let tmp;
    let len = bytes.length;
    let extraBytes = len % 3;
    let parts = [];
    let maxChunkLength = 16383;

    for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(StringBuf.encodeChunk(
        bytes, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
      ))
    }

    if (extraBytes === 1) {
      tmp = bytes[len - 1]
      parts.push(
        StringBuf.lookup[tmp >> 2] +
        StringBuf.lookup[(tmp << 4) & 0x3F] +
        '=='
      )
    } else if (extraBytes === 2) {
      tmp = (bytes[len - 2] << 8) + bytes[len - 1]
      parts.push(
        StringBuf.lookup[tmp >> 10] +
        StringBuf.lookup[(tmp >> 4) & 0x3F] +
        StringBuf.lookup[(tmp << 2) & 0x3F] +
        '='
      )
    }

    return parts.join('');
  }

  static ucs2Slice(bytes){
    let res = ''
    for (let i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
    }
    return res
  }

  static hexWrite(string){
    let length = string.length / 2;
    let bytes = [];

    for(let i = 0; i < length; i++){
      let parsed = parseInt(string.substr(i * 2, 2), 16);
      if(parsed == NaN) return bytes;
      bytes[i] = parsed;
    }

    return bytes;
  }

  static utf8Write(string){
    let codePoint;
    let length = string.length;
    let leadSurrogate = null;
    let bytes = [];

    for(let i = 0; i < length; i++){
      codePoint = string.charCodeAt(i)

      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        if (!leadSurrogate) {
          if (codePoint > 0xDBFF) {
            bytes.push(0xEF, 0xBF, 0xBD)
            continue
          } else if (i + 1 === length) {
            bytes.push(0xEF, 0xBF, 0xBD)
            continue
          }
          leadSurrogate = codePoint
          continue
        }
        if (codePoint < 0xDC00) {
          bytes.push(0xEF, 0xBF, 0xBD)
          leadSurrogate = codePoint
          continue
        }
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
      } else if (leadSurrogate) {
        bytes.push(0xEF, 0xBF, 0xBD)
      }

      leadSurrogate = null

      if (codePoint < 0x80) {
        bytes.push(codePoint)
      } else if (codePoint < 0x800) {
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        )
      } else if (codePoint < 0x10000) {
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        )
      } else if (codePoint < 0x110000) {
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        )
      } else {
        throw new Error('Invalid code point')
      }
    }

    return bytes;
  }

  static asciiWrite(string){
    var bytes = []
    for (var i = 0; i < string.length; ++i) {
      bytes.push(string.charCodeAt(i) & 0x7F)
    }
    return bytes
  }

  static latin1Write(string){
    var bytes = []
    for (var i = 0; i < string.length; i++){
      bytes.push(string.charCodeAt(i) & 0xFF);
    }
  }

  static base64Write(string){
    string = string.split('=')[0];
    string = string.trim().replace(/[^+/0-9A-Za-z-_]/g, '')
    if (string.length < 2) string = ""
    while (string.length % 4 !== 0) {
      string = string + '='
    }

    let tmp;
    let len = string.length;
    if(len % 4 > 0) throw new Error('Invalid string. Length must be a multiple of 4');

    let validLen = string.indexOf('=');
    if(validLen === -1) validLen = len;

    let placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

    let bytes = [];

    let curByte = 0;

    len = placeHoldersLen > 0 ? validLen - 4 : validLen;

    let i
    for(i = 0; i < len; i += 4){
      tmp = (StringBuf.revLookup[string.charCodeAt(i)] << 18) | (StringBuf.revLookup[string.charCodeAt(i + 1)] << 12) | (StringBuf.revLookup[string.charCodeAt(i + 2)] << 6) | StringBuf.revLookup[string.charCodeAt(i + 3)];
      bytes[curByte++] = (tmp >> 16) & 0xFF;
      bytes[curByte++] = (tmp >> 8) & 0xFF;
      bytes[curByte++] = tmp & 0xFF;
    }

    if (placeHoldersLen === 2) {
      tmp = (StringBuf.revLookup[b64.charCodeAt(i)] << 2) | (StringBuf.revLookup[b64.charCodeAt(i + 1)] >> 4);
      bytes[curByte++] = tmp & 0xFF;
    }

    if (placeHoldersLen === 1) {
      tmp = (StringBuf.revLookup[b64.charCodeAt(i)] << 10) | (StringBuf.revLookup[b64.charCodeAt(i + 1)] << 4) | (StringBuf.revLookup[b64.charCodeAt(i + 2)] >> 2);
      bytes[curByte++] = (tmp >> 8) & 0xFF;
      bytes[curByte++] = tmp & 0xFF;
    }

    return bytes
  }

  static ucs2Write(string){
    let c, hi, lo;
    let bytes = [];

    for (let i = 0; i < string.length; ++i) {
      c = string.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      bytes.push(lo);
      bytes.push(hi);
    }

    return bytes;
  }
}
