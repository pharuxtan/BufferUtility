const fs = require("fs");

class BufferReader {
  #buf;
  #isFileDescriptor = false;
  #size = 0;
  #close = false;
  IsBigEndian = false
  Position = 0;

  constructor(buffer, IsBigEndian, Position){
    if(typeof Position == "number") this.Position = Position;
    if(typeof IsBigEndian == "boolean") this.IsBigEndian = IsBigEndian;
    if(typeof buffer == 'object'){
      if(Buffer.isBuffer(buffer)){
        this.#buf = buffer;
        this.#size = buffer.length;
      } else if(Array.isArray(buffer)){
        this.#buf = Buffer.from(buffer);
        this.#size = buffer.length;
      } else throw new Error("The buffer can't be a JSON Object");
    } else if(typeof buffer == 'number') {
      try {
        let stats = fs.fstatSync(buffer);
        this.#buf = buffer;
        this.#size = stats.size;
        this.#isFileDescriptor = true;
      } catch(e){
        if(e.code == "EBADF") throw new Error(`Invalid file descriptor`);
        else throw e;
      }
    } else if(typeof buffer == 'string') {
      if(fs.existsSync(buffer)){
        let stats = fs.statSync(buffer);
        if(!stats.isDirectory()){
          this.#buf = fs.openSync(buffer, 'r');
          this.#size = stats.size;
          this.#isFileDescriptor = true;
        } else throw new Error("The path is not a file");
      } else this.#buf = Buffer.from(buffer);
    } else {
      throw new Error("No buffer or file descriptor specified")
    }
  }

