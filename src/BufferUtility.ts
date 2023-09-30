import Uint8ArrayModule from "./modules/Uint8Array.js";
import * as buffer from 'buffer';

declare global {
  var Bun: any;
}

class BufferUtilityError extends Error {
  constructor(...args: any[]) { super(...args) }
}

const nodeInspectSymbol = Symbol.for('nodejs.util.inspect.custom');
const bufferUtilityChild = Symbol.for("bufferutility.child");

export interface BufferUtilityOpts {
  module?: any,
  maxArrayLength?: number,
  returnAsBigIntIfOverflow?: boolean,
  returnAsBigInt?: boolean,
  offset?: number,
  length?: number
};

export type integer = number | bigint;

function returnNumber(num: bigint, returnAsBigInt: boolean, returnAsBigIntIfOverflow: boolean): integer {
  if(returnAsBigInt) return num;
  if(returnAsBigIntIfOverflow) return num > Number.MAX_SAFE_INTEGER || num < Number.MIN_SAFE_INTEGER ? num : Number(num);
  return Number(num);
}

function uncomplement(val: bigint, bitwidth: bigint) {
  var isnegative = (val & (1n << (bitwidth - 1n)));
  var boundary = (1n << bitwidth);
  var minval = -boundary;
  var mask = boundary - 1n;
  return isnegative ? minval + (val & mask) : val;
}

