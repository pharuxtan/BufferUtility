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

  ReadChar(){
    if(this.#close) return null;
    return String.fromCharCode(this.ReadByte());
  }

  ReadChars(length){
    if(this.#close) return null;
    let chars = [];
    for(let i=0; i<length; i++) bytes.push(this.ReadChar());
    return chars;
  }

  ReadString(length){
    if(this.#close) return null;
    return this.ReadChars(length).join("");
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
