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
      else if(Array.isArray(buffer)) this.#buf = Buffer.from(buffer);
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
    let pos = this.Position;
    this.Position += 1;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(1);
      buf[0] = bool;
      fs.writeSync(this.#buf, buf, 0, 1, pos);
      return true
    } else {
      if(pos+1 > this.#buf.length){
        let tmpBuf = new Buffer.alloc(1);
        tmpBuf[0] = bool;
        this.#buf = Buffer.concat([this.#buf, tmpBuf]);
      } else {
        this.#buf[pos] = bool;
      }
      return true
    }
  }

  WriteByte(byte){
    if(this.#close) return null;
    if(typeof byte != "number" || (byte < 0x0 || byte > 0xFF)) throw new Error("Not a byte");
    let pos = this.Position;
    this.Position += 1;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(1);
      buf[0] = byte;
      fs.writeSync(this.#buf, buf, 0, 1, pos);
    } else {
      let len = 1;
      if(pos+len > this.#buf.length){
        let tmpBuf = new Buffer.alloc(len);
        tmpBuf[0] = byte;
        let toWrite = this.#buf.length - pos;
        for(let i=0; i<toWrite; i++) this.#buf[pos+i] = tmpBuf.slice(0, toWrite)[i];
        tmpBuf = tmpBuf.slice(toWrite);
        this.#buf = Buffer.concat([this.#buf, tmpBuf]);
      } else {
        this.#buf[pos] = byte;
      }
    }
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
    let pos = this.Position;
    this.Position += bytes.length;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(bytes.length);
      for(let i in bytes) buf[i] = bytes[i];
      fs.writeSync(this.#buf, buf, 0, bytes.length, pos);
    } else {
      let len = bytes.length;
      if(pos+len > this.#buf.length){
        let tmpBuf = new Buffer.alloc(len);
        for(let i in bytes) tmpBuf[i] = bytes[i];
        let toWrite = this.#buf.length - pos;
        for(let i=0; i<toWrite; i++) this.#buf[pos+i] = tmpBuf.slice(0, toWrite)[i];
        tmpBuf = tmpBuf.slice(toWrite);
        this.#buf = Buffer.concat([this.#buf, tmpBuf]);
      } else {
        for(let i in bytes) this.#buf[pos+parseInt(i)] = bytes[i];
      }
    }
    return true
  }

  WriteChar(char){
    if(this.#close) return null;
    if(typeof char != "string" || (char.length > 1 || char.length < 1)) throw new Error("Not a char");
    let pos = this.Position;
    this.Position += 1;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(1);
      buf[0] = char.charCodeAt();
      fs.writeSync(this.#buf, buf, 0, 1, pos);
    } else {
      let len = 1;
      if(pos+len > this.#buf.length){
        let tmpBuf = new Buffer.alloc(len);
        tmpBuf[0] = char.charCodeAt();
        let toWrite = this.#buf.length - pos;
        for(let i=0; i<toWrite; i++) this.#buf[pos+i] = tmpBuf.slice(0, toWrite)[i];
        tmpBuf = tmpBuf.slice(toWrite);
        this.#buf = Buffer.concat([this.#buf, tmpBuf]);
      } else {
        this.#buf[pos] = char.charCodeAt();
      }
    }
    return true
  }

  WriteChars(chars){
    if(this.#close) return null;
    if(typeof chars != "object") throw new Error("Not a char array");
    if(Array.isArray(chars)){
      for(let char of chars) if(typeof char != "string" || (char.length > 1 || char.length < 1)) throw new Error("A char is invalid");
    } else throw new Error("Not a char array");
    let pos = this.Position;
    this.Position += chars.length;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(chars.length);
      for(let i in chars) buf[i] = chars[i].charCodeAt();
      fs.writeSync(this.#buf, buf, 0, chars.length, pos);
    } else {
      let len = chars.length;
      if(pos+len > this.#buf.length){
        let tmpBuf = new Buffer.alloc(len);
        for(let i in chars) tmpBuf[i] = chars[i].charCodeAt();
        let toWrite = this.#buf.length - pos;
        for(let i=0; i<toWrite; i++) this.#buf[pos+i] = tmpBuf.slice(0, toWrite)[i];
        tmpBuf = tmpBuf.slice(toWrite);
        this.#buf = Buffer.concat([this.#buf, tmpBuf]);
      } else {
        for(let i in chars) this.#buf[pos+parseInt(i)] = chars[i].charCodeAt();
      }
    }
    return true
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

  WriteSingle(number){ //WriteFloat
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
      if(number < 0n && sub === 0n && buf[(big) ? i+1 : i-1] !== 0){
        sub = 1n;
      }
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

  WriteInt8(number) { return this.WriteInt(number, 1) }

  WriteInt16(number) { return this.WriteInt(number, 2) }

  WriteInt32(number) { return this.WriteInt(number, 4) }

  WriteInt64(number) { return this.WriteInt(number, 8) }

  WriteInt128(number) { return this.WriteInt(number, 16) }

  WriteString(string){
    if(this.#close) return null;
    if(typeof string != "string") throw new Error("Not a string");
    let chars = string.split("");
    let pos = this.Position;
    this.Position += chars.length;
    if(this.#isFileDescriptor){
      let buf = Buffer.alloc(chars.length);
      for(let i in chars) buf[i] = chars[i].charCodeAt();
      fs.writeSync(this.#buf, buf, 0, chars.length, pos);
    } else {
      let len = chars.length;
      if(pos+len > this.#buf.length){
        let tmpBuf = new Buffer.alloc(len);
        for(let i in chars) tmpBuf[i] = chars[i].charCodeAt();
        let toWrite = this.#buf.length - pos;
        if(Math.sign(toWrite) === -1){
          tmpBuf = Buffer.concat([Buffer.alloc(toWrite*-1), tmpBuf]);
        } else {
          for(let i=0; i<toWrite; i++) this.#buf[pos+i] = tmpBuf.slice(0, toWrite)[i];
          tmpBuf = tmpBuf.slice(toWrite);
        }
        this.#buf = Buffer.concat([this.#buf, tmpBuf]);
      } else {
        for(let i in chars) this.#buf[pos+parseInt(i)] = chars[i].charCodeAt();
      }
    }
    return true
  }

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
    function write(){
      buf[i] = Number((number / mul) & 0xFFn);
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

BufferWriter.prototype.WriteFloat = BufferWriter.prototype.WriteSingle;

module.exports = BufferWriter;
