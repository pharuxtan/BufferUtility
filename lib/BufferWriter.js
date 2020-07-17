const fs = require("fs");

class BufferWriter {
  #buf;
  #isFileDescriptor = false;
  #close = false;
  IsBigEndian = false
  Position = 0;

  constructor(buffer, IsBigEndian, Position){
    if(typeof Position == "number") this.Position = Position;
    if(typeof IsBigEndian == "boolean") this.IsBigEndian = IsBigEndian;
    if(typeof buffer == 'object'){
      if(Buffer.isBuffer(buffer)) this.#buf = buffer;
      else if(Array.isArray(buffer) || buffer instanceof Uint8Array) this.#buf = Buffer.from(buffer);
      else throw new Error("The buffer can't be a JSON Object");
    } else if(typeof buffer == 'number') {
      try {
        let stats = fs.fstatSync(buffer);
        this.#buf = buffer;
        this.#isFileDescriptor = true;
      } catch(e){
        if(e.code == "EBADF") throw new Error(`Invalid file descriptor`);
        else throw e;
      }
    } else if(typeof buffer == 'string') {
      if(fs.existsSync(buffer)){
        let stats = fs.statSync(buffer);
        if(!stats.isDirectory()){
          this.#buf = fs.openSync(buffer, 'rs+');
          this.#isFileDescriptor = true;
        } else throw new Error("The path is not a file");
      } else this.#buf = Buffer.from(buffer);
    } else {
      this.#buf = Buffer.alloc(0);
    }
  }