export const BufferUtilityClass = class BufferUtility {
  module: any;
  maxArrayLength: any;
  cOffset: number;
  cLength?: number;
  returnAsBigInt: boolean;
  returnAsBigIntIfOverflow: boolean;
  parent?: BufferUtility;

  position: number = 0;

  constructor(data?: any, opts: BufferUtilityOpts = {}){
    this.maxArrayLength = opts.maxArrayLength ?? buffer.kMaxLength;
    if(data !== bufferUtilityChild){
      opts.module ?? (opts.module = Uint8ArrayModule);
      this.module = new opts.module(data, this.maxArrayLength);
    } else {
      this.module = opts.module;
    }
    this.cOffset = opts.offset ?? 0;
    this.cLength = opts.length;
    this.returnAsBigInt = opts.returnAsBigInt ?? false;
    this.returnAsBigIntIfOverflow = opts.returnAsBigIntIfOverflow ?? true;
  }

  // Read/Write Byte
  readByte(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position >= this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position}, buf length is ${this.length}.`);
    thisPosition && (this.position += 1);

    // Code
    let num = this.module.readByte(this.cOffset + position);
    return this.returnAsBigInt ? BigInt(num) : num;
  }

  writeByte(byte: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    thisPosition && (this.position += 1);

    // Code
    this.module.writeByte(Number(byte) & 0xFF, this.cOffset + position);
    return 1;
  }

  writeSByte(byte: integer, position?: number): number {
    return this.writeByte(byte, position);
  }

  // Read/Write Bytes
  readBytes(length: number, position?: number): integer[] {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(length < 0) throw new BufferUtilityError(`Length argument can't be under 0. Got ${length}.`);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + length > this.length) throw new BufferUtilityError(`You're trying to read bytes from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += length);

    // Code
    let buffer = this.module.readBytes(length, this.cOffset + position);
    if(this.returnAsBigInt) return [...buffer].map(n => BigInt(n));
    else return [...buffer];
  }

  writeBytes(bytes: integer[] | Uint8Array, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    thisPosition && (this.position += bytes.length);

    // Code
    this.module.writeBytes(bytes.map(b => Number(b)), this.cOffset + position);
    return bytes.length;
  }

  // Right/Left shift
  rightShift(length: number, position?: number, logical = true){
    // Checks
    position == undefined && (position = this.position);
    if(length < 0) throw new BufferUtilityError(`Length argument can't be under 0. Got ${length}.`);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position >= this.length) throw new BufferUtilityError(`You're trying to right shift from an out of bound position. Got position ${position}, buf length is ${this.length}.`);

    // Code
    this.module.rightShift(length, this.cOffset + position, logical);
    return this;
  }

  leftShift(length: number, position?: number){
    // Checks
    position == undefined && (position = this.position);
    if(length < 0) throw new BufferUtilityError(`Length argument can't be under 0. Got ${length}.`);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position >= this.length) throw new BufferUtilityError(`You're trying to left shift from an out of bound position. Got position ${position}, buf length is ${this.length}.`);
    if(position + length >= this.length) throw new BufferUtilityError(`You're trying to left shift more bytes than you could possibly shift. Got length of ${length}, actual possible shift length is ${this.length - position - this.cOffset}`);

    // Code
    this.module.leftShift(length, this.cOffset + position);
    return this;
  }

  // Read/Write Unsigned 8 Bits Integer

  readUInt8(position?: number): integer {
    return this.readByte(position);
  }

  writeUInt8(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < 0n || value > 0xFFn) throw new BufferUtilityError(`Unsigned 8-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFn}.`);

    // Code
    return this.writeByte(value, position);
  }

  // Read/Write Signed 8 Bits Integer

  readInt8(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt8(position)), 8n);
    return this.returnAsBigInt ? val : Number(val);
  }

  writeInt8(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x80n || value > 0x7Fn) throw new BufferUtilityError(`Signed 8-bit value is out of range: ${value}. It must be a value between ${-0x80n} and ${0x7Fn}.`);

    // Code
    return this.writeByte(value, position);
  }

  // Read Unsigned Integer Little Endian

  readUIntLE(byteLength: number, position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(byteLength < 1) throw new BufferUtilityError(`byteLength argument can't be under 1. Got ${byteLength}.`);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + byteLength > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += byteLength);

    // Code
    let val = BigInt(this.readByte(position));
    let mul = 1n;
    let i = 0;

    while(++i < byteLength && (mul *= 0x100n)){
      val += BigInt(this.readByte(position + i)) * mul;
    }

    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readUInt16LE(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 2 > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 2);

    // Code
    const val = BigInt(this.readByte(position    ))       |
                BigInt(this.readByte(position + 1)) << 8n ;
    
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readUInt32LE(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 4 > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 4);

    // Code
    const val = BigInt(this.readByte(position    ))        |
                BigInt(this.readByte(position + 1)) << 8n  |
                BigInt(this.readByte(position + 2)) << 16n |
                BigInt(this.readByte(position + 3)) << 24n ;
    
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readUInt64LE(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 8 > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 8);

    // Code
    const val = BigInt(this.readByte(position    ))        |
                BigInt(this.readByte(position + 1)) << 8n  |
                BigInt(this.readByte(position + 2)) << 16n |
                BigInt(this.readByte(position + 3)) << 24n |
                BigInt(this.readByte(position + 4)) << 32n |
                BigInt(this.readByte(position + 5)) << 40n |
                BigInt(this.readByte(position + 6)) << 48n |
                BigInt(this.readByte(position + 7)) << 56n ;
    
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readUInt128LE(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 16 > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 16);

    // Code
    const val = BigInt(this.readByte(position     ))         |
                BigInt(this.readByte(position + 1 )) << 8n   |
                BigInt(this.readByte(position + 2 )) << 16n  |
                BigInt(this.readByte(position + 3 )) << 24n  |
                BigInt(this.readByte(position + 4 )) << 32n  |
                BigInt(this.readByte(position + 5 )) << 40n  |
                BigInt(this.readByte(position + 6 )) << 48n  |
                BigInt(this.readByte(position + 7 )) << 56n  |
                BigInt(this.readByte(position + 8 )) << 64n  |
                BigInt(this.readByte(position + 9 )) << 72n  |
                BigInt(this.readByte(position + 10)) << 80n  |
                BigInt(this.readByte(position + 11)) << 88n  |
                BigInt(this.readByte(position + 12)) << 96n  |
                BigInt(this.readByte(position + 13)) << 104n |
                BigInt(this.readByte(position + 14)) << 112n |
                BigInt(this.readByte(position + 15)) << 120n ;
    
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  // Read Signed Integer Little Endian

  readIntLE(byteLength: number, position?: number): integer {
    const val = uncomplement(BigInt(this.readUIntLE(byteLength, position)), BigInt(byteLength * 8));
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readInt16LE(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt16LE(position)), 16n);
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readInt32LE(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt32LE(position)), 32n);
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readInt64LE(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt64LE(position)), 64n);
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readInt128LE(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt128LE(position)), 128n);
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  // Read Unsigned Integer Big Endian

  readUIntBE(byteLength: number, position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(byteLength < 1) throw new BufferUtilityError(`byteLength argument can't be under 1. Got ${byteLength}.`);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + byteLength > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += byteLength);

    // Code
    let val = BigInt(this.readByte(position + --byteLength));
    let mul = 1n;

    while(byteLength > 0 && (mul *= 0x100n)){
      val += BigInt(this.readByte(position + --byteLength)) * mul;
    }

    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readUInt16BE(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 2 > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 2);

    // Code
    const val = BigInt(this.readByte(position    )) << 8n |
                BigInt(this.readByte(position + 1))       ;
    
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readUInt32BE(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 4 > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 4);

    // Code
    const val = BigInt(this.readByte(position    )) << 24n |
                BigInt(this.readByte(position + 1)) << 16n |
                BigInt(this.readByte(position + 2)) << 8n  |
                BigInt(this.readByte(position + 3))        ;
    
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readUInt64BE(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 8 > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 8);

    // Code
    const val = BigInt(this.readByte(position    )) << 56n |
                BigInt(this.readByte(position + 1)) << 48n |
                BigInt(this.readByte(position + 2)) << 40n |
                BigInt(this.readByte(position + 3)) << 32n |
                BigInt(this.readByte(position + 4)) << 24n |
                BigInt(this.readByte(position + 5)) << 16n |
                BigInt(this.readByte(position + 6)) << 8n  |
                BigInt(this.readByte(position + 7))        ;
    
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readUInt128BE(position?: number): integer {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 16 > this.length) throw new BufferUtilityError(`You're trying to read from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 16);

    // Code
    const val = BigInt(this.readByte(position     )) << 120n |
                BigInt(this.readByte(position + 1 )) << 112n |
                BigInt(this.readByte(position + 2 )) << 104n |
                BigInt(this.readByte(position + 3 )) << 96n  |
                BigInt(this.readByte(position + 4 )) << 88n  |
                BigInt(this.readByte(position + 5 )) << 80n  |
                BigInt(this.readByte(position + 6 )) << 72n  |
                BigInt(this.readByte(position + 7 )) << 64n  |
                BigInt(this.readByte(position + 8 )) << 56n  |
                BigInt(this.readByte(position + 9 )) << 48n  |
                BigInt(this.readByte(position + 10)) << 40n  |
                BigInt(this.readByte(position + 11)) << 32n  |
                BigInt(this.readByte(position + 12)) << 24n  |
                BigInt(this.readByte(position + 13)) << 16n  |
                BigInt(this.readByte(position + 14)) << 8n   |
                BigInt(this.readByte(position + 15))         ;
    
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  // Read Signed Integer Big Endian

  readIntBE(byteLength: number, position?: number): integer {
    const val = uncomplement(BigInt(this.readUIntBE(byteLength, position)), BigInt(byteLength * 8));
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readInt16BE(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt16BE(position)), 16n);
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readInt32BE(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt32BE(position)), 32n);
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readInt64BE(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt64BE(position)), 64n);
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  readInt128BE(position?: number): integer {
    const val = uncomplement(BigInt(this.readUInt128BE(position)), 128n);
    return returnNumber(val, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  // Write Unsigned Integer Little Endian

  writeUIntLE(value: integer, byteLength: number, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(byteLength < 1) throw new BufferUtilityError(`byteLength argument can't be under 1. Got ${byteLength}.`);
    value = BigInt(value);
    let maxValue = 2n**(BigInt(byteLength)*8n)-1n;
    if(value < 0n || value > maxValue) throw new BufferUtilityError(`Unsigned value is out of range: ${value}. It must be a value between 0 and ${maxValue}.`);
    thisPosition && (this.position += byteLength);

    // Code
    let mul = 1n;
    let i = 0;
    this.writeByte(value & 0xFFn, position);
    while(++i < byteLength && (mul *= 0x100n)){
      this.writeByte((value / mul) & 0xFFn, position + i);
    }

    return byteLength;
  }

  writeUInt16LE(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    value = BigInt(value);
    if(value < 0n || value > 0xFFFFn) throw new BufferUtilityError(`Unsigned 16-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFFFn}.`);
    thisPosition && (this.position += 2);

    // Code
    this.writeByte( value        & 0xFFn, position    );
    this.writeByte((value >> 8n) & 0xFFn, position + 1);

    return 2;
  }

  writeUInt32LE(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    value = BigInt(value);
    if(value < 0n || value > 0xFFFFFFFFn) throw new BufferUtilityError(`Unsigned 32-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFFFFFFFn}.`);
    thisPosition && (this.position += 4);

    // Code
    this.writeByte( value         & 0xFFn, position    );
    this.writeByte((value >> 8n ) & 0xFFn, position + 1);
    this.writeByte((value >> 16n) & 0xFFn, position + 2);
    this.writeByte((value >> 24n) & 0xFFn, position + 3);

    return 4;
  }

  writeUInt64LE(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    value = BigInt(value);
    if(value < 0n || value > 0xFFFFFFFFFFFFFFFFn) throw new BufferUtilityError(`Unsigned 64-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFFFFFFFFFFFFFFFn}.`);
    thisPosition && (this.position += 8);

    // Code
    this.writeByte( value         & 0xFFn, position    );
    this.writeByte((value >> 8n ) & 0xFFn, position + 1);
    this.writeByte((value >> 16n) & 0xFFn, position + 2);
    this.writeByte((value >> 24n) & 0xFFn, position + 3);
    this.writeByte((value >> 32n) & 0xFFn, position + 4);
    this.writeByte((value >> 40n) & 0xFFn, position + 5);
    this.writeByte((value >> 48n) & 0xFFn, position + 6);
    this.writeByte((value >> 56n) & 0xFFn, position + 7);

    return 8;
  }

  writeUInt128LE(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    value = BigInt(value);
    if(value < 0n || value > 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn) throw new BufferUtilityError(`Unsigned 128-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn}.`);
    thisPosition && (this.position += 16);

    // Code
    this.writeByte( value          & 0xFFn, position     );
    this.writeByte((value >> 8n  ) & 0xFFn, position + 1 );
    this.writeByte((value >> 16n ) & 0xFFn, position + 2 );
    this.writeByte((value >> 24n ) & 0xFFn, position + 3 );
    this.writeByte((value >> 32n ) & 0xFFn, position + 4 );
    this.writeByte((value >> 40n ) & 0xFFn, position + 5 );
    this.writeByte((value >> 48n ) & 0xFFn, position + 6 );
    this.writeByte((value >> 56n ) & 0xFFn, position + 7 );
    this.writeByte((value >> 64n ) & 0xFFn, position + 8 );
    this.writeByte((value >> 72n ) & 0xFFn, position + 9 );
    this.writeByte((value >> 80n ) & 0xFFn, position + 10);
    this.writeByte((value >> 88n ) & 0xFFn, position + 11);
    this.writeByte((value >> 96n ) & 0xFFn, position + 12);
    this.writeByte((value >> 104n) & 0xFFn, position + 13);
    this.writeByte((value >> 112n) & 0xFFn, position + 14);
    this.writeByte((value >> 120n) & 0xFFn, position + 15);

    return 16;
  }

  // Write Signed Integer Little Endian

  writeIntLE(value: integer, byteLength: number, position?: number): number {
    // Checks
    value = BigInt(value);
    let maxValue = 2n**(BigInt(byteLength)*8n)-1n;
    if(value < maxValue/-2n-1n || value > maxValue/2n) throw new BufferUtilityError(`Signed value is out of range: ${value}. It must be a value between ${maxValue/-2n-1n} and ${maxValue/2n}.`);

    // Code
    return this.writeUIntLE(value & maxValue, byteLength, position);
  }

  writeInt16LE(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x8000n || value > 0x7FFFn) throw new BufferUtilityError(`Signed 16-bit value is out of range: ${value}. It must be a value between ${-0x8000n} and ${0x7FFFn}.`);

    // Code
    return this.writeUInt16LE(value & 0xFFFFn, position);
  }

  writeInt32LE(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x80000000n || value > 0x7FFFFFFFn) throw new BufferUtilityError(`Signed 32-bit value is out of range: ${value}. It must be a value between ${-0x80000000n} and ${0x7FFFFFFFn}.`);

    // Code
    return this.writeUInt32LE(value & 0xFFFFFFFFn, position);
  }

  writeInt64LE(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x8000000000000000n || value > 0x7FFFFFFFFFFFFFFFn) throw new BufferUtilityError(`Signed 64-bit value is out of range: ${value}. It must be a value between ${-0x8000000000000000n} and ${0x7FFFFFFFFFFFFFFFn}.`);

    // Code
    return this.writeUInt64LE(value & 0xFFFFFFFFFFFFFFFFn, position);
  }

  writeInt128LE(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x80000000000000000000000000000000n || value > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn) throw new BufferUtilityError(`Signed 128-bit value is out of range: ${value}. It must be a value between ${-0x80000000000000000000000000000000n} and ${0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn}.`);

    // Code
    return this.writeUInt128LE(value & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn, position);
  }

  // Write Unsigned Integer Big Endian

  writeUIntBE(value: integer, byteLength: number, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position <   0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(byteLength < 1) throw new BufferUtilityError(`byteLength argument can't be under 1. Got ${byteLength}.`);
    value = BigInt(value);
    let maxValue = 2n**(BigInt(byteLength)*8n)-1n;
    if(value < 0n || value > maxValue) throw new BufferUtilityError(`Unsigned value is out of range: ${value}. It must be a value between 0 and ${maxValue}.`);
    thisPosition && (this.position += byteLength);

    // Code
    let i = byteLength - 1;
    let mul = 1n;
    this.writeByte(value & 0xFFn, position + i);
    while(--i >= 0 && (mul *= 0x100n)){
      this.writeByte((value / mul) & 0xFFn, position + i);
    }

    return byteLength;
  }

  writeUInt16BE(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    value = BigInt(value);
    if(value < 0n || value > 0xFFFFn) throw new BufferUtilityError(`Unsigned 16-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFFFn}.`);
    thisPosition && (this.position += 2);

    // Code
    this.writeByte((value >> 8n) & 0xFFn, position    );
    this.writeByte( value        & 0xFFn, position + 1);

    return 2;
  }

  writeUInt32BE(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    value = BigInt(value);
    if(value < 0n || value > 0xFFFFFFFFn) throw new BufferUtilityError(`Unsigned 32-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFFFFFFFn}.`);
    thisPosition && (this.position += 4);

    // Code
    this.writeByte((value >> 24n) & 0xFFn, position    );
    this.writeByte((value >> 16n) & 0xFFn, position + 1);
    this.writeByte((value >> 8n ) & 0xFFn, position + 2);
    this.writeByte( value         & 0xFFn, position + 3);

    return 4;
  }

  writeUInt64BE(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    value = BigInt(value);
    if(value < 0n || value > 0xFFFFFFFFFFFFFFFFn) throw new BufferUtilityError(`Unsigned 64-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFFFFFFFFFFFFFFFn}.`);
    thisPosition && (this.position += 8);

    // Code
    this.writeByte((value >> 56n) & 0xFFn, position    );
    this.writeByte((value >> 48n) & 0xFFn, position + 1);
    this.writeByte((value >> 40n) & 0xFFn, position + 2);
    this.writeByte((value >> 32n) & 0xFFn, position + 3);
    this.writeByte((value >> 24n) & 0xFFn, position + 4);
    this.writeByte((value >> 16n) & 0xFFn, position + 5);
    this.writeByte((value >> 8n ) & 0xFFn, position + 6);
    this.writeByte( value         & 0xFFn, position + 7);

    return 8;
  }

  writeUInt128BE(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    value = BigInt(value);
    if(value < 0n || value > 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn) throw new BufferUtilityError(`Unsigned 128-bit value is out of range: ${value}. It must be a value between 0 and ${0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn}.`);
    thisPosition && (this.position += 16);

    // Code
    this.writeByte((value >> 120n) & 0xFFn, position     );
    this.writeByte((value >> 112n) & 0xFFn, position + 1 );
    this.writeByte((value >> 104n) & 0xFFn, position + 2 );
    this.writeByte((value >> 96n ) & 0xFFn, position + 3 );
    this.writeByte((value >> 88n ) & 0xFFn, position + 4 );
    this.writeByte((value >> 80n ) & 0xFFn, position + 5 );
    this.writeByte((value >> 72n ) & 0xFFn, position + 6 );
    this.writeByte((value >> 64n ) & 0xFFn, position + 7 );
    this.writeByte((value >> 56n ) & 0xFFn, position + 8 );
    this.writeByte((value >> 48n ) & 0xFFn, position + 9 );
    this.writeByte((value >> 40n ) & 0xFFn, position + 10);
    this.writeByte((value >> 32n ) & 0xFFn, position + 11);
    this.writeByte((value >> 24n ) & 0xFFn, position + 12);
    this.writeByte((value >> 16n ) & 0xFFn, position + 13);
    this.writeByte((value >> 8n  ) & 0xFFn, position + 14);
    this.writeByte( value          & 0xFFn, position + 15);

    return 16;
  }

  // Write Signed Integer Big Endian

  writeIntBE(value: integer, byteLength: number, position?: number): number {
    // Checks
    value = BigInt(value);
    let maxValue = 2n**(BigInt(byteLength)*8n)-1n;
    if(value < maxValue/-2n-1n || value > maxValue/2n) throw new BufferUtilityError(`Signed value is out of range: ${value}. It must be a value between ${maxValue/-2n-1n} and ${maxValue/2n}.`);

    // Code
    return this.writeUIntBE(value & maxValue, byteLength, position);
  }

  writeInt16BE(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x8000n || value > 0x7FFFn) throw new BufferUtilityError(`Signed 16-bit value is out of range: ${value}. It must be a value between ${-0x8000n} and ${0x7FFFn}.`);

    // Code
    return this.writeUInt16BE(value & 0xFFFFn, position);
  }

  writeInt32BE(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x80000000n || value > 0x7FFFFFFFn) throw new BufferUtilityError(`Signed 32-bit value is out of range: ${value}. It must be a value between ${-0x80000000n} and ${0x7FFFFFFFn}.`);

    // Code
    return this.writeUInt32BE(value & 0xFFFFFFFFn, position);
  }

  writeInt64BE(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x8000000000000000n || value > 0x7FFFFFFFFFFFFFFFn) throw new BufferUtilityError(`Signed 64-bit value is out of range: ${value}. It must be a value between ${-0x8000000000000000n} and ${0x7FFFFFFFFFFFFFFFn}.`);

    // Code
    return this.writeUInt64BE(value & 0xFFFFFFFFFFFFFFFFn, position);
  }

  writeInt128BE(value: integer, position?: number): number {
    // Checks
    value = BigInt(value);
    if(value < -0x80000000000000000000000000000000n || value > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn) throw new BufferUtilityError(`Signed 128-bit value is out of range: ${value}. It must be a value between ${-0x80000000000000000000000000000000n} and ${0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn}.`);

    // Code
    return this.writeUInt128BE(value & 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn, position);
  }

  // Read/Write Float Little Endian
  readFloatLE(position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 4 > this.length) throw new BufferUtilityError(`You're trying to read a float from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 4);

    // Code
    return new Float32Array(this.module.readBytes(4, this.cOffset + position).buffer)[0];
  }

  writeFloatLE(value: number, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    thisPosition && (this.position += 4);

    // Code
    let floatArr = new Uint8Array(new Float32Array([ value ]).buffer);
    this.module.writeBytes(floatArr, this.cOffset + position);
    return 4;
  }

  // Read/Write Float Big Endian
  readFloatBE(position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 4 > this.length) throw new BufferUtilityError(`You're trying to read a float from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 4);

    // Code
    return new Float32Array(this.module.readBytes(4, this.cOffset + position).reverse().buffer)[0];
  }

  writeFloatBE(value: number, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    thisPosition && (this.position += 4);

    // Code
    let floatArr = new Uint8Array(new Float32Array([ value ]).buffer).reverse();
    this.module.writeBytes(floatArr, this.cOffset + position);
    return 4;
  }

  // Read/Write Double Little Endian
  readDoubleLE(position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 8 > this.length) throw new BufferUtilityError(`You're trying to read a double from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 8);

    // Code
    return new Float64Array(this.module.readBytes(8, this.cOffset + position).buffer)[0];
  }

  writeDoubleLE(value: number, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    thisPosition && (this.position += 8);

    // Code
    let floatArr = new Uint8Array(new Float64Array([ value ]).buffer);
    this.module.writeBytes(floatArr, this.cOffset + position);
    return 8;
  }

  // Read/Write Double Big Endian
  readDoubleBE(position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 8 > this.length) throw new BufferUtilityError(`You're trying to read a double from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 8);

    // Code
    return new Float64Array(this.module.readBytes(8, this.cOffset + position).reverse().buffer)[0];
  }

  writeDoubleBE(value: number, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    thisPosition && (this.position += 8);

    // Code
    let floatArr = new Uint8Array(new Float64Array([ value ]).buffer).reverse();
    this.module.writeBytes(floatArr, this.cOffset + position);
    return 8;
  }

  // Read/Write Boolean

  readBoolean(position?: number): boolean {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + 1 > this.length) throw new BufferUtilityError(`You're trying to read a boolean from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += 1);

    // Code
    return this.readByte(position) !== 0;
  }

  writeBoolean(value: boolean, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    thisPosition && (this.position += 1);

    // Code
    this.writeByte(value ? 1 : 0, position);
    return 1;
  }

  // Read/Write String
  readString(length: number, position?: number, encoding = "utf8"): string {
    // Checks
    if(!buffer.Buffer.isEncoding(encoding)) throw new BufferUtilityError(`"${encoding}" is not a supported encoding.`);
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(length < 0) throw new BufferUtilityError(`Length argument can't be under 0. Got ${length}.`);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position + length > this.length) throw new BufferUtilityError(`You're trying to read a string from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += length);

    // Code
    return buffer.Buffer.prototype.toString.call(buffer.Buffer.from(this.readBytes(length, position)), encoding, 0, length);
  }

  writeString(string: string, position?: number, encoding = "utf8"): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(!buffer.Buffer.isEncoding(encoding)) throw new BufferUtilityError(`"${encoding}" is not a supported encoding.`);
    const stringByteLength = buffer.Buffer.byteLength(string, encoding);
    thisPosition && (this.position += stringByteLength);

    // Code
    let buf = buffer.Buffer.allocUnsafe(stringByteLength);
    buffer.Buffer.prototype.write.call(buf, string, 0, stringByteLength, encoding);
    this.module.writeBytes(buf, this.cOffset + position);
    return stringByteLength;
  }

  // Read/Write Unsigned LEB128

  readULEB128(position?: number){
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position > this.length) throw new BufferUtilityError(`You're trying to read a leb128 from an out of bound position. Got position ${position}, buf length is ${this.length}.`);

    // Code
    let shift = 0n;
    let result = 0n;

    while(true){
      const byte = BigInt(this.readByte(position++));
      result |= (byte & 0x7Fn) << shift;
      if((byte & 0x80n) === 0n) break;
      shift += 7n;
    }

    thisPosition && (this.position = position);

    return returnNumber(result, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  writeULEB128(value: integer, position?: number): number {
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(value < 0) throw new BufferUtilityError(`Unsigned value can't be under 0. Got ${value}.`);

    // Code
    value = BigInt(value);
    let count = 0;
    do {
      let byte = value & 0x7Fn;
      value >>= 7n;
      count++;
      if(value !== 0n) byte |= 0x80n;
      this.writeByte(byte, position++);
    } while(value !== 0n);

    thisPosition && (this.position += count);

    return count;
  }

  // Read/Write Signed LEB128

  readSLEB128(position?: number){
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(position > this.length) throw new BufferUtilityError(`You're trying to read a leb128 from an out of bound position. Got position ${position}, buf length is ${this.length}.`);

    // Code
    let shift = 0n;
    let result = 0n;
    let byte;

    while(true){
      byte = BigInt(this.readByte(position++));
      result |= (byte & 0x7Fn) << shift;
      shift += 7n;
      if((byte & 0x80n) === 0n) break;
    }

    if((byte & 0x40n) !== 0n){
      result |= -(1n << shift);
    }

    thisPosition && (this.position = position);

    return returnNumber(result, this.returnAsBigInt, this.returnAsBigIntIfOverflow);
  }

  writeSLEB128(value: integer, position?: number){
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);

    // Code
    value = BigInt(value);
    let count = 0;
    let more;
    do {
      let byte = value & 0x7Fn;
      value >>= 7n;
      more = !((((value === 0n ) && ((byte & 0x40n) === 0n)) ||
                ((value === -1n) && ((byte & 0x40n) !== 0n))));
      count++;
      if(more) byte |= 0x80n;
      this.writeByte(byte, position++);
    } while(more);

    thisPosition && (this.position += count);

    return count;
  }

  // Split buffer funcs
  subarray(start: number, end: number){
    // Checks
    if(start > end) throw new BufferUtilityError(`Start (${start}) position is higher than end (${end}) position.`)
    if(start >= this.length) throw new BufferUtilityError(`Start (${start}) position overflow actual buffer length of ${this.length}`);
    if(end > this.length) throw new BufferUtilityError(`End (${end}) position overflow actual buffer length of ${this.length}`);

    // Code
    const buf: BufferUtility = constructChildBF({
      module: this.module,
      maxArrayLength: this.maxArrayLength,
      returnAsBigInt: this.returnAsBigInt,
      offset: this.cOffset + start,
      length: end - start,
    });
    buf.parent = this;
    return buf;
  }

  slice(length: number, position?: number){
    // Checks
    const thisPosition = position != undefined ? false : (position = this.position, true);
    if(position < 0) throw new BufferUtilityError(`position argument can't be under 0. Got ${position}.`);
    if(length < 0) throw new BufferUtilityError(`length argument can't be under 0. Got ${length}.`);
    if(position + length > this.length) throw new BufferUtilityError(`You're trying to slice from an out of bound position. Got position ${position > this.length ? position : this.length}, buf length is ${this.length}.`);
    thisPosition && (this.position += length);

    // Code
    return this.subarray(position, position + length);
  }

  // Miscs
  toString(encoding = "utf8"): string {
    // Checks
    if(!buffer.Buffer.isEncoding(encoding)) throw new BufferUtilityError(`"${encoding}" is not a supported encoding.`);

    // Code
    return buffer.Buffer.prototype.toString.call(this.toBuffer(), encoding);
  }

  toUint8Array(): Uint8Array {
    // Checks
    if(this.length > this.maxArrayLength) throw new BufferUtilityError(`The buffer size is greater than possible ArrayBuffer length, please use toUint8ArrayList instead.`);

    // Code
    return this.module.readBytes(this.length, this.cOffset);
  }

  toUint8ArrayList(): Uint8Array[] {
    let bufs: Uint8Array[] = [];
    let length = this.length;
    let dataOffset = this.cOffset;
    for(; length > this.length % this.maxArrayLength; length -= this.maxArrayLength, dataOffset += this.maxArrayLength){
      bufs.push(this.module.readBytes(this.maxArrayLength, dataOffset));
    }
    bufs.push(this.module.readBytes(length, dataOffset));
    return bufs;
  }

  toBuffer(): buffer.Buffer {
    return buffer.Buffer.from(this.toUint8Array());
  }

  toBufferList(): buffer.Buffer[] {
    // Checks
    if(this.length > this.maxArrayLength) throw new BufferUtilityError(`The buffer size is greater than possible ArrayBuffer length, please use toBufferList instead.`);

    // Code
    return this.toUint8ArrayList().map(uint8Array => buffer.Buffer.from(uint8Array));
  }

  get length(){
    if(this.cLength) return this.cLength;
    return this.module.length;
  }

  get buffer(){
    return this.module.buffer;
  }

  get [Symbol.toStringTag]() { return "BufferUtility" }

  [Symbol.toPrimitive](hint: string){
    if(hint == "number") return this.length;
    return this[nodeInspectSymbol]();
  }

  * [Symbol.iterator](): Generator<number, void, boolean> {
    for(let i = 0; i < this.length; i++){
      yield this.module.readByte(i);
    }
  }

  async* [Symbol.asyncIterator](): AsyncGenerator<number, void, boolean> {
    for(let i = 0; i < this.length; i++){
      yield this.module.readByte(i);
    }
  }

  [nodeInspectSymbol](){
    if(this.length === 0) return `<BufferUtility>`;
    let len = this.length > 50 ? 50 : this.length;
    let bytes: string[] = [...this.module.readBytes(len, this.cOffset)].map(n => n.toString(16).padStart(2, "0"));
    return `<BufferUtility ${bytes.join(' ') + (this.length > 50 ? ` ... ${this.length - 50} more bytes` : '')}>`
  }

  // Default Endianness

  defaultEndian = "LE";

  changeDefaultEndian(endian = "LE"){
    endian = endian.toUpperCase();
    if(endian == "L" || endian == "B") endian += "E";
    if(endian != "LE" && endian != "BE") throw new BufferUtilityError("Endian argument must be 'LE' or 'BE'");

    this.defaultEndian = endian;

    let functions = [
      "readInt", "readInt16", "readInt32", "readInt64", "readInt128",
      "readUInt", "readUInt16", "readUInt32", "readUInt64", "readUInt128",
      "readFloat", "readDouble",
      "writeInt", "writeInt16", "writeInt32", "writeInt64", "writeInt128",
      "writeUInt", "writeUInt16", "writeUInt32", "writeUInt64", "writeUInt128",
      "writeFloat", "writeDouble"
    ];

    for(let func of functions){
      (this as any)[func] = (this as any)[func+endian];
    }
  }

  readUInt = this.readUIntLE;
  readUInt16 = this.readUInt16LE;
  readUInt32 = this.readUInt32LE;
  readUInt64 = this.readUInt64LE;
  readUInt128 = this.readUInt128LE;

  readInt = this.readIntLE;
  readInt16 = this.readInt16LE;
  readInt32 = this.readInt32LE;
  readInt64 = this.readInt64LE;
  readInt128 = this.readInt128LE;

  readFloat = this.readFloatLE;
  readDouble = this.readDoubleLE;

  writeUInt = this.writeUIntLE;
  writeUInt16 = this.writeUInt16LE;
  writeUInt32 = this.writeUInt32LE;
  writeUInt64 = this.writeUInt64LE;
  writeUInt128 = this.writeUInt128LE;

  writeInt = this.writeIntLE;
  writeInt16 = this.writeInt16LE;
  writeInt32 = this.writeInt32LE;
  writeInt64 = this.writeInt64LE;
  writeInt128 = this.writeInt128LE;

  writeFloat = this.writeFloatLE;
  writeDouble = this.writeDoubleLE;
}

