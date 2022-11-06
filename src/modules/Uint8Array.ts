class Uint8ArrayModuleError extends Error {
  constructor(...args: any[]) { super(...args) };
}

function checkValue(val: number, name: string){
  if(val < 0) throw new Uint8ArrayModuleError(`${name} arg can't be under 0`);
}

function realloc(buf: Uint8Array, length: number){
  let newBuf = new Uint8Array(length);
  newBuf.set(buf, 0);
  return newBuf;
}

const UTF8Encoder = new TextEncoder();

export default class Uint8ArrayModule {
  buffer: Uint8Array;
  maxArrayLength: number;

  constructor(buffer: NodeJS.ArrayBufferView | number, maxArrayLength: number = 1){
    if(maxArrayLength < 1) throw new Uint8ArrayModuleError("Max Array Length can't be under 1");
    this.maxArrayLength = maxArrayLength;
    if(typeof buffer === "number") this.buffer = new Uint8Array(buffer);
    else if(typeof buffer === "string") this.buffer = UTF8Encoder.encode(buffer);
    else this.buffer = new Uint8Array(buffer as ArrayBuffer);
  }

  get length() {
    return this.buffer.byteLength;
  }

  readByte(position = 0): number {
    checkValue(position, "position");
    return this.buffer[position];
  }

  readBytes(length: number, position = 0): Uint8Array {
    checkValue(length, "length");
    checkValue(position, "position");
    return this.buffer.subarray(position, position + length);
  }

  writeByte(byte: number, position = 0){
    checkValue(position, "position");
    if(position + 1 > this.length) this.buffer = realloc(this.buffer, position + 1);
    this.buffer[position] = byte & 0xFF;
  }

  writeBytes(bytes: number[] | ArrayBuffer, position = 0){
    checkValue(position, "position");
    let byteLength = 'length' in bytes ? bytes.length : bytes.byteLength;
    if(position + byteLength > this.length) this.buffer = realloc(this.buffer, position + byteLength);
    this.buffer.set(new Uint8Array(bytes as ArrayBuffer), position);
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
      this.buffer = this.buffer.subarray(0, position);
    } else {
      let dataOffset = position + length;
      let lengthToMove = this.length - dataOffset;

      if(lengthToMove > this.maxArrayLength){
        for(; lengthToMove > lengthToMove % this.maxArrayLength; lengthToMove = lengthToMove - this.maxArrayLength, position += this.maxArrayLength, dataOffset += this.maxArrayLength){
          this.writeBytes(this.readBytes(this.maxArrayLength, dataOffset), position);
        }
      }

      this.writeBytes(this.readBytes(lengthToMove, dataOffset), position);
      this.buffer = this.buffer.subarray(0, this.length - length);
    }
  }
}