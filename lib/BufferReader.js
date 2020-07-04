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
      this.Position += length;
      if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
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
    let count = 0;
    let shift = 0;
    let b;
    let pos = 0;
    do {
      if(shift == 5*7) throw new Error("Format_Bad7BitInt32");
      b = this.ReadByte();
      count |= (b & 0x7F) << shift;
      shift += 7;
      pos += 1;
    } while ((b & 0x80) != 0);
    this.Position += pos;
    return count
  }

  ReadBoolean(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 1;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(1);
      fs.readSync(this.#buf, buf, 0, 1, pos);
      return buf[0] != 0;
    } else {
      return this.#buf.slice(pos, pos+1)[0] != 0;
    }
  }

  ReadByte(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 1;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(1);
      fs.readSync(this.#buf, buf, 0, 1, pos);
      return buf[0];
    } else {
      return this.#buf.slice(pos, pos+1)[0];
    }
  }

  ReadBytes(length){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += length;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(length);
      fs.readSync(this.#buf, buf, 0, length, pos);
      return buf;
    } else {
      return this.#buf.slice(pos, pos+length);
    }
  }

  ReadChar(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 1;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(1);
      fs.readSync(this.#buf, buf, 0, 1, pos);
      return buf.toString();
    } else {
      return this.#buf.slice(pos, pos+1).toString();
    }
  }

  ReadChars(length){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += length;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(length);
      fs.readSync(this.#buf, buf, 0, length, pos);
      return buf.toString().split("");
    } else {
      return this.#buf.slice(pos, pos+length).toString().split("");
    }
  }

  ReadDouble(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 8;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(8);
      fs.readSync(this.#buf, buf, 0, 8, pos);
      return (this.IsBigEndian) ? buf.readDoubleBE() : buf.readDoubleLE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readDoubleBE(pos) : this.#buf.readDoubleLE(pos);
    }
    return true
  }

  ReadSingle(){ //ReadFloat
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 4;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(4);
      fs.readSync(this.#buf, buf, 0, 4, pos);
      return (this.IsBigEndian) ? buf.readFloatBE() : buf.readFloatLE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readFloatBE(pos) : this.#buf.readFloatLE(pos);
    }
    return true
  }

  ReadInt8(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 1;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(1);
      fs.readSync(this.#buf, buf, 0, 1, pos);
      return buf.readInt8();
    } else {
      return this.#buf.readInt8(pos);
    }
  }

  ReadInt16(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 2;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(2);
      fs.readSync(this.#buf, buf, 0, 2, pos);
      return (this.IsBigEndian) ? buf.readInt16BE() : buf.readInt16LE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readInt16BE(pos) : this.#buf.readInt16LE(pos);
    }
  }

  ReadInt32(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 4;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(4);
      fs.readSync(this.#buf, buf, 0, 4, pos);
      return (this.IsBigEndian) ? buf.readInt32BE() : buf.readInt32LE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readInt32BE(pos) : this.#buf.readInt32LE(pos);
    }
  }

  ReadInt64(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 8;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(8);
      fs.readSync(this.#buf, buf, 0, 8, pos);
      return (this.IsBigEndian) ? buf.readBigInt64BE() : buf.readBigInt64LE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readBigInt64BE(pos) : this.#buf.readBigInt64LE(pos);
    }
  }

  ReadInt(bytesLength){
    if(this.#close) return null;
    if(typeof bytesLength != "number") throw new Error("bytesLength is not a number");
    let pos = this.Position;
    this.Position += bytesLength;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(bytesLength);
      fs.readSync(this.#buf, buf, 0, bytesLength, pos);
      return (this.IsBigEndian) ? buf.readIntBE(0, bytesLength) : buf.readIntLE(0, bytesLength);
    } else {
      return (this.IsBigEndian) ? this.#buf.readIntBE(pos, bytesLength) : this.#buf.readIntLE(pos, bytesLength);
    }
  }

  ReadString(length){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += length;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(length);
      fs.readSync(this.#buf, buf, 0, length, pos);
      return buf.toString();
    } else {
      return this.#buf.slice(pos, pos+length).toString();
    }
  }

  ReadUInt8(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 1;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(1);
      fs.readSync(this.#buf, buf, 0, 1, pos);
      return buf.readUInt8();
    } else {
      return this.#buf.readUInt8(pos);
    }
  }

  ReadUInt16(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 2;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(2);
      fs.readSync(this.#buf, buf, 0, 2, pos);
      return (this.IsBigEndian) ? buf.readUInt16BE() : buf.readUInt16LE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readUInt16BE(pos) : this.#buf.readUInt16LE(pos);
    }
  }

  ReadUInt32(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 4;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(4);
      fs.readSync(this.#buf, buf, 0, 4, pos);
      return (this.IsBigEndian) ? buf.readUInt32BE() : buf.readUInt32LE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readUInt32BE(pos) : this.#buf.readUInt32LE(pos);
    }
  }

  ReadUInt64(){
    if(this.#close) return null;
    let pos = this.Position;
    this.Position += 8;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(8);
      fs.readSync(this.#buf, buf, 0, 8, pos);
      return (this.IsBigEndian) ? buf.readBigUInt64BE() : buf.readBigUInt64LE();
    } else {
      return (this.IsBigEndian) ? this.#buf.readBigUInt64BE(pos) : this.#buf.readBigUInt64LE(pos);
    }
  }

  ReadUInt(bytesLength){
    if(this.#close) return null;
    if(typeof bytesLength != "number") throw new Error("bytesLength is not a number");
    let pos = this.Position;
    this.Position += bytesLength;
    if(pos >= this.#size || this.Position > this.#size) throw new Error("Out of range");
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(bytesLength);
      fs.readSync(this.#buf, buf, 0, bytesLength, pos);
      return (this.IsBigEndian) ? buf.readUIntBE(0, bytesLength) : buf.readUIntLE(0, bytesLength);
    } else {
      return (this.IsBigEndian) ? this.#buf.readUIntBE(pos, bytesLength) : this.#buf.readUIntLE(pos, bytesLength);
    }
  }

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

BufferReader.prototype.ReadFloat = BufferReader.prototype.ReadSingle;

module.exports = BufferReader;
