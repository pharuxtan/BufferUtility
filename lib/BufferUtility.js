const util = require("util");
const inspect = util.inspect.custom;
const fs = require("fs");
const buffer = require("buffer");
const ieee754 = require("./ieee754/index");
const stringbuf = require("./string/index");

let tmpFolder = require('os').tmpdir().replace(process.platform == "win32" ? /\//g : /\\\\/g, process.platform == "win32" ? "\\" : "/");

const join = (...args) => args.join(process.platform == "win32" ? "\\" : "/");

const randHex = (len) => {
  let str = "";
  for(let i = 0; i < len; i++){
    str += Math.floor(Math.random()*16).toString(16);
  }
  return str;
}

let tmp = {func: newBufferUtility, exports: BufferUtility, withBufferUtilityFolder: true};

tmp.BufferUtility = class BufferUtility {
  fileDescriptor;
  isTmp;
  filename;
  forceOffset = 0;
  forceLength = null;
  position = 0;
  isDeleted = false;
  parent;

  constructor(buffer, isFile, encoding = "utf8", off, size){
    this[Symbol.unscopables] = {
      isTmp: true
    }
    this.changeDefaultEndian();
    if(off && (typeof off == "number" || typeof off == "bigint")) this.forceOffset = Number(off);
    if(size && (typeof size == "number" || typeof size == "bigint")) this.forceLength = Number(size);
    if(this.forceOffset < 0) this.forceOffset = 0;
    if(this.forceLength && this.forceLength < 0) this.forceLength = 0;
    if(tmp.withBufferUtilityFolder) if(!fs.existsSync(join(tmpFolder, "BufferUtility"))) fs.mkdirSync(join(tmpFolder, "BufferUtility"));
    let file;
    do {
      file = join(...(tmp.withBufferUtilityFolder ? [tmpFolder, "BufferUtility", `${randHex(32)}.bin`] : [tmpFolder, `${randHex(32)}.bin`]));
      if(!fs.existsSync(file)) break;
    } while(true);
    if(isFile){
      if(fs.existsSync(buffer)){
        let stats = fs.statSync(buffer);
        if(!stats.isDirectory()){
          this.fileDescriptor = fs.openSync(buffer, 'rs+');
        } else throw new Error("The path is not a file");
      } else {
        if(typeof buffer == "number"){
          if(buffer >= 0 && buffer < 3) throw new Error(`You can't edit ${buffer == 0 ? "stdin" : buffer == 1 ? "stdout": "stderr"} descriptor`)
          fs.readSync(buffer, Buffer.alloc(1), 0, 1, 0);
          this.fileDescriptor = buffer;
        } else {
          fs.writeFileSync(buffer, "", "utf8");
          this.fileDescriptor = fs.openSync(buffer, 'rs+');
        }
      }
      this.isTmp = false;
      this.filename = buffer;
      return;
    }
    this.isTmp = true;
    this.filename = file;
    if(typeof buffer == 'object'){
      if(Buffer.isBuffer(buffer)){
        fs.writeFileSync(file, buffer, "utf8");
        this.fileDescriptor = fs.openSync(file, 'rs+');
      } else if(Array.isArray(buffer) || buffer instanceof Uint8Array){
        fs.writeFileSync(file, Buffer.from(buffer), "utf8");
        this.fileDescriptor = fs.openSync(file, 'rs+');
      } else if(tmp.exports.isBufferUtility(buffer)) {
        fs.writeFileSync(file, "", "utf8");
        this.fileDescriptor = fs.openSync(file, 'rs+');
        this.writeBytes(buffer);
      } else if((buffer.type == "BufferUtility" || buffer.type == "Buffer") && (buffer.data && Array.isArray(buffer.data))) {
        fs.writeFileSync(file, Buffer.from(buffer.data), "utf8");
        this.fileDescriptor = fs.openSync(file, 'rs+');
      } else throw new Error("The buffer can't be a JSON Object");
    } else if(typeof buffer == 'number') {
      fs.writeFileSync(file, Buffer.alloc(buffer), "utf8");
      this.fileDescriptor = fs.openSync(file, 'rs+');
    } else if(typeof buffer == 'string') {
      fs.writeFileSync(file, buffer, encoding);
      this.fileDescriptor = fs.openSync(file, 'rs+');
    } else {
      fs.writeFileSync(file, "", "utf8");
      this.fileDescriptor = fs.openSync(file, 'rs+');
    }
    if(this.forceLength > this.length) this.forceLength = null;
  }

  clone(file){
    if(this.isDeleted) return undefined;
    let buf;
    if(!file){
      buf = tmp.func(this);
    } else {
      if(typeof file == "string") file = file.replace(process.platform == "win32" ? /\//g : /\\\\/g, process.platform == "win32" ? "\\" : "/");
      buf = tmp.func(file, true);
      buf.writeBytes(this);
    }
    buf.parent = null;
    return buf;
  }

  move(file){
    if(this.parent != null) throw new Error("can't move a children of the parent");
    if(this.isDeleted) return undefined;
    if(typeof file == "string") file = file.replace(process.platform == "win32" ? /\//g : /\\\\/g, process.platform == "win32" ? "\\" : "/");
    this.filename = file;
    return this;
  }

  newBuf(file){
    if(!this.isDeleted) return undefined;
    if(typeof file != "string") file = "";
    file = file.replace(process.platform == "win32" ? /\//g : /\\\\/g, process.platform == "win32" ? "\\" : "/");
    this.filename = "new:"+file;
    return this;
  }

  delete(){
    if(this.parent != null) throw new Error("can't delete a children of the parent");
    if(this.isDeleted) return undefined;
    this.filename = "delete";
    return true;
  }

  changeDefaultEndian(endian = "LE"){
    endian = endian.toUpperCase();
    if(endian == "L" || endian == "B") endian += "E";
    if(endian != "LE" && endian != "BE") throw new Error("Endian argument must be 'LE' or 'BE'");
    let functions = [
      "readInt", "readInt16", "readInt32", "readInt64", "readInt128",
      "readUInt", "readUInt16", "readUInt32", "readUInt64", "readUInt128",
      "readFloat", "readDouble",
      "writeInt", "writeInt16", "writeInt32", "writeInt64", "writeInt128",
      "writeUInt", "writeUInt16", "writeUInt32", "writeUInt64", "writeUInt128",
      "writeFloat", "writeDouble"
    ]
    for(let func of functions){
      this[func] = this[func+endian];
    }
  }

  readByte(pos){
    if(this.isDeleted) return undefined;
    let n = false;
    if(typeof pos != "number" && typeof pos != "bigint") { pos = this.position++, n = true };
    pos = Number(pos);
    if(pos >= this.length){
      if(!n) this.position -= 2;
      throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos}`);
    }
    if(pos < 0) throw new Error(`You can't get a negative position, got ${pos}`);
    let buf = Buffer.alloc(1);
    fs.readSync(this.fileDescriptor, buf, 0, 1, this.forceOffset + Number(pos));
    return buf[0];
  }

  writeByte(value, pos){
    if(this.isDeleted) return undefined;
    if(typeof value != "number" && typeof value != "bigint") throw new Error(`value must be a number, got "${typeof value}"`);
    if(typeof value == "bigint") value = Number(value);
    if(value < 0 || value > 255) throw new Error(`The byte must be between 0 and 255, got ${value}`);
    if(typeof pos != "number" && typeof pos != "bigint") pos = this.position++;
    pos = Number(pos);
    if(pos < 0) throw new Error(`You can't set a negative position, got ${pos}`);
    if(this.forceLength && pos >= this.length) this.forceLength += pos - (this.length - 1);
    let buf = Buffer.alloc(1);
    buf[0] = value;
    fs.writeSync(this.fileDescriptor, buf, 0, 1, this.forceOffset + pos);
    return this;
  }

  rightShift(length, pos, logical=false){
    if(this.isDeleted) return undefined;
    if(typeof length != "number" && typeof length != "bigint") throw new Error(`length must be a number, got "${typeof length}"`);
    if(typeof length == "bigint") length = Number(length);
    if(typeof logical != "boolean") throw new Error(`logical must be Boolean, got "${typeof logical}"`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += length;
    }
    pos = Number(pos);
    let len = this.length - pos;
    if(isNaN(len) || len < 0) return this;
    for(let i = 0; i < len; i++){
      this.writeByte(this[pos+len-(i+1)], pos+len+length-(i+1));
    } for(let i = 0; i < length; i++){
      this.writeByte(logical ? 255 : 0, pos+i);
    }
    return this;
  }

  leftShift(length, pos){
    if(this.isDeleted) return undefined;
    if(typeof length != "number" && typeof length != "bigint") throw new Error(`length must be a number, got "${typeof length}"`);
    if(typeof length == "bigint") length = Number(length);
    if(typeof pos != "number" && typeof pos != "bigint") pos = this.position;
    if(length < 0 || pos < 0) throw new Error(`Length or position can't be under 0`);
    pos = Number(pos);
    if(pos + length >= this.length){
      fs.ftruncateSync(this.fileDescriptor, pos);
      return this;
    }
    for(let i = 0; i < this.length - pos - length; i++){
      this.writeByte(this[pos+length+i], pos+i);
    }
    fs.ftruncateSync(this.fileDescriptor, this.length - length);
    return this;
  }

  read(length, pos){
    if(this.isDeleted) return undefined;
    if(typeof length != "number" && typeof length != "bigint") throw new Error(`length must be a number, got "${typeof length}"`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += Number(length);
    }
    let buf = tmp.func(this.fileDescriptor, true, undefined, this.forceOffset + Number(pos), Number(length));
    buf.parent = this;
    return buf;
  }

  readBytes(...args){ return this.read(...args) };

  slice(pos, final){
    if(this.isDeleted) return undefined;
    if(typeof pos != "number" && typeof pos != "bigint") throw new Error(`position must be a number, got "${typeof pos}"`);
    if(!final) final = this.length;
    if(typeof final != "number" && typeof final != "bigint") throw new Error(`final must be a number, got "${typeof final}"`);
    return this.read(Number(final) - Number(pos), Number(pos));
  }

  writeBytes(buffer, pos){
    if(this.isDeleted) return undefined;
    if(!(Buffer.isBuffer(buffer) || tmp.exports.isBufferUtility(buffer) || Array.isArray(buffer) || util.types.isUint8Array(buffer))) return;
    if(Array.isArray(buffer)){
      for(let b in buffer){
        if(buffer[b] < 0 || buffer[b] > 255) throw new Error(`The byte in index ${b} (${buffer[b]}) in array ${buffer} is invalid`);
      }
    }
    if(typeof pos != "number" && typeof pos != "bigint") pos = null;
    let len = buffer.length;
    for(let i = 0; i < len; i++){
      this.writeByte(buffer[i], (pos != null) ? Number(pos)+i : undefined);
    }
    return this;
  }

  readIntLE(bytesLength, pos){
    if(this.isDeleted) return undefined;
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error(`bytesLength must be a number, got "${typeof bytesLength}"`);
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += bytesLength;
    }
    pos = Number(pos);
    if(pos+(bytesLength-1) >= this.length) throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos+4}`);
    let i = 0
    let val = BigInt(this.readByte(pos+i));
    let mul = 1n
    while(i++ < bytesLength-1 && (mul *= 0x100n)) val += BigInt(this.readByte(pos+i)) * mul;
    mul *= 0x80n;
    if(val >= mul) val -= 2n ** (8n * BigInt(bytesLength));
    if(val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) return val
    return Number(val);
  }

  readIntBE(bytesLength, pos){
    if(this.isDeleted) return undefined;
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error(`bytesLength must be a number, got "${typeof bytesLength}"`);
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += bytesLength;
    }
    pos = Number(pos);
    if(pos+(bytesLength-1) >= this.length) throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos+4}`);
    let i = bytesLength;
    let val = BigInt(this.readByte(pos+(--i)));
    let mul = 1n
    while(i > 0 && (mul *= 0x100n)) val += BigInt(this.readByte(pos+(--i))) * mul;
    mul *= 0x80n;
    if(val >= mul) val -= 2n ** (8n * BigInt(bytesLength));
    if(val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) return val
    return Number(val);
  }

  readSByte(pos) { return this.readIntLE(1, pos) }
  readInt8(pos) { return this.readIntLE(1, pos) }

  readInt16LE(pos) { return this.readIntLE(2, pos) }
  readInt16BE(pos) { return this.readIntBE(2, pos) }

  readInt32LE(pos) { return this.readIntLE(4, pos) }
  readInt32BE(pos) { return this.readIntBE(4, pos) }

  readInt64LE(pos) { return this.readIntLE(8, pos) }
  readInt64BE(pos) { return this.readIntBE(8, pos) }

  readInt128LE(pos) { return this.readIntLE(16, pos) }
  readInt128BE(pos) { return this.readIntBE(16, pos) }

  readUIntLE(bytesLength, pos){
    if(this.isDeleted) return undefined;
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error(`bytesLength must be a number, got "${typeof bytesLength}"`);
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += bytesLength;
    }
    pos = Number(pos);
    if(pos+(bytesLength-1) >= this.length) throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos+4}`);
    let buf = Buffer.alloc(bytesLength);
    fs.readSync(this.fileDescriptor, buf, 0, bytesLength, pos);
    let i = 0
    let val = BigInt(this.readByte(pos+i));
    let mul = 1n
    while(i++ < bytesLength-1 && (mul *= 0x100n)) val += BigInt(this.readByte(pos+i)) * mul;
    if(val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) return val
    return Number(val);
  }

  readUIntBE(bytesLength, pos){
    if(this.isDeleted) return undefined;
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error(`bytesLength must be a number, got "${typeof bytesLength}"`);
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += bytesLength;
    }
    pos = Number(pos);
    if(pos+(bytesLength-1) >= this.length) throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos+4}`);
    let buf = Buffer.alloc(bytesLength);
    fs.readSync(this.fileDescriptor, buf, 0, bytesLength, pos);
    let i = bytesLength;
    let val = BigInt(this.readByte(pos+(--i)));
    let mul = 1n
    while(i > 0 && (mul *= 0x100n)) val += BigInt(this.readByte(pos+(--i))) * mul;
    if(val > Number.MAX_SAFE_INTEGER || val < Number.MIN_SAFE_INTEGER) return val
    return Number(val);
  }

  readUInt8() { return this.readUIntLE(1) }

  readUInt16LE(pos) { return this.readUIntLE(2, pos) }
  readUInt16BE(pos) { return this.readUIntBE(2, pos) }

  readUInt32LE(pos) { return this.readUIntLE(4, pos) }
  readUInt32BE(pos) { return this.readUIntBE(4, pos) }

  readUInt64LE(pos) { return this.readUIntLE(8, pos) }
  readUInt64BE(pos) { return this.readUIntBE(8, pos) }

  readUInt128LE(pos) { return this.readUIntLE(16, pos) }
  readUInt128BE(pos) { return this.readUIntBE(16, pos) }

  writeIntLE(number, bytesLength, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number" && typeof number != "bigint") throw new Error(`number must be a number, got "${typeof number}"`);
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error(`bytesLength must be a number, got "${typeof bytesLength}"`);
    if(typeof number == "number") number = BigInt(parseInt(number));
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    bytesLength = parseInt(bytesLength);
    let maxvalue = 2n**(BigInt(bytesLength)*8n)-1n;
    if(number > maxvalue/2n || number < maxvalue/-2n-1n) throw new Error(`Not a Int${bytesLength*8} number, the number must be between ${maxvalue/-2n-1n} and ${maxvalue/2n}, got ${number}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += bytesLength;
    }
    pos = Number(pos);
    let i = 0;
    let mul = 1n;
    let sub = 0n;
    this.writeByte(Number(number & 0xFFn), pos+i);
    while(++i < bytesLength && (mul *= 0x100n)){
      if(number < 0n && sub === 0n && this.readByte(pos+i-1) !== 0) sub = 1n;
      this.writeByte(Number(((number / mul) >> 0n) - sub & 0xFFn), pos+i);
    };
    return this
  }

  writeIntBE(number, bytesLength, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number" && typeof number != "bigint") throw new Error(`number must be a number, got "${typeof number}"`);
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error(`bytesLength must be a number, got "${typeof bytesLength}"`);
    if(typeof number == "number") number = BigInt(parseInt(number));
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    bytesLength = parseInt(bytesLength);
    let maxvalue = 2n**(BigInt(bytesLength)*8n)-1n;
    if(number > maxvalue/2n || number < maxvalue/-2n-1n) throw new Error(`Not a Int${bytesLength*8} number, the number must be between ${maxvalue/-2n-1n} and ${maxvalue/2n}, got ${number}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += bytesLength;
    }
    pos = Number(pos);
    let i = bytesLength - 1;
    let mul = 1n;
    let sub = 0n;
    this.writeByte(Number(number & 0xFFn), pos+i);
    while(--i >= 0 && (mul *= 0x100n)){
      if(number < 0n && sub === 0n && this.readByte(pos+i+1) !== 0) sub = 1n;
      this.writeByte(Number(((number / mul) >> 0n) - sub & 0xFFn), pos+i);
    }
    return this
  }

  writeSByte(number, pos) { return this.writeIntLE(number, 1, pos) }
  writeInt8(number, pos) { return this.writeIntLE(number, 1, pos) }

  writeInt16LE(number, pos) { return this.writeIntLE(number, 2, pos) }
  writeInt16BE(number, pos) { return this.writeIntBE(number, 2, pos) }

  writeInt32LE(number, pos) { return this.writeIntLE(number, 4, pos) }
  writeInt32BE(number, pos) { return this.writeIntBE(number, 4, pos) }

  writeInt64LE(number, pos) { return this.writeIntLE(number, 8, pos) }
  writeInt64BE(number, pos) { return this.writeIntBE(number, 8, pos) }

  writeInt128LE(number, pos) { return this.writeIntLE(number, 16, pos) }
  writeInt128BE(number, pos) { return this.writeIntBE(number, 16, pos) }

  writeUIntLE(number, bytesLength, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number" && typeof number != "bigint") throw new Error(`number must be a number, got "${typeof number}"`);
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error(`bytesLength must be a number, got "${typeof bytesLength}"`);
    if(typeof number == "number") number = BigInt(parseInt(number));
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    bytesLength = parseInt(bytesLength);
    let maxvalue = 2n**(BigInt(bytesLength)*8n)-1n;
    if(number > maxvalue || number < 0n) throw new Error(`Not a UInt${bytesLength*8} number, the number must be between ${0n} and ${maxvalue}, got ${number}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += bytesLength;
    }
    pos = Number(pos);
    let i = 0;
    let mul = 1n;
    let sub = 0n;
    this.writeByte(Number(number & 0xFFn), pos+i);
    while(++i < bytesLength && (mul *= 0x100n)) this.writeByte(Number((number / mul) & 0xFFn), pos+i);
    return this
  }

  writeUIntBE(number, bytesLength, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number" && typeof number != "bigint") throw new Error(`number must be a number, got "${typeof number}"`);
    if(typeof bytesLength != "number" && typeof bytesLength != "bigint") throw new Error(`bytesLength must be a number, got "${typeof bytesLength}"`);
    if(typeof number == "number") number = BigInt(parseInt(number));
    if(typeof bytesLength == "bigint") bytesLength = Number(bytesLength);
    bytesLength = parseInt(bytesLength);
    let maxvalue = 2n**(BigInt(bytesLength)*8n)-1n;
    if(number > maxvalue || number < 0n) throw new Error(`Not a UInt${bytesLength*8} number, the number must be between ${0n} and ${maxvalue}, got ${number}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += bytesLength;
    }
    pos = Number(pos);
    let i = bytesLength - 1;
    let mul = 1n;
    let sub = 0n;
    this.writeByte(Number(number & 0xFFn), pos+i);
    while(--i >= 0 && (mul *= 0x100n)) this.writeByte(Number((number / mul) & 0xFFn), pos+i);
    return this
  }

  writeUInt8(number, pos) { return this.writeUIntLE(number, 1, pos) }

  writeUInt16LE(number, pos) { return this.writeUIntLE(number, 2, pos) }
  writeUInt16BE(number, pos) { return this.writeUIntBE(number, 2, pos) }

  writeUInt32LE(number, pos) { return this.writeUIntLE(number, 4, pos) }
  writeUInt32BE(number, pos) { return this.writeUIntBE(number, 4, pos) }

  writeUInt64LE(number, pos) { return this.writeUIntLE(number, 8, pos) }
  writeUInt64BE(number, pos) { return this.writeUIntBE(number, 8, pos) }

  writeUInt128LE(number, pos) { return this.writeUIntLE(number, 16, pos) }
  writeUInt128BE(number, pos) { return this.writeUIntBE(number, 16, pos) }

  read7BitEncodedInt(pos){
    if(this.isDeleted) return undefined;
    let addPos = false;
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      addPos = true;
    }
    pos = Number(pos);
    let result = 0n;
    let byteReadJustNow;
    const MaxBytesWithoutOverflow = 4n;
    let i = 0;
    for(let shift = 0n; shift < MaxBytesWithoutOverflow * 7n; shift += 7n, i++){
      byteReadJustNow = BigInt(this.readByte(pos+i));
      result |= (byteReadJustNow & 0x7Fn) << shift;

      if(byteReadJustNow <= 0x7F){
        if(addPos) this.position += i+1;
        return Number(result);
      }
    }

    byteReadJustNow = BigInt(this.readByte(pos+i));
    if (byteReadJustNow > 0b1111){
        throw new Error("Format_Bad7BitInt");
    }
    if(addPos) this.position += i+1;

    result |= byteReadJustNow << (MaxBytesWithoutOverflow * 7n);
    return Number(result);
  }

  read7BitEncodedInt64(pos){
    if(this.isDeleted) return undefined;
    let addPos = false;
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      addPos = true;
    }
    pos = Number(pos);
    let result = 0n;
    let byteReadJustNow;
    const MaxBytesWithoutOverflow = 9n;
    let i = 0;
    for(let shift = 0n; shift < MaxBytesWithoutOverflow * 7n; shift += 7n, i++){
      byteReadJustNow = BigInt(this.readByte(pos+i));
      result |= (byteReadJustNow & 0x7Fn) << shift;

      if(byteReadJustNow <= 0x7F){
        if(addPos) this.position += i+1;
        if(result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) return result
        return Number(result);
      }
    }

    byteReadJustNow = BigInt(this.readByte(pos+i));
    if (byteReadJustNow > 0b1){
        throw new Error("Format_Bad7BitInt");
    }
    if(addPos) this.position += i+1;

    result |= byteReadJustNow << (MaxBytesWithoutOverflow * 7n);
    if(result > Number.MAX_SAFE_INTEGER || result < Number.MIN_SAFE_INTEGER) return result
    return Number(result);
  }

  write7BitEncodedInt(number, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number" && typeof number != "bigint") throw new Error(`number must be a number, got "${typeof number}"`);
    number = BigInt(number);
    if(number < 0) number *= -1n;
    let addPos = false;
    if(typeof pos != "number" && typeof pos != "bigint") { pos = this.position; addPos = true };
    pos = Number(pos);
    let i = 0;
    while(number > 0x7F){
      this.writeByte(Number((number | ~0x7Fn) & 0xFFn), pos+i);
      number >>= 7n;
      i++;
    }
    this.writeByte(number, pos+i);
    if(addPos) this.position += i+1;
    return this
  }

  write7BitEncodedInt64(number, pos){ return this.write7BitEncodedInt(number, pos) }

  readBoolean(pos){
    if(this.isDeleted) return undefined;
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 1;
    }
    return this.readByte(Number(pos)) != 0;
  }

  writeBoolean(bool, pos){
    if(this.isDeleted) return undefined;
    if(typeof bool != "number" && typeof bool != "bigint" && typeof bool != "boolean") throw new Error(`bool must be a boolean, got "${typeof bool}"`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 1;
    }
    if(bool === true) bool = 1;
    if(bool === false) bool = 0;
    if(bool > 0) bool = 1;
    return this.writeByte(bool, Number(pos));
  }

  readFloatLE(pos){
    if(this.isDeleted) return undefined;
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 4;
    }
    pos = Number(pos);
    if(pos+3 >= this.length) throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos+4}`);
    return ieee754.read(this, pos, true, 23, 4);
  }

  readFloatBE(pos){
    if(this.isDeleted) return undefined;
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 4;
    }
    pos = Number(pos);
    if(pos+3 >= this.length) throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos+4}`);
    return ieee754.read(this, pos, false, 23, 4);
  }

  readDoubleLE(pos){
    if(this.isDeleted) return undefined;
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 8;
    }
    pos = Number(pos);
    if(pos+7 >= this.length) throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos+4}`);
    return ieee754.read(this, pos, true, 52, 8);
  }

  readDoubleBE(pos){
    if(this.isDeleted) return undefined;
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 8;
    }
    pos = Number(pos);
    if(pos+7 >= this.length) throw new Error(`Position out of bound, the buffer max position is ${this.length == 0 ? 0 : this.length-1}, got ${pos+4}`);
    return ieee754.read(this, pos, false, 52, 8);
  }

  writeFloatLE(number, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number") throw new Error(`number must be a number, got "${typeof number}"`);
    if(number > 3.4028234663852886e+38 || number < -3.4028234663852886e+38) throw new Error(`Not a float number, the number must be between -3.4028234663852886e+38 and 3.4028234663852886e+38, got ${number}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 4;
    }
    pos = Number(pos);
    ieee754.write(this, number, pos, true, 23, 4);
    return this;
  }

  writeFloatBE(number, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number") throw new Error(`number must be a number, got "${typeof number}"`);
    if(number > 3.4028234663852886e+38 || number < -3.4028234663852886e+38) throw new Error(`Not a float number, the number must be between -3.4028234663852886e+38 and 3.4028234663852886e+38, got ${number}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 4;
    }
    pos = Number(pos);
    ieee754.write(this, number, pos, false, 23, 4);
    return this;
  }

  writeDoubleLE(number, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number") throw new Error(`number must be a number, got "${typeof number}"`);
    if(number > 1.7976931348623157E+308 || number < -1.7976931348623157E+308) throw new Error(`Not a float number, the number must be between -1.7976931348623157E+308 and 1.7976931348623157E+308, got ${number}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 8;
    }
    pos = Number(pos);
    ieee754.write(this, number, pos, true, 52, 8);
    return this;
  }

  writeDoubleBE(number, pos){
    if(this.isDeleted) return undefined;
    if(typeof number != "number") throw new Error(`number must be a number, got "${typeof number}"`);
    if(number > 1.7976931348623157E+308 || number < -1.7976931348623157E+308) throw new Error(`Not a float number, the number must be between -1.7976931348623157E+308 and 1.7976931348623157E+308, got ${number}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += 8;
    }
    pos = Number(pos);
    ieee754.write(this, number, pos, false, 52, 8);
    return this;
  }

  readString(length, encoding="utf8", pos){
    if(this.isDeleted) return undefined;
    if(typeof length != "number" && typeof length != "bigint") throw new Error(`length must be a number, got ${typeof length}`);
    length = Number(length);
    if(length < 0 || length > 1073741799) throw new Error(`length might be between 0 and 1073741799, got ${length}`);
    if(typeof pos != "number" && typeof pos != "bigint"){
      pos = this.position;
      this.position += length;
    }
    if(typeof encoding != "string") encoding = "utf8";
    pos = Number(pos);
    let string;
    switch(encoding.toLowerCase()){
      case 'hex':
        string = stringbuf.hexSlice(this.read(length, pos));
        break;
      case 'utf8':
      case 'utf-8':
        string = stringbuf.utf8Slice(this.read(length, pos));
        break;
      case 'ascii':
        string = stringbuf.asciiSlice(this.read(length, pos));
        break;
      case 'latin1':
      case 'binary':
        string = stringbuf.latin1Slice(this.read(length, pos));
        break;
      case 'base64':
        string = stringbuf.base64Slice(this.read(length, pos));
        break;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        string = stringbuf.ucs2Slice(this.read(length, pos));
        break;
      default:
        throw new TypeError('Unknown encoding: ' + encoding)
    }
    return string;
  }

  readChar(encoding="utf8", pos) { return this.readString(1, encoding, pos) }

  readChars(length, encoding="utf8", pos) { return this.readString(length, encoding, pos).split("") }

  writeString(string, encoding="utf8", pos){
    if(this.isDeleted) return undefined;
    if(typeof encoding != "string") encoding = "utf8";
    if(typeof string != "string") throw new Error(`string might be a string, got ${typeof string}`)
    let addPos = false
    if(typeof pos != "number" && typeof pos != "bigint") { pos = this.position; addPos = true }
    pos = Number(pos);
    let bytes = [];
    switch(encoding.toLowerCase()){
      case 'hex':
        bytes = stringbuf.hexWrite(string);
        break;
      case 'utf8':
      case 'utf-8':
        bytes = stringbuf.utf8Write(string);
        break;
      case 'ascii':
        bytes = stringbuf.asciiWrite(string);
        break;
      case 'latin1':
      case 'binary':
        bytes = stringbuf.latin1Write(string);
        break;
      case 'base64':
        bytes = stringbuf.base64Write(string);
        break;
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        bytes = stringbuf.ucs2Write(string);
        break;
      default:
        throw new TypeError('Unknown encoding: ' + encoding)
    }
    this.writeBytes(bytes, pos);
    if(addPos) this.position += bytes.length;
    return this;
  }

  writeChar(char, encoding="utf8", pos){
    if(typeof char != "string") throw new Error(`char might be a string, got ${typeof char}`);
    return this.writeString(char.substring(0, 1), encoding, pos);
  }

  writeChars(chars, encoding="utf8", pos){
    if(!Array.isArray(chars)) throw new Error(`chars might be an array, got ${typeof char}`);
    for(let i in chars) if(typeof chars[i] != "string") throw new Error(`char at index ${i} might be a string, got ${typeof chars[i]}`);
    return this.writeString(chars.map(c => c.substring(0, 1)).join(""), encoding, pos);
  }

  swap16(){
    let len = this.length;
    if(len % 2 !== 0) throw new RangeError('Buffer size must be a multiple of 16-bits');
    for(let i = 0; i < len; i += 2){
      swap(this, i, i + 1);
    }
    return this;
  }

  swap32(){
    let len = this.length;
    if(len % 4 !== 0) throw new RangeError('Buffer size must be a multiple of 32-bits');
    for(let i = 0; i < len; i += 4){
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this;
  }

  swap64(){
    let len = this.length;
    if(len % 8 !== 0) throw new RangeError('Buffer size must be a multiple of 64-bits');
    for(let i = 0; i < len; i += 8){
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this;
  }

  swap128(){
    let len = this.length;
    if(len % 16 !== 0) throw new RangeError('Buffer size must be a multiple of 128-bits');
    for(let i = 0; i < len; i += 16){
      swap(this, i, i + 15);
      swap(this, i + 1, i + 14);
      swap(this, i + 2, i + 13);
      swap(this, i + 3, i + 12);
      swap(this, i + 4, i + 11);
      swap(this, i + 5, i + 10);
      swap(this, i + 6, i + 9);
      swap(this, i + 7, i + 8);
    }
    return this;
  }

  get length(){
    if(this.isDeleted) return undefined;
    let stats = fs.fstatSync(this.fileDescriptor);
    if(this.forceLength != null && this.forceLength <= stats.size) return this.forceLength;
    return stats.size - this.forceOffset;
  }

  toString(encoding){ if(this.isDeleted) return ""; return this.readString(this.length, encoding, 0) }

  toLocaleString(encoding){ return this.toString(encoding) }

  toJSON(){ //WARNING this function can lead to a javascript fatal error for big file
    return {
      type: "BufferUtility",
      data: Array.from({ length: this.forceLength ?? this.length }, function(_, i){
        return this.readByte(i);
      }, this)
    }
  }

  toBuffer(){
    if(this.isDeleted) return Buffer.alloc(0);
    let length = this.forceLength ?? this.length;
    if(length > buffer.constants.MAX_LENGTH) throw new Error(`The length of this BufferUtility is greater than ${buffer.constants.MAX_LENGTH}, can't convert to a Buffer`);
    let buf = Buffer.allocUnsafe(length);
    fs.readSync(this.fileDescriptor, buf, 0, length, this.forceOffset);
    return buf;
  }

  toBufferList(){
    if(this.isDeleted) return [Buffer.alloc(0)];
    let length = this.forceLength ?? this.length;
    if(length <= buffer.constants.MAX_LENGTH) return [this.toBuffer()];
    let offset = this.forceOffset;
    let arr = [];
    do {
      let len = (length > buffer.constants.MAX_LENGTH) ? buffer.constants.MAX_LENGTH : length;
      let buf = Buffer.allocUnsafe(len);
      fs.readSync(this.fileDescriptor, buf, 0, len, offset);
      offset += len;
      length -= len;
      arr.push(buf);
    } while(length > 0);
    return arr;
  }

  get [Symbol.toStringTag]() { return "BufferUtility" }

  [Symbol.toPrimitive](hint){
    if(hint == "number") return this.length;
    return this[inspect]()
  }

  * [Symbol.iterator](){
    for(let i = 0; i < this.length; i++){
      yield this.readByte(i);
    }
  }

  async* [Symbol.asyncIterator](){
    for(let i = 0; i < this.length; i++){
      yield this.readByte(i);
    }
  }

  [inspect]() {
    if(this.isDeleted) return `<BufferUtility disabled>`;
    let bytes = "";
    if(50 < this.length){
      let buf = Buffer.alloc(50);
      fs.readSync(this.fileDescriptor, buf, 0, 50, this.forceOffset);
      bytes = util.inspect(buf).replace(`<Buffer `, "").replace(`>`, "") + ` ... ${this.length - 50} more bytes`;
    } else {
      let buf = Buffer.alloc(this.length);
      fs.readSync(this.fileDescriptor, buf, 0, this.length, this.forceOffset);
      bytes = util.inspect(buf).replace(`<Buffer `, "").replace(`>`, "");
    }
    return `<BufferUtility ${bytes}>`;
  }
}

