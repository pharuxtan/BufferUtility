<div align="center">
    <h1>BufferUtility</h1>
  	<p>BufferUtility break the Nodejs buffer size limitation by reading/writing a file dynamically</p>
</div>

---

<!-- TOC -->

- [Basic installation and usage](#basic-installation-and-usage)
- [Common Usage](#common-usage)
  - [Create a new BufferUtility](#create-a-new-bufferutility)
  - [Create a BufferUtility with different type of variable](#create-a-bufferutility-with-different-type-of-variable)
  - [Some other example](#some-other-example)
- [Function: BufferUtility](#function-bufferutility)
  - [BufferUtility(\[buffer\[, isFile\[, encoding\[, offset\[, size\]\]\]\]\])](#bufferutilitybuffer-isfile-encoding-offset-size)
  - [isBufferUtility(obj)](#isbufferutilityobj)
  - [changeTmpFolder(folder\[, withBufferUtilityFolder\])](#changetmpfolderfolder-withbufferutilityfolder)
  - [concat(list\[, createNewBU\])](#concatlist-createnewbu)
  - [byteLength(string\[, encoding\])](#bytelengthstring-encoding)
  - [compare(buf1, buf2)](#comparebuf1-buf2)
- [Class: BufferUtility](#class-bufferutility)
  - [new BufferUtility(\[buffer\[, isFile\[, encoding\[, offset\[, size\]\]\]\]\])](#new-bufferutilitybuffer-isfile-encoding-offset-size)
  - [buf\[index\]](#bufindex)
  - [buf.clone(\[file\])](#bufclonefile)
  - [buf.move(\[file\])](#bufmovefile)
  - [buf.delete(\[file\])](#bufdelete)
  - [buf.new(\[file\])](#bufnewfile)
  - [buf.readByte(\[pos\])](#bufreadbytepos)
  - [buf.writeByte(value\[, pos\])](#bufwritebytevalue-pos)
  - [buf.rightShift(length\[, pos\[, logical\]\])](#bufrightshiftlength-pos-logical)
  - [buf.leftShift(length\[, pos\])](#bufleftshiftlength-pos)
  - [buf.read(length\[, pos\])](#bufreadlength-pos)
  - [buf.readBytes(length\[, pos\])](#bufreadbyteslength-pos)
  - [buf.slice(pos\[, final\])](#bufslicepos-final)
  - [buf.writeBytes(buffer\[, pos\])](#bufwritebytesbuffer-pos)
  - [buf.readIntLE(bytesLength\[, pos\])](#bufreadintlebyteslength-pos)
  - [buf.readIntBE(bytesLength\[, pos\])](#bufreadintbebyteslength-pos)
  - [buf.readSByte(\[pos\])](#bufreadsbytepos)
  - [buf.readInt8(\[pos\])](#bufreadint8pos)
  - [buf.readInt16LE(\[pos\])](#bufreadint16lepos)
  - [buf.readInt16BE(\[pos\])](#bufreadint16bepos)
  - [buf.readInt32LE(\[pos\])](#bufreadint32lepos)
  - [buf.readInt32BE(\[pos\])](#bufreadint32bepos)
  - [buf.readInt64LE(\[pos\])](#bufreadint64lepos)
  - [buf.readInt64BE(\[pos\])](#bufreadint64bepos)
  - [buf.readInt128LE(\[pos\])](#bufreadint128lepos)
  - [buf.readInt128BE(\[pos\])](#bufreadint128bepos)
  - [buf.readUIntLE(bytesLength\[, pos\])](#bufreaduintlebyteslength-pos)
  - [buf.readUIntBE(bytesLength\[, pos\])](#bufreaduintbebyteslength-pos)
  - [buf.readUInt8(\[pos\])](#bufreaduint8pos)
  - [buf.readUInt16LE(\[pos\])](#bufreaduint16lepos)
  - [buf.readUInt16BE(\[pos\])](#bufreaduint16bepos)
  - [buf.readUInt32LE(\[pos\])](#bufreaduint32lepos)
  - [buf.readUInt32BE(\[pos\])](#bufreaduint32bepos)
  - [buf.readUInt64LE(\[pos\])](#bufreaduint64lepos)
  - [buf.readUInt64BE(\[pos\])](#bufreaduint64bepos)
  - [buf.readUInt128LE(\[pos\])](#bufreaduint128lepos)
  - [buf.readUInt128BE(\[pos\])](#bufreaduint128bepos)
  - [buf.writeIntLE(number, bytesLength\[, pos\])](#bufwriteintlenumber-byteslength-pos)
  - [buf.writeIntBE(number, bytesLength\[, pos\])](#bufwriteintbenumber-byteslength-pos)
  - [buf.writeSByte(number\[, pos\])](#bufwritesbytenumber-pos)
  - [buf.writeInt8(number\[, pos\])](#bufwriteint8number-pos)
  - [buf.writeInt16LE(number\[, pos\])](#bufwriteint16lenumber-pos)
  - [buf.writeInt16BE(number\[, pos\])](#bufwriteint16benumber-pos)
  - [buf.writeInt32LE(number\[, pos\])](#bufwriteint32lenumber-pos)
  - [buf.writeInt32BE(number\[, pos\])](#bufwriteint32benumber-pos)
  - [buf.writeInt64LE(number\[, pos\])](#bufwriteint64lenumber-pos)
  - [buf.writeInt64BE(number\[, pos\])](#bufwriteint64benumber-pos)
  - [buf.writeInt128LE(number\[, pos\])](#bufwriteint128lenumber-pos)
  - [buf.writeInt128BE(number\[, pos\])](#bufwriteint128benumber-pos)
  - [buf.writeUIntLE(number, bytesLength\[, pos\])](#bufwriteuintlenumber-byteslength-pos)
  - [buf.writeUIntBE(number, bytesLength\[, pos\])](#bufwriteuintbenumber-byteslength-pos)
  - [buf.writeUInt8(number\[, pos\])](#bufwriteuint8number-pos)
  - [buf.writeUInt16LE(number\[, pos\])](#bufwriteuint16lenumber-pos)
  - [buf.writeUInt16BE(number\[, pos\])](#bufwriteuint16benumber-pos)
  - [buf.writeUInt32LE(number\[, pos\])](#bufwriteuint32lenumber-pos)
  - [buf.writeUInt32BE(number\[, pos\])](#bufwriteuint32benumber-pos)
  - [buf.writeUInt64LE(number\[, pos\])](#bufwriteuint64lenumber-pos)
  - [buf.writeUInt64BE(number\[, pos\])](#bufwriteuint64benumber-pos)
  - [buf.writeUInt128LE(number\[, pos\])](#bufwriteuint128lenumber-pos)
  - [buf.writeUInt128BE(number\[, pos\])](#bufwriteuint128benumber-pos)
  - [buf.read7BitEncodedInt(\[pos\])](#bufread7bitencodedintpos)
  - [buf.write7BitEncodedInt(number\[, pos\])](#bufwrite7bitencodedintnumber-pos)
  - [buf.readBoolean(\[pos\])](#bufreadbooleanpos)
  - [buf.writeBoolean(bool\[, pos\])](#bufwritebooleanbool-pos)
  - [buf.readFloatLE(\[pos\])](#bufreadfloatlepos)
  - [buf.readFloatBE(\[pos\])](#bufreadfloatbepos)
  - [buf.readDoubleLE(\[pos\])](#bufreaddoublelepos)
  - [buf.readDoubleBE(\[pos\])](#bufreaddoublebepos)
  - [buf.writeFloatLE(number\[, pos\])](#bufwritefloatlenumber-pos)
  - [buf.writeFloatBE(number\[, pos\])](#bufwritefloatbenumber-pos)
  - [buf.writeDoubleLE(number\[, pos\])](#bufwritedoublelenumber-pos)
  - [buf.writeDoubleBE(number\[, pos\])](#bufwritedoublebenumber-pos)
  - [buf.readString(length\[, encoding\[, pos\]\])](#bufreadstringlength-encoding-pos)
  - [buf.readChar(\[encoding\[, pos\]\])](#bufreadcharencoding-pos)
  - [buf.readChars(length\[, encoding\[, pos\]\])](#buflength-encoding-pos)
  - [buf.writeString(string\[, encoding\[, pos\]\])](#bufwritestringstring-encoding-pos)
  - [buf.writeChar(char\[, encoding\[, pos\]\])](#bufwritecharchar-encoding-pos)
  - [buf.writeChars(chars\[, encoding\[, pos\]\])](#bufwritecharschars-encoding-pos)
  - [buf.swap16()](#bufswap16)
  - [buf.swap32()](#bufswap32)
  - [buf.swap64()](#bufswap64)
  - [buf.swap128()](#bufswap128)
  - [buf.toString(encoding)](#buftostringencoding)
  - [buf.toBuffer()](#buftobuffer)
  - [buf.toBufferList()](#buftobufferlist)
  - [buf.toJSON()](#buftojson)
  - [buf.length](#buflength)
  - [buf.fileDescriptor](#buffiledescriptor)
  - [buf.filename](#buffilename)
  - [buf.forceOffset](#bufforceoffset)
  - [buf.forceLength](#bufforcelength)
  - [buf.position](#bufposition)
  - [buf.isDeleted](#bufisdeleted)
  - [buf.parent](#bufparent)
- [How to retrieve BufferUtility V1 ?](#how-to-retrieve-bufferutility-v1-)
- [LICENSE](#license)

<!-- /TOC -->

## Basic installation and usage

You can install this package either by using npm or by downloading the source from GitHub and requiring it directly.

To install using npm open your terminal (or command line), make sure you're in your application directory and execute the following command:

```console
npm install bufferutility
```

You can then start using the package by requiring it from your application as such:

```js
var { BufferUtility } = require('bufferutility');
```

## Common Usage

### Create a new BufferUtility

```js
const { BufferUtility } = require("bufferutility");

let buffer = BufferUtility();

console.log(buffer);
// <BufferUtility >

buffer[0] = 0xfa; // or buffer.writeByte(0xfa, 0);

console.log(buffer);
// <BufferUtility fa>

console.log(buffer[0]);
// 250
```

### Create a BufferUtility with different type of variable

```js
const { BufferUtility } = require("bufferutility");

console.log(BufferUtility("abcdef"));
// <BufferUtility 61 62 63 64 65 66>

console.log(BufferUtility(Buffer.from("abcdef")));
// <BufferUtility 61 62 63 64 65 66>

console.log(BufferUtility([0x61, 0x62, 0x63, 0x64, 0x65, 0x66]));
// <BufferUtility 61 62 63 64 65 66>

console.log(BufferUtility(6));
// <BufferUtility 00 00 00 00 00 00>

console.log(BufferUtility([6]));
// <BufferUtility 06>

let buffer = BufferUtility("123456");

console.log(BufferUtility(buffer));
// <BufferUtility 31 32 33 34 35 36>

/*
 * file: C:\cool.txt
 * content: A cool file :D
 */

let file = BufferUtility("C:\\cool.txt", true);

console.log(file);
// <BufferUtility 41 20 63 6f 6f 6c 20 66 69 6c 65 20 3a 44>
```

### Some other example

```js
const { BufferUtility } = require("bufferutility");

let buf1 = BufferUtility();

console.log(BufferUtility.isBufferUtility(buf1));
// true

console.log(BufferUtility.isBufferUtility(Buffer.alloc(0)));
// false

let buf2 = BufferUtility("1234");
let buf3 = BufferUtility("0123");
let arr = [buf2, buf3];

console.log(arr.sort(BufferUtility.compare));
// [<BufferUtility 30 31 32 33>, <BufferUtility 31 32 33 34>]

let buf4 = BufferUtility("1");
let buf5 = BufferUtility("2");

let concat1 = BufferUtility.concat([buf4, buf5], false);
let concat2 = BufferUtility.concat([buf4, buf5], true);

console.log(concat1); // console.log(concat2);
// <BufferUtility 31 32>

console.log(concat1 === buf4);
// true

console.log(concat2 === buf5);
// false

console.log(buf5.filename);
// C:/Users/%username%/AppData%/Temp/BufferUtility/(random 32 length hex digit).bin

BufferUtility.changeTmpFolder("D:/Temp", true);

let buf6 = BufferUtility();

console.log(buf6.filename);
// D:/Temp/BinaryUtility/(random 32 length hex digit).bin

BufferUtility.changeTmpFolder("D:/Temp", false);

let buf7 = BufferUtility();

console.log(buf7.filename);
// D:/Temp/(random 32 length hex digit).bin

let buffer = BufferUtility();

buffer.writeUInt8(1);
// <BufferUtility 01>
buffer.writeUInt16LE(2);
// <BufferUtility 01 02 00>
buffer.writeUInt32LE(3);
// <BufferUtility 01 02 00 03 00 00 00>
buffer.writeUInt64LE(4);
// <BufferUtility 01 02 00 03 00 00 00 04 00 00 00 00 00 00 00>
buffer.writeBytes([1, 2, 3, 4, 5, 6]);
// <BufferUtility 01 02 00 03 00 00 00 04 00 00 00 00 00 00 00 01 02 03 04 05 06>

buffer.position = 0; //reset the position

buffer.readUInt8();
// 1
buffer.readUInt16LE();
// 2
buffer.readUInt32LE();
// 3
buffer.readUInt64LE();
// 4
buffer.read(6); // same as buffer.readBytes
// <BufferUtility 01 02 03 04 05 06>
buffer.read(6, buffer.position - 6).toBuffer();
// <Buffer 01 02 03 04 05 06>
```

## Function: BufferUtility

### BufferUtility([buffer[, isFile[, encoding[, offset[, size]]]]])

- `buffer` : `<String>` | `<Buffer>` | `<Array>` | `<BufferUtility>` | `<Uint8Array>` | `<Number>` A property determinate the value of the BufferUtility. Default: `undefined` (empty)
- `isFile` : `<boolean>` A boolean say if the buffer is a file and not a string. Default: `false`
- `encoding` : `<String>` The encoding for value if value is a string. Default: `utf8`.
- `offset` : `<Number>` The forced offset of the file. Default: `0`
- `length` : `<Number>` The forced length of the file. Default: `null`
- Returns : `<BufferUtility>`

Create a new BufferUtility instance from `buffer` property

```js
let buf1 = BufferUtility();
let buf2 = BufferUtility("test");
let buf3 = BufferUtility("€", false, "utf8");
let buf4 = BufferUtility("C:/myfile.txt", true);
let buf6 = BufferUtility("hmmmmmmmm", false, "utf8", 1, 7);
```

### isBufferUtility(obj)

- `obj` : `<Object>`
- Returns : `<boolean>`

Returns `true` if `obj` is a `BufferUtility`, `false` otherwise.

```js
let buf1 = BufferUtility("a BufferUtility");

let buf2 = Buffer.from("a Buffer");

console.log(BufferUtility.isBufferUtility(buf1));
// true

console.log(BufferUtility.isBufferUtility(buf2));
// false
```

### changeTmpFolder(folder[, withBufferUtilityFolder])

- `folder` : `<String>` The path to the new folder
- `withBufferUtilityFolder` : `<boolean>` Add a BufferUtility folder in the folder for bin files. Default: `true`
- Returns : `folder`

Change the temp folder where temporary files are stocked

```js
let buf1 = BufferUtility("test");

console.log(buf1.filename);
// C:/Users/%username%/AppData%/Temp/BufferUtility/(random 32 length hex digit).bin

BufferUtility.changeTmpFolder("D:/Temp");

let buf2 = BufferUtility("test");

console.log(buf2.filename);
// D:/Temp/BufferUtility/(random 32 length hex digit).bin

BufferUtility.changeTmpFolder("D:/Temp", false);

let buf3 = BufferUtility("test");

console.log(buf3.filename);
// D:/Temp/(random 32 length hex digit).bin
```

### concat(list[, createNewBU])

- `list` : `<Array>` Array of "`<Buffer>` | `<Array>` | `<BufferUtility>` | `<Uint8Array>`"
- `createNewBU` : `<boolean>` Create a new BufferUtility, if false the first index of the list must be a BufferUtility. Default: `false`
- Returns : `<BufferUtility>`

Returns a BufferUtility which is the result of concatenating all the instances in the list together.

```js
let buf1 = BufferUtility("test");
let buf2 = BufferUtility(", is this working ?");

BufferUtility.concat([buf1, buf2]);

console.log(buf1);
// <BufferUtility 74 65 73 74 2c 20 69 73 20 74 68 69 73 20 77 6f 72 6b 69 6e 67 20 3f>
console.log(buf1.toString());
// test, is this working ?
```

```js
let buf1 = BufferUtility("test");
let buf2 = BufferUtility(", is this working ?");

let buf3 = BufferUtility.concat([buf1, buf2], true);

console.log(buf3);
// <BufferUtility 74 65 73 74 2c 20 69 73 20 74 68 69 73 20 77 6f 72 6b 69 6e 67 20 3f>
console.log(buf3.toString());
// test, is this working ?
```

### byteLength(string[, encoding])

See https://nodejs.org/api/buffer.html#buffer_class_method_buffer_bytelength_string_encoding

### compare(buf1, buf2)

- `buf1` : `<BufferUtility>`
- `buf2` : `<BufferUtility>`
- Returns : Either `-1`, `0`, or `1`, depending on the result of the comparison.

See https://nodejs.org/api/buffer.html#buffer_class_method_buffer_compare_buf1_buf2 for more details

## Class: BufferUtility

### new BufferUtility([buffer[, isFile[, encoding[, offset[, size]]]]])

See [BufferUtility(\[buffer\[, isFile\[, encoding\[, offset\[, size\]\]\]\]\])](#bufferutilitybuffer-isfile-encoding-offset-size)

### buf[index]

- `index` : `<integer>`

The index operator `[index]` can be used to get and set the octet at position `index` in `buf`. The values refer to individual bytes, so the legal value range is between `0x00` and `0xFF` (hex) or `0` and `255` (decimal).

This operator doesn't work like `Uint8Array` and `Buffer`. its behavior on out-of-bounds access is `buf[index]` returns an Error when `index` is negative or greater or equal to `buf.length`, and `buf[index] = value` does not modify the buffer if `index` is negative. If `index` is greater or equal to `buf.length` a byte will be written (extend by `0x00` if is greater than the `buf.length`);

```js
const str = 'Node.js';
const buf = BufferUtility(str.length);

for (let i = 0; i < str.length; i++) {
  buf[i] = str.charCodeAt(i);
}

console.log(buf.toString('utf8'));
// Node.js
```

### buf.clone([file])

- `file` : `<String>` The new file to write
- Returns : `<BufferUtility>`

Copies data from the `buf` to a new `BufferUtility` in the file (if not specified create a new file in temp folder)

```js
const buf = BufferUtility("abcdef");
const buf2 = buf.clone("C:/myfile.txt");

console.log(buf);
// <BufferUtility 61 62 63 64 65 66>
console.log(buf.filename);
// C:/Users/%username%/AppData%/Temp/BufferUtility/(random 32 length hex digit).bin

console.log(buf2);
// <BufferUtility 61 62 63 64 65 66>
console.log(buf2.filename);
// C:/myfile.txt
```

### buf.move([file])

- `file` : `<String>` The new file to write
- Returns : `<BufferUtility>`

Move the file of the BufferUtility (if file is not specified move the file to a file in temporary folder)

WARNING: if the file already exist the buffer will not move but will be replaced by the content of the new file. For more details see [buf.filename](#buffilename);

```js
const buf = BufferUtility();

console.log(buf.filename);
// C:/Users/%username%/AppData%/Temp/BufferUtility/(random 32 length hex digit).bin

buf.move("C:/myfile.txt");

console.log(buf.filename);
// C:/myfile.txt
```

### buf.delete()

- Returns: `true`

Delete the BufferUtility (and also the file);

```js
const buf = BufferUtility();

console.log(buf);
// <BufferUtility >
console.log(buf.filename);
// C:/Users/%username%/AppData%/Temp/BufferUtility/(random 32 length hex digit).bin

buf.delete();

console.log(buf)
// <BufferUtility disabled>
console.log(buf.filename);
// null
```

### buf.new([file])

- `file` : `<String>` The new file to write
- Returns : `<BufferUtility>`

After deleted you can use the same BufferUtility for create/open a new file with this function

```js
const buf = BufferUtility();
buf.delete();

console.log(buf)
// <BufferUtility disabled>
console.log(buf.filename);
// null

buf.new();

console.log(buf)
// <BufferUtility >
console.log(buf.filename);
// C:/Users/%username%/AppData%/Temp/BufferUtility/(random 32 length hex digit).bin
```

### buf.readByte([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<Number>`

Read the byte in the position specified, if not specified he read the actual position and increase it by 1.

```js
const buf = BufferUtility([0x01, 0x4f]);

console.log(buf.readByte(0));
// Decimal: 1
// Hex: 0x01
console.log(buf.readByte());
// Decimal: 1
// Hex: 0x01
console.log(buf.readByte());
// Decimal: 79
// Hex: 0x4f
```

### buf.writeByte(value[, pos])

- `value` : `<integer>` The value of the byte to write.
- `pos` : `<integer>` Number of bytes to skip before starting to write. Default: [`buf.position`](#bufposition)
- Returns : `<BufferUtility>`

Write the value in the position specified, if it is not specified he read the actual position and increase it by 1.

```js
const buf = BufferUtility([0x01]);

console.log(buf.readByte(0));
// Decimal: 1
// Hex: 0x01
console.log(buf.writeByte(0x02, 0));
// <BufferUtility 02>
console.log(buf.readByte());
// Decimal: 2
// Hex: 0x02
```

### buf.rightShift(length[, pos[, logical]])

- `length` : `<integer>` Number of bytes to right shift.
- `pos` : `<integer>` Number of bytes to skip before starting to right shift. Default: [`buf.position`](#bufposition)
- `logical` : `<boolean>` Use logical instead of arithmetic. Default: `false`
- Returns : `<BufferUtility>`

Fill the buffer with `0x00`, or `0xff` if logical is true by the `length` and move the byte to the right

```js
const buf = BufferUtility([0x01]);

console.log(buf);
// <BufferUtility 01>
console.log(buf.rightShift(5));
// <BufferUtility 00 00 00 00 00 01>
console.log(buf.rightShift(5, 0, true));
// <BufferUtility ff ff ff ff ff 00 00 00 00 00 01>
```

### buf.leftShift(length[, pos])

- `length` : `<integer>` Number of bytes to left shift.
- `pos` : `<integer>` Number of bytes to skip before starting to left shift. Default: [`buf.position`](#bufposition)
- Returns : `<BufferUtility>`

Move the bytes left by the `length` and truncate the end for remove extra bytes

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

console.log(buf);
// <BufferUtility 00 00 00 00 00 01>
console.log(buf.leftShift(5));
// <BufferUtility 01>
```

### buf.read(length[, pos])

- `length` : `<integer>` Number of bytes to read.
- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<BufferUtility>`

Reads a specific region of the `buffer` and advances the current `position` by the `length` if the `position` is not specified

```js
const buf = BufferUtility([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]);

console.log(buf.read(4));
// <BufferUtility 01 02 03 04>
console.log(buf.read(2, 4));
// <BufferUtility 05 06>
```

### buf.readBytes(length[, pos])

See [buf.read(length\[, pos\])](#bufreadlength-pos)

### buf.slice(pos[, final])

- `pos` : `<integer>` Number of bytes to skip before starting to read.
- `final` : `<integer>` The position of the stop to read. Default: [`buf.length`](#buflength)
- Returns : `<BufferUtility>`

Reads a specific region of the `buffer`.

```js
const buf = BufferUtility([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]);

console.log(buf.slice(0, 4));
// <BufferUtility 01 02 03 04>
console.log(buf.slice(4));
// <BufferUtility 05 06>
```

### buf.writeBytes(buffer[, pos])

- `buffer` : `<Buffer>` | `<BufferUtility>` | `<Array>` | `<Uint8Array>`
the bytes to write in the `buffer`
- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<BufferUtility>`

Write the `buffer` to the `buf` and advance the position by the length of the buffer if not specified

```js
const buf = BufferUtility([0x01, 0x02, 0x03, 0x04, 0x05, 0x06]);
buf2 = BufferUtility([0x07, 0x08]);

buf.writeBytes(buf2, 6);

console.log(buf);
// <BufferUtility 01 02 03 04 05 06 07 08>

buf.writeBytes([0x00, 0x01]);

console.log(buf);
// <BufferUtility 00 01 03 04 05 06 07 08>
```

### buf.readIntLE(bytesLength[, pos])

- `bytesLength` : `<integer>` Number of bytes to read.
- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads `bytesLength` number of bytes from `buf` at the specified position (if not specified the actual position of the buf) and interprets the result as a little-endian.

```js
const buf = BufferUtility([0x01, 0x00, 0x00, 0x00]);

console.log(buf.readIntLE(4));
// 1

const buf2 = BufferUtility([0xfe, 0xff, 0xff, 0xff])

console.log(buf2.readIntLE(4, 0));
// -2
```

### buf.readIntBE(bytesLength[, pos])

- `bytesLength` : `<integer>` Number of bytes to read.
- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads `bytesLength` number of bytes from `buf` at the specified position (if not specified the actual position of the buf) and interprets the result as a big-endian.

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x01]);

console.log(buf.readIntBE(4));
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xfe])

console.log(buf2.readIntBE(4, 0));
// -2
```

### buf.readSByte([pos])

See [buf.readInt8(\[pos\])](#bufreadint8pos)

### buf.readInt8([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed 8-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `1`.

```js
const buf = BufferUtility([0x01]);

console.log(buf.readInt8());
// 1

const buf2 = BufferUtility([0xfe])

console.log(buf2.readInt8(0));
// -2
```

### buf.readInt16LE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed, little-endian 16-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `2`.

```js
const buf = BufferUtility([0x01, 0x00]);

console.log(buf.readInt16LE());
// 1

const buf2 = BufferUtility([0xfe, 0xff])

console.log(buf2.readInt16LE(0));
// -2
```

### buf.readInt16BE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed, big-endian 16-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `2`.

```js
const buf = BufferUtility([0x00, 0x01]);

console.log(buf.readInt16BE());
// 1

const buf2 = BufferUtility([0xff, 0xfe])

console.log(buf2.readInt16BE(0));
// -2
```

### buf.readInt32LE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed, little-endian 32-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `4`.

```js
const buf = BufferUtility([0x01, 0x00, 0x00, 0x00]);

console.log(buf.readInt32LE());
// 1

const buf2 = BufferUtility([0xfe, 0xff, 0xff, 0xff])

console.log(buf2.readInt32LE(0));
// -2
```

### buf.readInt32BE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed, big-endian 32-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `4`.

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x01]);

console.log(buf.readInt32BE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xfe])

console.log(buf2.readInt32BE(0));
// -2
```

### buf.readInt64LE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed, little-endian 64-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `8`.

Returns `<BigInt>` if the number is greater than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (hex: `0x1FFFFFFFFFFFFF`, decimal: `9007199254740991`)

```js
const buf = BufferUtility([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

console.log(buf.readInt64LE());
// 1

const buf2 = BufferUtility([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])

console.log(buf2.readInt64LE(0));
// -2
```

### buf.readInt64BE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed, big-endian 64-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `8`.

Returns `<BigInt>` if the number is greater than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (hex: `0x1FFFFFFFFFFFFF`, decimal: `9007199254740991`)

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

console.log(buf.readInt64BE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe])

console.log(buf2.readInt64BE(0));
// -2
```

### buf.readInt128LE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed, little-endian 128-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `16`.

Returns `<BigInt>` if the number is greater than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (hex: `0x1FFFFFFFFFFFFF`, decimal: `9007199254740991`)

```js
const buf = BufferUtility([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

console.log(buf.readInt128LE());
// 1

const buf2 = BufferUtility([0xfe, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])

console.log(buf2.readInt128LE(0));
// -2
```

### buf.readInt128BE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads a signed, big-endian 128-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `16`.

Returns `<BigInt>` if the number is greater than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (hex: `0x1FFFFFFFFFFFFF`, decimal: `9007199254740991`)

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

console.log(buf.readInt128BE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe])

console.log(buf2.readInt128BE(0));
// -2
```

### buf.readUIntLE(bytesLength[, pos])

- `bytesLength` : `<integer>` Number of bytes to read.
- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads `bytesLength` number of bytes from `buf` at the specified position (if not specified the actual position of the buf) and interprets the result as a little-endian.

```js
const buf = BufferUtility([0x01, 0x00, 0x00, 0x00]);

console.log(buf.readUIntLE(4));
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff])

console.log(buf2.readUIntLE(4, 0));
// 4294967295
```

### buf.readUIntBE(bytesLength[, pos])

- `bytesLength` : `<integer>` Number of bytes to read.
- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads `bytesLength` number of bytes from `buf` at the specified position (if not specified the actual position of the buf) and interprets the result as a big-endian.

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x01]);

console.log(buf.readUIntBE(4));
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff])

console.log(buf2.readUIntBE(4, 0));
// 4294967295
```

### buf.readUInt8([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned 8-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `1`.

```js
const buf = BufferUtility([0x01]);

console.log(buf.readUInt8());
// 1

const buf2 = BufferUtility([0xff])

console.log(buf2.readUInt8(0));
// 255
```

### buf.readUInt16LE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned, little-endian 16-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `2`.

```js
const buf = BufferUtility([0x01, 0x00]);

console.log(buf.readUInt16LE());
// 1

const buf2 = BufferUtility([0xff, 0xff])

console.log(buf2.readUInt16LE(0));
// 65535
```

### buf.readUInt16BE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned, big-endian 16-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `2`.

```js
const buf = BufferUtility([0x00, 0x01]);

console.log(buf.readUInt16BE());
// 1

const buf2 = BufferUtility([0xff, 0xff])

console.log(buf2.readUInt16BE(0));
// 65535
```

### buf.readUInt32LE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned, little-endian 32-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `4`.

```js
const buf = BufferUtility([0x01, 0x00, 0x00, 0x00]);

console.log(buf.readUInt32LE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff])

console.log(buf2.readUInt32LE(0));
// 4294967295
```

### buf.readUInt32BE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned, big-endian 32-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `4`.

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x01]);

console.log(buf.readUInt32BE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff])

console.log(buf2.readUInt32BE(0));
// 4294967295
```

### buf.readUInt64LE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned, little-endian 64-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `8`.

Returns `<BigInt>` if the number is greater than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (hex: `0x1FFFFFFFFFFFFF`, decimal: `9007199254740991`)

```js
const buf = BufferUtility([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

console.log(buf.readUInt64LE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

console.log(buf2.readUInt64LE(0));
// 18446744073709551615n
```

### buf.readUInt64BE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned, big-endian 64-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `8`.

Returns `<BigInt>` if the number is greater than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (hex: `0x1FFFFFFFFFFFFF`, decimal: `9007199254740991`)

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

console.log(buf.readUInt64BE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

console.log(buf2.readUInt64BE(0));
// 18446744073709551615n
```

### buf.readUInt128LE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned, little-endian 128-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `16`.

Returns `<BigInt>` if the number is greater than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (hex: `0x1FFFFFFFFFFFFF`, decimal: `9007199254740991`)

```js
const buf = BufferUtility([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);

console.log(buf.readUInt128LE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

console.log(buf2.readUInt128LE(0));
// 340282366920938463463374607431768211455n
```

### buf.readUInt128BE([pos])

- `pos` : `<integer>` Number of bytes to skip before starting to read. Default: [`buf.position`](#bufposition)
- Returns : `<integer>`

Reads an unsigned, big-endian 128-bit integer from `buf` at the specified `pos`, if not specified the `buf.position` is increase by `16`.

Returns `<BigInt>` if the number is greater than [`Number.MAX_SAFE_INTEGER`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER) (hex: `0x1FFFFFFFFFFFFF`, decimal: `9007199254740991`)

```js
const buf = BufferUtility([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);

console.log(buf.readUInt128BE());
// 1

const buf2 = BufferUtility([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);

console.log(buf2.readUInt128BE(0));
// 340282366920938463463374607431768211455n
```

### buf.writeIntLE(number, bytesLength[, pos])

### buf.writeIntBE(number, bytesLength[, pos])

### buf.writeSByte(number[, pos])

### buf.writeInt8(number[, pos])

### buf.writeInt16LE(number[, pos])

### buf.writeInt16BE(number[, pos])

### buf.writeInt32LE(number[, pos])

### buf.writeInt32BE(number[, pos])

### buf.writeInt64LE(number[, pos])

### buf.writeInt64BE(number[, pos])

### buf.writeInt128LE(number[, pos])

### buf.writeInt128BE(number[, pos])

### buf.writeUIntLE(number, bytesLength[, pos])

### buf.writeUIntBE(number, bytesLength[, pos])

### buf.writeUInt8(number[, pos])

### buf.writeUInt16LE(number[, pos])

### buf.writeUInt16BE(number[, pos])

### buf.writeUInt32LE(number[, pos])

### buf.writeUInt32BE(number[, pos])

### buf.writeUInt64LE(number[, pos])

### buf.writeUInt64BE(number[, pos])

### buf.writeUInt128LE(number[, pos])

### buf.writeUInt128BE(number[, pos])

### buf.read7BitEncodedInt([pos])

### buf.write7BitEncodedInt(number[, pos])

### buf.readBoolean([pos])

### buf.writeBoolean(bool[, pos])

### buf.readFloatLE([pos])

### buf.readFloatBE([pos])

### buf.readDoubleLE([pos])

### buf.readDoubleBE([pos])

### buf.writeFloatLE(number[, pos])

### buf.writeFloatBE(number[, pos])

### buf.writeDoubleLE(number[, pos])

### buf.writeDoubleBE(number[, pos])

### buf.readString(length[, encoding[, pos]])

### buf.readChar([encoding[, pos]])

### buf.readChars(length[, encoding[, pos]])

### buf.writeString(string[, encoding[, pos]])

### buf.writeChar(char[, encoding[, pos]])

### buf.writeChars(chars[, encoding[, pos]])

### buf.swap16()

### buf.swap32()

### buf.swap64()

### buf.swap128()

### buf.toString(encoding)

### buf.toBuffer()

### buf.toBufferList()

### buf.toJSON()

### buf.length

### buf.fileDescriptor

### buf.filename

### buf.forceOffset

### buf.forceLength

### buf.position

### buf.isDeleted

### buf.parent

## How to retrieve BufferUtility V1 ?

V1 is still in BufferUtility for take it you can make this

```js
const bufferutility = require("bufferutility");

let BufferReader = bufferutility.v1.BufferReader;
let BufferWriter = bufferutility.v1.BufferWriter;

new BufferReader();
new BufferWriter();
```

Or

```js
const { v1: { BufferReader, BufferWriter } } = require("bufferutility");

new BufferReader();
new BufferWriter();
```

Or you can also uninstall the package and install the v1.2.2

You can read the v1 [README here](README.v1.md)

<a id="license" rel="license" href="https://github.com/Pharuxtan/BufferUtility/blob/v2/LICENSE"><img src="https://img.shields.io/badge/License-MIT-%23707070?style=for-the-badge" alt="license"></a>
