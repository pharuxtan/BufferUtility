import { writeFileSync, existsSync, statSync, openSync, readSync, writeSync, ftruncateSync, closeSync, fstatSync } from 'fs';

class FileSystemModuleError extends Error {
  constructor(...args: any[]) { super(...args) };
}

function checkValue(val: number, name: string){
  if(val < 0) throw new FileSystemModuleError(`${name} arg can't be under 0`);
}

export default class FileSystemModule {
  file: number = -1;
  maxArrayLength: number;

  constructor(file: string | number, maxArrayLength: number = 1){
    if(maxArrayLength < 1) throw new FileSystemModuleError("Max Array Length can't be under 1");
    this.maxArrayLength = maxArrayLength;
    if(typeof file === 'string'){
      if(existsSync(file)){
        if(statSync(file).isDirectory())
          throw new FileSystemModuleError('The file you\'re trying to open is a directory.');
      } else {
        writeFileSync(file, new Uint8Array(0));
      }

      this.file = openSync(file, 'rs+');
    } else if(typeof file === 'number') {
      if(file < 0)
        throw new FileSystemModuleError('File descriptor can\'t be under 0.');

      this.file = file;
    } else {
      throw new FileSystemModuleError('file arg must be a file path or a file descriptor');
    }
  }

  get buffer(){
    return this.file;
  }

  close(){
    closeSync(this.file);
    this.file = -1;
  }

  get length(): number {
    if(this.file === -1) return -1;
    return fstatSync(this.file).size;
  }

  readByte(position = 0): number {
    checkValue(position, "position");

    let buf = new Uint8Array(1);
    readSync(this.file, buf, 0, 1, position);
    return buf[0];
  }

  readBytes(length: number, position = 0): Uint8Array {
    checkValue(length, "length");
    checkValue(position, "position");

    let buf = new Uint8Array(length);
    readSync(this.file, buf, 0, length, position);
    return buf;
  }

  writeByte(byte: number, position = 0) {
    checkValue(position, "position");

    let buf = new Uint8Array([ byte ]);
    writeSync(this.file, buf, 0, 1, position);
  }

  writeBytes(bytes: number[] | ArrayBuffer, position = 0) {
    checkValue(position, "position");

    let buf = new Uint8Array(bytes);
    writeSync(this.file, buf, 0, buf.length, position);
  }

  rightShift(length: number, position = 0, logical = true) {
    checkValue(length, "length");
    checkValue(position, "position");

    let fillValue = logical ? 0x00 :
                    /* arithmetic */ (this.readByte(position) >>> 7) ? 0xFF : 0x00;

    let lengthToMove = this.length - position;
    if(lengthToMove > this.maxArrayLength){
      let dataOffset = this.length - this.maxArrayLength;
      for(; lengthToMove > lengthToMove % this.maxArrayLength; lengthToMove = lengthToMove - this.maxArrayLength, dataOffset -= this.maxArrayLength){
        this.writeBytes(this.readBytes(this.maxArrayLength, dataOffset), dataOffset + length);
      }
    }

    this.writeBytes(this.readBytes(lengthToMove, position), position + length);

    if(length > this.maxArrayLength){
      for(; length > length % this.maxArrayLength; length = length - this.maxArrayLength, position += this.maxArrayLength){
        this.writeBytes(Array.from({ length: this.maxArrayLength }).fill(fillValue) as number[], position);
      }
    }

    this.writeBytes(Array.from({ length }).fill(fillValue) as number[], position);
  }

  leftShift(length: number, position = 0) {
    checkValue(length, "length");
    checkValue(position, "position");

    if(position + length >= this.length){
      ftruncateSync(this.file, position);
    } else {
      let dataOffset = position + length;
      let lengthToMove = this.length - dataOffset;

      if(lengthToMove > this.maxArrayLength){
        for(; lengthToMove > lengthToMove % this.maxArrayLength; lengthToMove = lengthToMove - this.maxArrayLength, position += this.maxArrayLength, dataOffset += this.maxArrayLength){
          this.writeBytes(this.readBytes(this.maxArrayLength, dataOffset), position);
        }
      }

      this.writeBytes(this.readBytes(lengthToMove, dataOffset), position);
      ftruncateSync(this.file, this.length - length);
    }
  }
}