function constructChildBF(opts: BufferUtilityOpts): any {
  return BufferUtility(bufferUtilityChild, opts);
}

function BufferUtility(data?: any, opts?: BufferUtilityOpts): typeof BufferUtilityClass {
  const buf = new BufferUtilityClass(data, opts);
  let isParentSet = false;
  const proxy = new Proxy(buf, {
    get(target: any, prop: any): any {
      if(prop === "toJSON" && process.title === "bun"){ // Bun.js custom inspect hack
        Bun.write(Bun.stdout, target[nodeInspectSymbol]() + " ");
        return () => {};
      }
      if(prop.constructor && prop.constructor.name === "Symbol") return target[prop];
      if(!isNaN(Number(prop))) return target.readByte(Number(prop));
      return target[prop];
    },
    set(target: any, prop: any, value: any): boolean {
      if(["module", "cOffset", "cLength", "defaultEndian"].includes(prop)) return true;
      if(prop === "maxArrayLength"){
        target.maxArrayLength = value;
        target.module.maxArrayLength = value;
        return true;
      }
      if(prop === "parent"){
        if(isParentSet)
          return true;
        else {
          target.parent = value;
          return isParentSet = true;
        }
      }
      if(prop === "position"){
        if(!isNaN(Number(value))){
          let val = Number(value);
          if(val < 0) throw new BufferUtilityError(`You can't set a negative position, got ${val}`);
          target.position = val;
        }
        return true;
      }
      if(!isNaN(Number(prop))){
        target.writeByte(value, Number(prop));
        return true;
      }
      target[prop] = value;
      return true;
    },
    ownKeys(){
      return ["module", "maxArrayLength", "cOffset", "cLength", "returnAsBigInt", "position", "parent", "position", "defaultEndian"];
    }
  });
  if(data !== bufferUtilityChild) proxy.parent = void 0;
  return proxy;
}

BufferUtility.isBufferUtility = function isBufferUtility(clazz: any){
  return clazz instanceof BufferUtilityClass;
}

BufferUtility.byteLength = function byteLength(string: string | DataView | ArrayBuffer | SharedArrayBuffer, encoding?: string){
  return buffer.Buffer.byteLength(string, encoding as any);
};

BufferUtility.prototype = BufferUtilityClass.prototype;

export default BufferUtility;