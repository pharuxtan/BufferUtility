<div align="center">
  <h1>BufferUtility</h1>
  <p>A Node and Bun compatible buffer tool that permit easier binary manipulation.</p>
</div>

<p align="center">
  <a rel="LICENSE" href="https://github.com/pharuxtan/bufferutility/blob/main/LICENSE">
    <img src="https://img.shields.io/static/v1?label=license&message=mit&labelColor=111111&color=0057da&style=for-the-badge&logo=data%3Aimage/png%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABQAAAATCAYAAACQjC21AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHpFAACAgwAA/FcAAIDoAAB5FgAA8QEAADtfAAAcheDStWoAAAFGSURBVHjarJK9LgRhFIafWUuiEH/rJwrJClEq3IELUKgo3IrETWh0FC7BNVih0AoKBQoEydq11qMwm5yMsbPEm3yZd55zvnfO92VQKVhLak09UZeL%2BrsVZ9Qdv2tXnf1NYEndUushZFGthvemuq32FwWuq%2BeZid5DvZGpXambeYGr6qnd9dGldqaudQL3QuFWvVbbmaC6%2BprDr9WbwA4SdQW4BwaABb50CTykfjjwC%2BAx9SPAfOANYDxRCXpOnxNAM4ePA63Ul8NHR4E2QClsGgGG0jUR%2BFjglcAn8/pj4HTwUz/42FPJ68lOSDhCkR/O46XM0Qh3VcRH83jph%2BZefKUosBr8XA%2B%2BmufLAR4Dh6k/CrzWA691YOc/3Ejv6iNM3k59Xw%2B8D3gC9hN1ErjjfzSbqHVg8J8CG2XgBXgL4/9VCdD6HACaHdcHGCRMgQAAAABJRU5ErkJggg%3D%3D" alt="License">
  </a>
  <a rel="VERSION" href="https://github.com/pharuxtan/bufferutility">
    <img src="https://img.shields.io/static/v1?label=version&message=3.0.0&labelColor=111111&color=06f&style=for-the-badge" alt="Version">
  </a>
</p>

---

<!-- TOC -->

- [Basic installation and usage](#basic-installation-and-usage)
- [Common Usage](#common-usage)
  - [Create a new BufferUtility](#create-a-new-bufferutility)
  - [Create a BufferUtility with different modules](#create-a-bufferutility-with-different-modules)
- [Function: BufferUtility](#function-bufferutility)
  - [isBufferUtility(obj)](#isbufferutilityobj)
  - [byteLength(string\[, encoding\])](#bytelengthstring-encoding)
- [Class: BufferUtility](#class-bufferutility)
  - [new BufferUtility(\[data\[, opts\]\])](#new-bufferutilitydata-opts)

<!-- /TOC -->

## Basic installation and usage

You can install this package by using your preferred node package manager (NPM, PNPM, Yarn, etc) or bun

```console
npm install bufferutility # NPM
pnpm add bufferutility # PNPM
yarn add bufferutility # Yarn
bun add bufferutility # Bun
```

You can then start using the package by requiring it from your application as such:

```js
import { BufferUtility } from 'bufferutility';
```

## Common Usage

### Create a new BufferUtility

```js
import { BufferUtility } from 'bufferutility';

const buffer = new BufferUtility();

console.log(buffer);
// <BufferUtility>

buffer[0] = 0xfa; // or buffer.writeByte(0xfa, 0);

console.log(buffer);
// <BufferUtility fa>

console.log(buffer[0]); // or console.log(buffer.readByte(0));
// 250
```

### Create a BufferUtility with different modules

BufferUtility actually have 3 modules you can use
 - `Uint8ArrayModule` (compatible with Node and Bun): It use an Uint8Array to store the data (default module).
 - `NodeBufferModule` (compatible with Node): It use a NodeJS Buffer to store the data.
 - `FileSystemModule` (compatible with Node and Bun): It use a file to store the data (permit "infinite" size).

```js
// Uint8Array module
import { BufferUtility, Uint8ArrayModule } from 'bufferutility';

const Uint8Buffer = new BufferUtility([], {
  module: Uint8ArrayModule
});

Uint8Buffer.writeByte(15);

console.log(Uint8Buffer.buffer) // Uint8Array(1) [ 15 ]

// Node Buffer module
import { BufferUtility, NodeBufferModule } from 'bufferutility';

const NodeBuffer = new BufferUtility([], {
  module: NodeBufferModule
});

NodeBuffer.writeByte(15);

console.log(NodeBuffer.buffer) // <Buffer 0f>

// File System module
import { BufferUtility, FileSystemModule } from 'bufferutility';

const FSBuffer = new BufferUtility("file.txt", {
  module: FileSystemModule
}); 

FSBuffer.writeString("data");

import { readFileSync } from 'fs';

console.log(readFileSync("file.txt", "utf8")) // data

// FSBuffer.buffer return the file descriptor
```

## Function: BufferUtility

### isBufferUtility(obj)

- `obj` : `<Object>`
- Returns : `<boolean>`

Returns `true` if `obj` is a `BufferUtility`, `false` otherwise.

```js
const buf1 = new BufferUtility("a BufferUtility");
const buf2 = Buffer.from("a Node Buffer");

console.log(BufferUtility.isBufferUtility(buf1));
// true

console.log(BufferUtility.isBufferUtility(buf2));
// false
```

### byteLength(string[, encoding])

See https://nodejs.org/api/buffer.html#buffer_static_method_buffer_bytelength_string_encoding

## Class: BufferUtility

### new BufferUtility([data[, opts]])

- `data` : `<String>` | `<Array>` | `<Buffer>` | `<Uint8Array>` | `<Number>` A property determinate the value of the BufferUtility. Default: `undefined` (empty)
- `opts` : `<Object>` Set of configurable options to set on the Buffer. Can have the following fields:
  - `module` : `<Module>` The module used by the Buffer. Default: `<Uint8ArrayModule>`.
  - `maxArrayLength` : `<Number>` The max length an ArrayBuffer can take. Default: `buffer.kMaxLength`.
  - `returnAsBigIntIfOverflow`: `<Boolean>` Return a BigInt for read functions if value is under Number.MIN_SAFE_INTEGER or greater than Number.MAX_SAFE_INTEGER. Default: `true`.
  - `returnAsBigInt`: `<Boolean>` Always return a BigInt for read functions (override `returnAsBigIntIfOverflow`). Default: `false`.
  - `offset` : `<Number>` The forced start offset of the buffer source. Default: `0`.
  - `length` : `<Number>` The forced length of the buffer source. Default: `buf.length`.
- Returns : `<BufferUtility>`

Create a new BufferUtility instance from `data` and `opts` properties

```js
const buf1 = new BufferUtility(); // Empty buf
const buf2 = new BufferUtility("test"); // Buf with test in bytes
const buf3 = new BufferUtility(64); // Alloc 64 bytes
const buf4 = new BufferUtility([54, 76]); // Buf with bytes 54 and 76
```

# More documentation

More documentation on this readme will come soon, they are approximately the same as the version 2. You can check them here https://github.com/pharuxtan/BufferUtility/blob/v2/README.md#bufferutility

`read7BitEncodedInt`/`read7BitEncodedInt64`/`write7BitEncodedInt`/`write7BitEncodedInt64` is replaced by `readULEB128`/`writeULEB128`/`readSLEB128`/`writeSLEB128`