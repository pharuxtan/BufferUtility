export class BufferUtility {
  readonly fileDescriptor: number;
  readonly forceOffset: number;
  readonly forceLength: number | null;
  readonly isDeleted: boolean;
  readonly parent: BufferUtility | undefined;
  readonly length: number;
  filename: string;
  position: number;

  clone(file?: string): BufferUtility | undefined;
  move(file?: string): BufferUtility | undefined;
  delete(): boolean | undefined;
  newBuf(file?: string): BufferUtility | undefined;

  changeDefaultEndian(endian: string): undefined;
  
  readByte(pos?: number): number | undefined;
  writeByte(value: number, pos?: number): number | undefined;
  rightShift(length: number, pos?: number, logical?: boolean): BufferUtility | undefined;
  leftShift(length: number, pos?: number): BufferUtility | undefined;
  read(length: number, pos?: number): BufferUtility | undefined;
  readBytes(length: number, pos?: number): BufferUtility | undefined;
  slice(pos: number, final?: number): BufferUtility | undefined;

  writeBytes(buffer: Buffer, pos?: number): BufferUtility | undefined;
  writeBytes(bufferutility: BufferUtility, pos?: number): BufferUtility | undefined;
  writeBytes(array: number[], pos?: number): BufferUtility | undefined;
  writeBytes(uint8array: Uint8Array, pos?: number): BufferUtility | undefined;

  readSByte(pos?: number): number | undefined;
  readInt8(pos?: number): number | undefined;

  readInt(bytesLength: number, pos?: number): number | BigInt | undefined;
  readInt16(pos?: number): number | undefined;
  readInt32(pos?: number): number | undefined;
  readInt64(pos?: number): number | BigInt | undefined;
  readInt128(pos?: number): number | BigInt | undefined;

  readIntLE(bytesLength: number, pos?: number): number | BigInt | undefined;
  readInt16LE(pos?: number): number | undefined;
  readInt32LE(pos?: number): number | undefined;
  readInt64LE(pos?: number): number | BigInt | undefined;
  readInt128LE(pos?: number): number | BigInt | undefined;

  readIntBE(bytesLength: number, pos?: number): number | BigInt | undefined;
  readInt16BE(pos?: number): number | undefined;
  readInt32BE(pos?: number): number | undefined;
  readInt64BE(pos?: number): number | BigInt | undefined;
  readInt128BE(pos?: number): number | BigInt | undefined;

  readUInt8(pos?: number): number | undefined;

  readUInt(bytesLength: number, pos?: number): number | BigInt | undefined;
  readUInt16(pos?: number): number | undefined;
  readUInt32(pos?: number): number | undefined;
  readUInt64(pos?: number): number | BigInt | undefined;
  readUInt128(pos?: number): number | BigInt | undefined;

  readUIntLE(bytesLength: number, pos?: number): number | BigInt | undefined;
  readUInt16LE(pos?: number): number | undefined;
  readUInt32LE(pos?: number): number | undefined;
  readUInt64LE(pos?: number): number | BigInt | undefined;
  readUInt128LE(pos?: number): number | BigInt | undefined;

  readUIntBE(bytesLength: number, pos?: number): number | BigInt | undefined;
  readUInt16BE(pos?: number): number | undefined;
  readUInt32BE(pos?: number): number | undefined;
  readUInt64BE(pos?: number): number | BigInt | undefined;
  readUInt128BE(pos?: number): number | BigInt | undefined;

  writeSByte(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt8(number: number | BigInt, pos?: number): BufferUtility | undefined;

  writeInt(number: number | BigInt, bytesLength: number, pos?: number): BufferUtility | undefined;
  writeInt16(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt32(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt64(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt128(number: number | BigInt, pos?: number): BufferUtility | undefined;

  writeIntLE(number: number | BigInt, bytesLength: number, pos?: number): BufferUtility | undefined;
  writeInt16LE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt32LE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt64LE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt128LE(number: number | BigInt, pos?: number): BufferUtility | undefined;

  writeIntBE(number: number | BigInt, bytesLength: number, pos?: number): BufferUtility | undefined;
  writeInt16BE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt32BE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt64BE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeInt128BE(number: number | BigInt, pos?: number): BufferUtility | undefined;

  writeUInt8(number: number | BigInt, pos?: number): BufferUtility | undefined;

  writeUInt(number: number | BigInt, bytesLength: number, pos?: number): BufferUtility | undefined;
  writeUInt16(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt32(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt64(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt128(number: number | BigInt, pos?: number): BufferUtility | undefined;

  writeUIntLE(number: number | BigInt, bytesLength: number, pos?: number): BufferUtility | undefined;
  writeUInt16LE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt32LE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt64LE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt128LE(number: number | BigInt, pos?: number): BufferUtility | undefined;

  writeUIntBE(number: number | BigInt, bytesLength: number, pos?: number): BufferUtility | undefined;
  writeUInt16BE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt32BE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt64BE(number: number | BigInt, pos?: number): BufferUtility | undefined;
  writeUInt128BE(number: number | BigInt, pos?: number): BufferUtility | undefined;

  read7BitEncodedInt(pos?: number): number | undefined;
  read7BitEncodedInt64(pos?: number): number | BigInt | undefined;
  write7BitEncodedInt(number: number | BigInt, pos?: number): BufferUtility | undefined;
  write7BitEncodedInt64(number: number | BigInt, pos?: number): BufferUtility | undefined;

  readBoolean(pos?: number): boolean | undefined;
  writeBoolean(bool: boolean, pos?: number): BufferUtility | undefined;

  readFloat(pos?: number): number | undefined;
  readDouble(pos?: number): number | undefined;
  writeFloat(number: number, pos?: number): BufferUtility | undefined;
  writeDouble(number: number, pos?: number): BufferUtility | undefined;

  readFloatLE(pos?: number): number | undefined;
  readFloatBE(pos?: number): number | undefined;
  readDoubleLE(pos?: number): number | undefined;
  readDoubleBE(pos?: number): number | undefined;
  writeFloatBE(number: number, pos?: number): BufferUtility | undefined;
  writeFloatLE(number: number, pos?: number): BufferUtility | undefined;
  writeDoubleLE(number: number, pos?: number): BufferUtility | undefined;
  writeDoubleBE(number: number, pos?: number): BufferUtility | undefined;

  readString(length: number, encoding?: string, pos?: number): string | undefined;
  readChar(encoding?: string, pos?: number): string | undefined;
  readChars(length: number, encoding?: string, pos?: number): string[] | undefined;
  writeString(string: string, encoding?: string, pos?: number): BufferUtility | undefined;
  writeChar(char: string, encoding?: string, pos?: number): BufferUtility | undefined;
  writeChars(chars: string[], encoding?: string, pos?: number): BufferUtility | undefined;

  swap16(): BufferUtility | undefined;
  swap32(): BufferUtility | undefined;
  swap64(): BufferUtility | undefined;
  swap128(): BufferUtility | undefined;

  toString(encoding?: string): string | undefined;
  toLocaleString(encoding?: string): string | undefined;
  toBuffer(): Buffer | undefined;
  toBufferList(): Buffer[] | undefined;
  toJSON(): JSON | undefined;

  [Symbol.toStringTag](): string;
  [Symbol.toPrimitive](): string;
  [Symbol.iterator](): IterableIterator<number>;
  [Symbol.asyncIterator]: IterableIterator<number>;

  constructor(string?: string, isFile?: boolean, encoding?: string, off?: number, size?: number);
  constructor(buffer?: Buffer, isFile?: boolean, encoding?: string, off?: number, size?: number);
  constructor(array?: number[], isFile?: boolean, encoding?: string, off?: number, size?: number);
  constructor(bufferutility?: BufferUtility, isFile?: boolean, encoding?: string, off?: number, size?: number);
  constructor(uint8array?: Uint8Array, isFile?: boolean, encoding?: string, off?: number, size?: number);
  constructor(json?: JSON, isFile?: boolean, encoding?: string, off?: number, size?: number);
  constructor(alloc?: number, isFile?: boolean, encoding?: string, off?: number, size?: number);

  prototype: BufferUtility;

  static isBufferUtility(object: any): boolean;

  static changeTmpFolder(folder: string, withBufferUtilityFolder?: boolean): string;

  static concat(list: Buffer[] | number[][] | BufferUtility[] | Uint8Array[], createNewBU?: boolean): BufferUtility;

  static byteLength(string: string, encoding?: string): number;

  static compare(buffer1: BufferUtility, buffer2: BufferUtility): number;
}