function swap(b, n, m){
  var i = b.readByte(n);
  b.writeByte(b.readByte(m), n);
  b.writeByte(i, m);
}

function newBufferUtility(...args){
  let buf = new tmp.BufferUtility(...args);
  let isParentSet = false;
  let handler = {
    get (target, prop) {
      if(["isTmp"].includes(prop)) return undefined;
      if(prop.constructor && prop.constructor.name == "Symbol") return target[prop];
      if(!isNaN(prop)){
        let num = Number(prop);
        return buf.readByte(num);
      }
      return target[prop];
    },
    set (target, prop, value){
      if(["fileDescriptor", "isTmp", "forceOffset", "forceLength", "isDeleted"].includes(prop)) return true;
      if(prop == "parent" && isParentSet) return value;
      if(prop == "filename"){
        if(value == "delete"){
          fs.closeSync(target.fileDescriptor);
          fs.unlinkSync(target.filename);
          target.fileDescriptor = NaN;
          target.position = 0;
          target.filename = null;
          target.forceOffset = 0;
          target.forceLength = null;
          target.parent = null;
          target.isTmp = undefined;
          target.isDeleted = true;
          return true;
        } else if(value.startsWith("new:")){
          value = value.substr(4);
          if(!fs.existsSync(value)){
            if(tmp.withBufferUtilityFolder && !fs.existsSync(join(tmpFolder, "BufferUtility"))) fs.mkdirSync(join(tmpFolder, "BufferUtility"));
            do {
              value = join(...(tmp.withBufferUtilityFolder ? [tmpFolder, "BufferUtility", `${randHex(32)}.bin`] : [tmpFolder, `${randHex(32)}.bin`]));
              if(!fs.existsSync(value)) break;
            } while(true);
            target.isTmp = true;
          } else target.isTmp = false;
          if(!fs.existsSync(value)) fs.writeFileSync(value, "", "utf8");
          target.fileDescriptor = fs.openSync(value, "rs+");
          target.isDeleted = false;
          target.filename = value;
          return true;
        }
        if(!value){
          if(tmp.withBufferUtilityFolder && !fs.existsSync(join(tmpFolder, "BufferUtility"))) fs.mkdirSync(join(tmpFolder, "BufferUtility"));
          do {
            value = join(...(tmp.withBufferUtilityFolder ? [tmpFolder, "BufferUtility", `${randHex(32)}.bin`] : [tmpFolder, `${randHex(32)}.bin`]));
            if(!fs.existsSync(value)) break;
          } while(true);
          target.isTmp = true;
        } else target.isTmp = false;
        if(fs.existsSync(value)){
          target.fileDescriptor = fs.openSync(value, "rs+");
          target[prop] = value;
          return true;
        } else {
          fs.renameSync(target[prop], value);
          target[prop] = value;
          return true;
        }
      }
      if(prop == "position"){
        if(!isNaN(value)){
          let val = Number(value);
          if(val < 0) throw new Error(`You can't set a negative position, got ${val}`);
          target[prop] = val;
          return true;
        }
      }
      if(!isNaN(prop)){
        let num = Number(prop);
        buf.writeByte(value, num);
        return true;
      }
      if(prop == "parent") isParentSet = true;
      target[prop] = value;
      return true;
    },
    ownKeys () {
      return ["fileDescriptor", "filename", "position", "isDeleted", "parent"];
    }
  }
  return new Proxy(buf, handler);
}