  Close(){
    if(this.#close) return null;
    this.#close = true;
    if(this.#isFileDescriptor){
      fs.closeSync(this.#buf);
      this.#buf = null;
    } else {
      this.#buf = null;
    }
  }

  WriteBoolean(bool){
    if(this.#close) return null;
    if(typeof bool != "boolean" && (typeof bool != "number" || (bool < 0x0 || bool > 0x1))) throw new Error("Not a boolean");
    if(bool == false) bool = 0x0;
    if(bool == true) bool = 0x1;
    this.WriteByte(bool);
    return true
  }

  WriteBytes(bytes){
    if(this.#close) return null;
    if(typeof bytes != "object") throw new Error("Not a byte array or buffer");
    if(Buffer.isBuffer(bytes)){
      let b = [];
      for(let byte of bytes) b.push(byte);
      bytes = b;
    } if(Array.isArray(bytes)){
      for(let byte of bytes) if(typeof byte != "number" || (byte < 0x0 || byte > 0xFF)) throw new Error("A byte is invalid");
    } else throw new Error("Not a byte array or buffer");
    for(let i in bytes) this.WriteByte(bytes[i]);
    return true
  }

  WriteChar(char, encoding){
    if(this.#close) return null;
    if(typeof char != "string" || (char.length > 1 || char.length < 1)) throw new Error("Not a char");
    if(!encoding) encoding = 'utf8';
    return this.WriteString(char, encoding);
  }

  WriteChars(chars, encoding){
    if(this.#close) return null;
    if(typeof chars != "object") throw new Error("Not a char array");
    if(Array.isArray(chars)){
      for(let char of chars) if(typeof char != "string" || (char.length > 1 || char.length < 1)) throw new Error("A char is invalid");
    } else throw new Error("Not a char array");
    return this.WriteString(chars.join(""), encoding);
  }

  WriteString(string, encoding="utf8"){
    if(this.#close) return null;
    if(typeof string != "string") throw new Error("Not a string");
    if(typeof encoding != "string") throw new Error("Encoding must be a string");
    let bytes = [];
    switch(encoding.toLowerCase()){
      case 'hex':
        bytes = hexWrite(string);
        break;
      case 'utf8':
      case 'utf-8':
        bytes = utf8Write(string);
        break;
      case 'ascii':
        bytes = asciiWrite(string);
        break;
      case 'latin1':
      case 'binary':
        bytes = latin1Write(string);
        break;
      case 'base64':
        bytes = base64Write(string);
        break;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        bytes = ucs2Write(string);
        break;
      default:
        throw new TypeError('Unknown encoding: ' + encoding)
    }
    this.WriteBytes(bytes);
    return bytes.length;
  }

  WriteDouble(number){
    if(this.#close) return null;
    if(typeof number != "number") throw new Error("Not a number");
    if(number > 1.7976931348623157E+308 || number < -1.7976931348623157E+308) throw new Error("Not a Double number");
    let pos = this.Position;
    this.Position += 8;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(8);
      (this.IsBigEndian) ? buf.writeDoubleBE(number) : buf.writeDoubleLE(number);
      fs.writeSync(this.#buf, buf, 0, 8, pos);
    } else {
      let len = 8;
      if(pos+len > this.#buf.length){
        let tmpBuf = new Buffer.alloc(len);
        (this.IsBigEndian) ? tmpBuf.writeDoubleBE(number) : tmpBuf.writeDoubleLE(number);
        let toWrite = this.#buf.length - pos;
        for(let i=0; i<toWrite; i++) this.#buf[pos+i] = tmpBuf.slice(0, toWrite)[i];
        tmpBuf = tmpBuf.slice(toWrite);
        this.#buf = Buffer.concat([this.#buf, tmpBuf]);
      } else {
        (this.IsBigEndian) ? this.#buf.writeDoubleBE(number, pos) : this.#buf.writeDoubleLE(number, pos);
      }
    }
    return true
  }

  WriteSingle(number){
    if(this.#close) return null;
    if(typeof number != "number") throw new Error("Not a number");
    if(number > 3.4028234663852886E+38 || number < -3.4028234663852886E+38) throw new Error("Not a Single (float) number");
    let pos = this.Position;
    this.Position += 4;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(4);
      (this.IsBigEndian) ? buf.writeFloatBE(number) : buf.writeFloatLE(number);
      fs.writeSync(this.#buf, buf, 0, 4, pos);
    } else {
      let len = 4;
      if(pos+len > this.#buf.length){
        let tmpBuf = new Buffer.alloc(len);
        (this.IsBigEndian) ? tmpBuf.writeFloatBE(number) : tmpBuf.writeFloatLE(number);
        let toWrite = this.#buf.length - pos;
        for(let i=0; i<toWrite; i++) this.#buf[pos+i] = tmpBuf.slice(0, toWrite)[i];
        tmpBuf = tmpBuf.slice(toWrite);
        this.#buf = Buffer.concat([this.#buf, tmpBuf]);
      } else {
        (this.IsBigEndian) ? this.#buf.writeFloatBE(number, pos) : this.#buf.writeFloatLE(number, pos);
      }
    }
    return true
  }

  WriteFloat(number) { return this.WriteSingle(number) }

  WriteInt(number, bytesLength){
    if(this.#close) return null;
    if(typeof number != "number" && typeof number != "bigint") throw new Error("Not a number");
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error("bytesLength is not a number");
    if(typeof number == "number") number = BigInt(parseInt(number));
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    bytesLength = parseInt(bytesLength);
    let maxvalue = 2n**(BigInt(bytesLength)*8n)-1n;
    if(number > maxvalue/2n || number < maxvalue/-2n-1n) throw new Error(`Not a Int${bytesLength*8} number`);
    let pos = this.Position;
    this.Position += bytesLength;
    let buf = Buffer.alloc(bytesLength);
    let i = (this.IsBigEndian) ? bytesLength - 1 : 0;
    let mul = 1n;
    let sub = 0n;
    buf[i] = Number(number & 0xFFn);
    let big = this.IsBigEndian;
    function write(){
      if(number < 0n && sub === 0n && buf[(big) ? i+1 : i-1] !== 0) sub = 1n;
      buf[i] = Number(((number / mul) >> 0n) - sub & 0xFFn);
    }
    if(this.IsBigEndian) while(--i >= 0 && (mul *= 0x100n)) write();
    else while(++i < bytesLength && (mul *= 0x100n)) write();
    if(this.#isFileDescriptor){
      fs.writeSync(this.#buf, buf, 0, bytesLength, pos);
    } else {
      let len = bytesLength;
      if(pos+len > this.#buf.length){
        let toWrite = this.#buf.length - pos;
        for(let i=0; i<toWrite; i++) this.#buf[pos+i] = buf.slice(0, toWrite)[i];
        buf = buf.slice(toWrite);
        this.#buf = Buffer.concat([this.#buf, buf]);
      } else {
        for(let byte in buf) this.#buf[pos+byte] = buf[byte];
      }
    }
    return true
  }

  WriteSByte(number) { return this.WriteInt(number, 1) }

  WriteInt8(number) { return this.WriteInt(number, 1) }

  WriteInt16(number) { return this.WriteInt(number, 2) }

  WriteInt32(number) { return this.WriteInt(number, 4) }

  WriteInt64(number) { return this.WriteInt(number, 8) }

  WriteInt128(number) { return this.WriteInt(number, 16) }

  WriteUInt(number, bytesLength){
    if(this.#close) return null;
    if(typeof number != "number" && typeof number != "bigint") throw new Error("Not a number");
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error("bytesLength is not a number");
    if(typeof number == "number") number = BigInt(parseInt(number));
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    bytesLength = parseInt(bytesLength);
    let maxvalue = 2n**(BigInt(bytesLength)*8n)-1n;
    if(number > maxvalue || number < 0n) throw new Error(`Not a UInt${bytesLength*8} number`);
    let pos = this.Position;
    this.Position += bytesLength;
    let buf = Buffer.alloc(bytesLength);
    let i = (this.IsBigEndian) ? bytesLength - 1 : 0;
    let mul = 1n;
    let sub = 0n;
    buf[i] = Number(number & 0xFFn);
    function write(){ buf[i] = Number((number / mul) & 0xFFn) };
    if(this.IsBigEndian) while(--i >= 0 && (mul *= 0x100n)) write();
    else while(++i < bytesLength && (mul *= 0x100n)) write();
    if(this.#isFileDescriptor){
      fs.writeSync(this.#buf, buf, 0, bytesLength, pos);
    } else {
      let len = bytesLength;
      if(pos+len > this.#buf.length){
        let toWrite = this.#buf.length - pos;
        for(let i=0; i<toWrite; i++) this.#buf[pos+i] = buf.slice(0, toWrite)[i];
        buf = buf.slice(toWrite);
        this.#buf = Buffer.concat([this.#buf, buf]);
      } else {
        for(let byte in buf) this.#buf[pos+byte] = buf[byte];
      }
    }
    return true
  }

  WriteByte(number) { this.WriteUInt(number, 1) }

  WriteUInt8(number) { this.WriteUInt(number, 1) }

  WriteUInt16(number) { this.WriteUInt(number, 2) }

  WriteUInt32(number) { this.WriteUInt(number, 4) }

  WriteUInt64(number) { this.WriteUInt(number, 8) }

  WriteUInt128(number) { this.WriteUInt(number, 16) }

  Write7BitEncodedInt(number){
    if(this.#close) return null;
    if(typeof number != "number") throw new Error("Not a number");
    if(number > 0xFFFFFFFF/2-0.5 || number < 0xFFFFFFFF/-2-0.5) throw new Error("It can be max a Int32 number");
    number = parseInt(number);
    while(number >= 0x80){
      this.WriteByte((val | 0x80) & 0xff);
      number >>= 7;
    }
    this.WriteByte(val & 0x7f)
    return true
  }

  get String(){
    if(this.#close) return "";
    if(this.#isFileDescriptor){
      let stats = fs.fstatSync(this.#buf);
      let buf = Buffer.alloc(stats.size);
      fs.readSync(this.#buf, buf, 0, stats.size, 0);
      return buf.toString();
    } else {
      return this.#buf.toString();
    }
  }

  get Buffer(){
    if(this.#close) return Buffer.alloc(0);
    if(this.#isFileDescriptor){
      let stats = fs.fstatSync(this.#buf);
      let buf = Buffer.alloc(stats.size);
      fs.readSync(this.#buf, buf, 0, stats.size, 0);
      return buf;
    } else {
      return this.#buf;
    }
  }

  WriteSwap16(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 2;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(2);
      fs.readSync(this.#buf, buf, 0, 2, pos);
      buf.swap16();
      fs.writeSync(this.#buf, buf, 0, 2, pos);
    } else {
      if(pos+2 > this.#buf.length){
        throw new Error("Can't swap a NaN byte")
      } else {
        let buf = this.#buf.slice(pos, pos+2);
        buf.swap16();
        for(let byte in buf) this.#buf[pos+parseInt(byte)] = buf[byte];
      }
    }
    return true
  }

  WriteSwap32(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 4;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(4);
      fs.readSync(this.#buf, buf, 0, 4, pos);
      buf.swap32();
      fs.writeSync(this.#buf, buf, 0, 4, pos);
    } else {
      if(pos+4 > this.#buf.length){
        throw new Error("Can't swap a NaN byte")
      } else {
        let buf = this.#buf.slice(pos, pos+4);
        buf.swap32();
        for(let byte in buf) this.#buf[pos+parseInt(byte)] = buf[byte];
      }
    }
    return true
  }

  WriteSwap64(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 8;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(8);
      fs.readSync(this.#buf, buf, 0, 8, pos);
      buf.swap64();
      fs.writeSync(this.#buf, buf, 0, 8, pos);
    } else {
      if(pos+8 > this.#buf.length){
        throw new Error("Can't swap a NaN byte")
      } else {
        let buf = this.#buf.slice(pos, pos+8);
        buf.swap64();
        for(let byte in buf) this.#buf[pos+parseInt(byte)] = buf[byte];
      }
    }
    return true
  }

  get Length(){
    if(this.#close) return 0;
    if(this.#isFileDescriptor){
      let stats = fs.fstatSync(this.#buf);
      return stats.size;
    } else {
      return this.#buf.length;
    }
  }
}

module.exports = BufferWriter;

function hexWrite(string){
  let length = string.length / 2;
  let bytes = [];

  for(let i = 0; i < length; i++){
    let parsed = parseInt(string.substr(i * 2, 2), 16);
    if(parsed == NaN) return bytes;
    bytes[i] = parsed;
  }

  return bytes;
}

function utf8Write(string){
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

function asciiWrite(string){
  var bytes = []
  for (var i = 0; i < string.length; ++i) {
    bytes.push(string.charCodeAt(i) & 0x7F)
  }
  return bytes
}

function latin1Write(string){
  var bytes = []
  for (var i = 0; i < string.length; i++){
    bytes.push(string.charCodeAt(i) & 0xFF);
  }
}

let revLookup = []

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (let i = 0, len = code.length; i < len; ++i) revLookup[code.charCodeAt(i)] = i;
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function base64Write(string){
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
    tmp = (revLookup[string.charCodeAt(i)] << 18) | (revLookup[string.charCodeAt(i + 1)] << 12) | (revLookup[string.charCodeAt(i + 2)] << 6) | revLookup[string.charCodeAt(i + 3)];
    bytes[curByte++] = (tmp >> 16) & 0xFF;
    bytes[curByte++] = (tmp >> 8) & 0xFF;
    bytes[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    bytes[curByte++] = tmp & 0xFF;
  }

  if (placeHoldersLen === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    bytes[curByte++] = (tmp >> 8) & 0xFF;
    bytes[curByte++] = tmp & 0xFF;
  }

  return bytes
}

function ucs2Write(string){
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
