<div align="center">
    <h1>BufferUtility</h1>
  	<p>BufferUtility break the Nodejs buffer size limitation by reading/writing a file dynamically</p>
</div>

---

<!-- TOC -->

<!-- WIP -->

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
// C:/Users/%username%/AppData%/Temp/BufferUtility/(random 32 hex digit).bin

BufferUtility.changeTmpFolder("D:/Temp", true);

let buf6 = BufferUtility();

console.log(buf6.filename);
// D:/Temp/BinaryUtility/(random 32 hex digit).bin

BufferUtility.changeTmpFolder("D:/Temp", false);

let buf7 = BufferUtility();

console.log(buf7.filename);
// D:/Temp/(random 32 hex digit).bin

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

### isBufferUtility(obj)

- `obj` : `<Object>`
- Returns : `<boolean>`

Returns `true` if `obj` is a `BufferUtility`, `false` otherwise.

### changeTmpFolder(folder[, withBufferUtilityFolder])

- `folder` : `<String>` The path to the new folder
- `withBufferUtilityFolder` : `<boolean>` Add a BufferUtility folder in the folder for bin files. Default: `true`
- Returns : `folder`

Change the temp folder where temporary files are stocked

### concat(list[, createNewBU])

- `list` : `<Array>` Array of "`<Buffer>` | `<Array>` | `<BufferUtility>` | `<Uint8Array>`"
- `createNewBU` : `<boolean>` Create a new BufferUtility, if false the first index of the list must be a BufferUtility. Default: `false`
- Returns : `<BufferUtility>`

Returns a BufferUtility which is the result of concatenating all the instances in the list together.

### byteLength(string[, encoding])

See https://nodejs.org/api/buffer.html#buffer_class_method_buffer_bytelength_string_encoding

### compare(buf1, buf2)

- `buf1` : `<BufferUtility>`
- `buf2` : `<BufferUtility>`
- Returns : Either `-1`, `0`, or `1`, depending on the result of the comparison.

See https://nodejs.org/api/buffer.html#buffer_class_method_buffer_compare_buf1_buf2 for more details

## Class: BufferUtility

### new BufferUtility(...args)

See [BufferUtility(\[buffer\[, isFile\[, encoding\[, offset\[, size\]\]\]\]\])](#bufferutilitybuffer-isfile-encoding-offset-size)

## Documentation for others functions is on work in progress

## How to retrieve BufferUtility V1 ?

V1 is still in BufferUtility for take it you can make this

```js
const bufferutility = require("bufferutility");

let BufferReader = bufferutility.old.BufferReader;
let BufferWriter = bufferutility.old.BufferWriter;

new BufferReader();
new BufferWriter();
```

Or

```js
const { old: { BufferReader, BufferWriter } } = require("bufferutility");

new BufferReader();
new BufferWriter();
```

Or you can also uninstall the package and install the v1.2.2

You can read the v1 [README here](README.v1.md)

<a rel="license" href="https://github.com/Pharuxtan/BufferUtility/blob/v2/LICENSE"><img src="https://img.shields.io/badge/License-MIT-%23707070?style=for-the-badge" alt="license"></a>
