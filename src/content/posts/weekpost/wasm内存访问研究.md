---
title: wasm内存访问研究
published: 2025-07-02
description: ''
image: ''
tags: ['post']
category: '周报'
draft: false
lang: ''
---
 wasm内存访问研究

---
title: wasm内存访问研究
tags:
---

 wasm内存越界读写测试

手工编写一个wasm模块，wat代码如下:

- 声明需要一段内存空间
- 暴露两个函数，写内存和读内存，之后在js代码中调用



```wasm
(module
  ;;声明需要提供内存
  (import "env" "memory" (memory 1 2)) ;; 初始 1 页，最大 2 页

  ;; 写入 i32 到内存[offset]
  (func (export "writeToMemory") (param i32) (param i32)
    (i32.store
      (local.get 0)
      (local.get 1)
    )
  )

  ;; 从内存[offset] 读取 i32
  (func (export "readFromMemory") (param i32) (result i32)
    (i32.load
      (local.get 0)
    )
  )
)
```

然后编译为为wasm模块

```bash
wat2wasm memory_test.wat -o memory_test.wasm 
```



编写js代码

```js
const fs = require('fs');

(async () => {
  const memory = new WebAssembly.Memory({ initial: 1, maximum: 2 });

  const importObject = {
    env: {
      memory: memory
    }
  };
  // 读取wasm，分配内存
  const wasmBuffer = fs.readFileSync('./memory_test.wasm');
  const wasmModule = await WebAssembly.instantiate(wasmBuffer, importObject);

  const { writeToMemory, readFromMemory} = wasmModule.instance.exports;

  const inBoundsOffset = 65532; // 正常偏移
  const outOfBoundsOffset = 70000; // 越界偏移

  // 测试正常写入和读取
  writeToMemory(inBoundsOffset, 123456);
  console.log("读取数据:", readFromMemory(inBoundsOffset));

  try {
    // 👇 试图越界写入
    console.log("尝试越界写数据");
    writeToMemory(outOfBoundsOffset, 999);
  } catch (err) {
    console.error("越界写错误:", err.message);
    console.log(err);
  }

  try {
    // 👇 试图越界读取
    console.log("尝试越界读数据");
    console.log(readFromMemory(outOfBoundsOffset));
  } catch (err) {
    console.error("越界读错误:", err.message);
    console.log(err);
  }
})();
```



运行结果，可以发现此时是报错的

```bash
❯ node main.js
读取数据: 123456
尝试越界写数据
越界写错误: memory access out of bounds
RuntimeError: memory access out of bounds
    at wasm://wasm/488cc87e:wasm-function[0]:0x59
    at /Users/rayepeng/Documents/code/wasm-memory-test/main.js:26:5
尝试越界读数据
越界读错误: memory access out of bounds
RuntimeError: memory access out of bounds
    at wasm://wasm/488cc87e:wasm-function[1]:0x61
    at /Users/rayepeng/Documents/code/wasm-memory-test/main.js:35:17
```



[]()