function BufferUtility(...args){
  let buf = newBufferUtility(...args);
  buf.parent = null;
  return buf;
}

BufferUtility.isBufferUtility = function isBufferUtility(buffer) { return buffer instanceof tmp.BufferUtility };
BufferUtility.changeTmpFolder = function changeTmpFolder(folder, withBufferUtilityFolder = true){
  if(fs.existsSync(folder)){
    let stats = fs.statSync(folder);
    if(stats.isDirectory()){
      if(typeof withBufferUtilityFolder == "boolean") tmp.withBufferUtilityFolder = withBufferUtilityFolder;
      return tmpFolder = folder.replace(process.platform == "win32" ? /\//g : /\\\\/g, process.platform == "win32" ? "\\" : "/");
    }
  } throw new Error("folder is not a directory");
};
BufferUtility.concat = function concat(bufarr, createNewBU = false){
  if(typeof createNewBU != "boolean") createNewBU = false;
  if(!Array.isArray(bufarr)) throw new Error(`bufarr must be an array, got ${typeof bufarr}`);
  if(bufarr.length == 1) throw new Error(`bufarr length must be greater than 1, got ${bufarr.length}`);
  for(let i = 0; i < bufarr.length; i++){
      if(!(Buffer.isBuffer(bufarr[i]) || tmp.exports.isBufferUtility(bufarr[i]) || Array.isArray(bufarr[i]) || util.types.isUint8Array(bufarr[i]))) throw new Error(`The index ${i} of the array is not a BufferUtility/Buffer/Array/Uint8Array`);
      if(Array.isArray(bufarr[i])){
        for(let b in bufarr[i]){
          if(bufarr[i][b] < 0 || bufarr[i][b] > 255) throw new Error(`The byte in index ${b} (${bufarr[i][b]}) in array ${bufarr[i]} is invalid`);
        }
      }
  }
  let basebuf;
  let bakPos = 0;
  if(!createNewBU){
    if(!BufferUtility.isBufferUtility(bufarr[0])) throw new Error("the first element of the array must be a BufferUtility");
    basebuf = bufarr[0];
    bakPos = basebuf.position;
    basebuf.position = basebuf.length;
  } else basebuf = BufferUtility(bufarr[0]);
  for(let i = 1; i < bufarr.length; i++){
    basebuf.writeBytes(bufarr[i]);
  }
  basebuf.position = bakPos;
  return basebuf;
}
BufferUtility.byteLength = Buffer.byteLength;
BufferUtility.compare = function compare(a, b){
  if (!BufferUtility.isBufferUtility(a) || !BufferUtility.isBufferUtility(b)) throw new TypeError('The "buf1", "buf2" arguments must be one of type BufferUtility');

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

BufferUtility.prototype = tmp.BufferUtility.prototype;

module.exports = BufferUtility;
