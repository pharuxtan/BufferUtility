module.exports = class StringBuf {
  static hexSlice(bytes){
    return Buffer.prototype.hexSlice.call(Buffer.from(bytes));
  }

  static utf8Slice(bytes){
    return Buffer.prototype.utf8Slice.call(Buffer.from(bytes));
  }

  static asciiSlice(bytes){
    return Buffer.prototype.asciiSlice.call(Buffer.from(bytes));
  }

  static latin1Slice(bytes){
    return Buffer.prototype.latin1Slice.call(Buffer.from(bytes));
  }

  static base64Slice(bytes){
    return Buffer.prototype.base64Slice.call(Buffer.from(bytes));
  }

  static ucs2Slice(bytes){
    return Buffer.prototype.ucs2Slice.call(Buffer.from(bytes));
  }

  static hexWrite(string){
    let buf = Buffer.allocUnsafe(Buffer.byteLength(string, "hex"));
    Buffer.prototype.hexWrite.call(buf, string);
    return buf
  }

  static utf8Write(string){
    let buf = Buffer.allocUnsafe(Buffer.byteLength(string, "utf8"));
    Buffer.prototype.utf8Write.call(buf, string);
    return buf
  }

  static asciiWrite(string){
    let buf = Buffer.allocUnsafe(Buffer.byteLength(string, "ascii"));
    Buffer.prototype.asciiWrite.call(buf, string);
    return buf
  }

  static latin1Write(string){
    let buf = Buffer.allocUnsafe(Buffer.byteLength(string, "latin1"));
    Buffer.prototype.latin1Write.call(buf, string);
    return buf
  }

  static base64Write(string){
    let buf = Buffer.allocUnsafe(Buffer.byteLength(string, "base64"));
    Buffer.prototype.base64Write.call(buf, string);
    return buf
  }

  static ucs2Write(string){
    let buf = Buffer.allocUnsafe(Buffer.byteLength(string, "ucs2"));
    Buffer.prototype.ucs2Write.call(buf, string);
    return buf
  }
}