  Read(length, pos){
    if(this.#close) return null;
    if(pos != undefined && typeof pos === "number"){
      if(pos >= this.#size || pos+length > this.#size) throw new Error("Out of range");
    } else {
      pos = this.Position;
      if(pos >= this.#size || this.Position + length > this.#size) throw new Error("Out of range");
      this.Position += length;
    }
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(length);
      fs.readSync(this.#buf, buf, 0, length, pos);
      return buf
    } else {
      return this.#buf.slice(pos, pos+length);
    }
  }

  Read7BitEncodedInt(){
    if(this.#close) return null;
    let count = 0, shift = 0, b = 0;
    do {
      if(shift == 5*7) throw new Error("Format_Bad7BitInt32");
      b = this.ReadByte();
      count |= (b & 0x7F) << shift;
      shift += 7;
    } while ((b & 0x80) != 0);
    return count
  }

  ReadBoolean(){
    if(this.#close) return null;
    return this.ReadByte() != 0;
  }

  ReadBytes(length){
    if(this.#close) return null;
    let bytes = [];
    for(let i=0; i<length; i++) bytes.push(this.ReadByte());
    return bytes;
  }

  ReadChar(encoding){
    if(this.#close) return null;
    return this.ReadString(1, encoding);
  }

  ReadChars(length, encoding){
    if(this.#close) return null;
    return this.ReadString(length, encoding).split("");
  }

  ReadString(length, encoding="utf8"){
    if(this.#close) return null;
    let string;
    switch(encoding.toLowerCase()){
      case 'hex':
        string = hexSlice(this.ReadBytes(length));
        break;
      case 'utf8':
      case 'utf-8':
        string = utf8Slice(this.ReadBytes(length));
        break;
      case 'ascii':
      case 'latin1':
      case 'binary':
        string = asciiSlice(this.ReadBytes(length));
        break;
      case 'base64':
        string = base64Slice(this.ReadBytes(length));
        break;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        string = ucs2Slice(this.ReadBytes(length));
        break;
      default:
        throw new TypeError('Unknown encoding: ' + encoding)
    }
    return string;
  }

  ReadDouble(){
    if(this.#close) return null;
    let pos = this.Position;
    if(pos >= this.#size || this.Position + 8 > this.#size) throw new Error("Out of range");
    this.Position += 8;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(8);
      fs.readSync(this.#buf, buf, 0, 8, pos);
      return (this.IsBigEndian) ? buf.readDoubleBE() : buf.readDoubleLE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readDoubleBE(pos) : this.#buf.readDoubleLE(pos);
    }
    return true
  }

  ReadSingle(){
    if(this.#close) return null;
    let pos = this.Position;
    if(pos >= this.#size || this.Position + 4 > this.#size) throw new Error("Out of range");
    this.Position += 4;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(4);
      fs.readSync(this.#buf, buf, 0, 4, pos);
      return (this.IsBigEndian) ? buf.readFloatBE() : buf.readFloatLE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readFloatBE(pos) : this.#buf.readFloatLE(pos);
    }
    return true
  }

  ReadFloat() { return this.ReadSingle() }

  ReadInt(bytesLength){
    if(this.#close) return null;
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error("bytesLength is not a number");
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    let pos = this.Position;
    if(pos >= this.#size || this.Position + bytesLength > this.#size) throw new Error("Out of range");
    this.Position += bytesLength;
    let buf = Buffer.alloc(bytesLength);
    if(this.#isFileDescriptor){
      fs.readSync(this.#buf, buf, 0, bytesLength, pos);
    } else {
      for(let p=0; p<bytesLength; p++) buf[p] = this.#buf[pos+p];
    }
    let i = (this.IsBigEndian) ? bytesLength : 0
    let val = (this.IsBigEndian) ? BigInt(buf[--i]) : BigInt(buf[0]);
    let mul = 1n
    if(this.IsBigEndian) while(i > 0 && (mul *= 0x100n)) val += BigInt(buf[--i]) * mul;
    else while(i++ < bytesLength-1 && (mul *= 0x100n)) val += BigInt(buf[i]) * mul;
    mul *= 0x80n;
    if(val >= mul) val -= 2n ** (8n * BigInt(bytesLength));
    if(val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) return val
    return Number(val);
  }

  ReadSByte() { return this.ReadInt(1) }

  ReadInt8() { return this.ReadInt(1) }

  ReadInt16() { return this.ReadInt(2) }

  ReadInt32() { return this.ReadInt(4) }

  ReadInt64() { return this.ReadInt(8) }

  ReadInt128() { return this.ReadInt(16) }

  ReadUInt(bytesLength){
    if(this.#close) return null;
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error("bytesLength is not a number");
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    let pos = this.Position;
    if(pos >= this.#size || this.Position + bytesLength > this.#size) throw new Error("Out of range");
    this.Position += bytesLength;
    let buf = Buffer.alloc(bytesLength);
    if(this.#isFileDescriptor){
      fs.readSync(this.#buf, buf, 0, bytesLength, pos);
    } else {
      for(let p=0; p<bytesLength; p++) buf[p] = this.#buf[pos+p];
    }
    let i = (this.IsBigEndian) ? bytesLength : 0
    let val = (this.IsBigEndian) ? BigInt(buf[--i]) : BigInt(buf[0]);
    let mul = 1n
    if(this.IsBigEndian) while(i > 0 && (mul *= 0x100n)) val += BigInt(buf[--i]) * mul;
    else while(i++ < bytesLength-1 && (mul *= 0x100n)) val += BigInt(buf[i]) * mul;
    if(val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) return val
    return Number(val);
  }

  ReadByte() { return this.ReadUInt(1) }

  ReadUInt8() { return this.ReadUInt(1) }

  ReadUInt16() { return this.ReadUInt(2) }

  ReadUInt32() { return this.ReadUInt(4) }

  ReadUInt64() { return this.ReadUInt(8) }

  ReadUInt128() { return this.ReadUInt(16) }

  get String(){
    if(this.#close) return "";
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(this.#size);
      fs.readSync(this.#buf, buf, 0, this.#size, 0);
      return buf.toString();
    } else {
      return this.#buf.toString();
    }
  }

  get Buffer(){
    if(this.#close) return Buffer.alloc(0);
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(this.#size);
      fs.readSync(this.#buf, buf, 0, this.#size, 0);
      return buf;
    } else {
      return this.#buf;
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

module.exports = BufferReader;

let hexSliceLookupTable = (function(){
  let alphabet = '0123456789abcdef'
  let table = new Array(256);
  for (var i = 0; i < 16; ++i) {
    var i16 = i * 16
    for (var j = 0; j < 16; ++j) {
      table[i16 + j] = alphabet[i] + alphabet[j]
    }
  }
  return table
})()

function hexSlice(bytes){
  let len = bytes.length

  let out = ''
  for (let i = 0; i < len; ++i) {
    out += hexSliceLookupTable[bytes[i]];
  }
  return out
}

function utf8Slice(bytes){
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

function asciiSlice(bytes){
  let ret = ''

  for (let i = 0; i < bytes.length; ++i) {
    ret += String.fromCharCode(bytes[i] & 0x7F)
  }
  return ret
}

let lookup = [];
var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (let i = 0, len = code.length; i < len; ++i) lookup[i] = code[i];

function tripletToBase64(num){
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk(bytes, start, end){
  let tmp
  let output = []
  for (let i = start; i < end; i += 3) {
    tmp =
      ((bytes[i] << 16) & 0xFF0000) +
      ((bytes[i + 1] << 8) & 0xFF00) +
      (bytes[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function base64Slice(bytes){
  let tmp;
  let len = bytes.length;
  let extraBytes = len % 3;
  let parts = [];
  let maxChunkLength = 16383;

  for (let i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      bytes, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  if (extraBytes === 1) {
    tmp = bytes[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (bytes[len - 2] << 8) + bytes[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('');
}

function ucs2Slice(bytes){
  let res = ''
  for (let i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}
