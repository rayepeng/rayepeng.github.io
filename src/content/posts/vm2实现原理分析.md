---
title: 'vm2实现原理分析'
date: 2020-06-06
updated: 2020-07-08
category: '代码审计'
tags:
  - 'vm2'
lang: 'zh'
draft: false
---
本文首发于安全客 [https://www.anquanke.com/post/id/207283](https://www.anquanke.com/post/id/207283)

# vm2实现原理分析

前言：vm是nodejs实现的一个沙箱环境，但是官方文档并不推荐使用vm来运行不可信任的代码，vm2则是一个npm包，在vm的基础上，通过es6新增的代理机制，来拦截对外部属性的访问，那么这个沙箱是否安全呢？本文针对vm2的实现原理，从源码的层面进行分析，看vm2究竟做了些什么。

## vm API

vm2是在vm的基础上实现的沙箱，所以内部调用的还是vm的API，在vm中运行一个沙箱环境：

!\[\](vm2实现原理分析/Sun, 31 May 2020 092059-1591428069572.png)

相应的代码：

```js
const vm = require('vm');

const context = {
  animal: 'cat',
  count: 2
};

const script = new vm.Script('count += 1; name = "kitty";'); //编译code

vm.createContext(context); // 创建一个上下文隔离对象
for (let i = 0; i < 10; ++i) {
  script.runInContext(context); // 在指定的下文里执行code并返回其结果
}

console.log(context);
// 打印: { animal: 'cat', count: 12, name: 'kitty' }
```

将代码编译为 `script`，然后创建一个上下文 `vm.createContext(context)` ，最后我们将编译好的脚本放在一个上下文中运行 `script.runInContext`

当然也可以不用那么麻烦，直接在沙箱中运行一段代码

```js
const vm = require("vm");
console.log(vm.runInNewContext("let a = 2;a")); //2
```

如果不提供上下文变量，那么vm会自己创建一个隔离的上下文context。

显而易见，vm中最关键的就是 上下文`context` ，vm能逃逸出来的原理也就是因为 `context` 并没有拦截针对外部的 `constructor` 和 `__proto__`等属性 的访问

## vm2 API

`vm2`的代码包中主要有四个文件 `cli.js`,`contextify.js`,`main.js` 和 `sandbox.js`

-   `cli.js` 实现vm2的命令行调用
-   `contextify.js` 封装了三个对象， `Contextify` 和 `Decontextify` ，并且针对 global 的Buffer类进行了代理
-   `main.js` vm2执行的入口，导出了 `NodeVM`, `VM` 这两个沙箱环境，还有一个 `VMScript` 实际上是封装了 `vm.Script`
-   `sadbox.js`针对 `global` 的一些函数和变量进行了hook，比如 `setTimeout`，`setInterval` 等

vm2相比vm做了很大的改进，其中之一就是利用了es6新增的 proxy 特性，从而拦截对诸如 `constructor` 和 `__proto__` 这些属性的访问

在vm2 中运行一段代码，如下

```js
const {VM, VMScript} = require("vm2");

const script = new VMScript("let a = 2;a");

console.log((new VM()).run(script));
```

其中 VM 是vm2在vm的基础上封装的一个虚拟机，我们只需要实例化之后调用 `run` 方法即可运行一段脚本。

## vm2运行原理

vm2在运行代码的时候，会做如下事情，我们将上文的代码拆分开来。

```js
const {VM, VMScript} = require("vm2");

const script = new VMScript("let a = 2;a");

let vm = new VM();

console.log(vm.run(script));
```

运行的代码和vm2对应的实现：

![](./attachments/vm2-Page-2-1591428075172.png)

当我们创建一个VM的对象的时候，vm2内部引入了 `contextify.js`，并且针对上下文 `context` 进行了封装，最后调用 `script.runInContext(context)` ，可以看到，vm2最核心的操作就在于针对`context`的封装。

## vm2 是如何封装上下文的

> 注：由于vm2出现过多次逃逸的问题，所以现有的代码进行了大量的修改，为了方便分析vm2的实现原理，需要clone源码并且回退到 7ecabb1 使用 `git reset --hard 7ecabb1` 即可回退

我们看到，vm2 引入了 `contextify.js` ，将 `vm.createContext`创建的上下文作为参数传入。

其中引入 `contextify.js` 的代码比较独特，是调用vm的API将 `contextify.js` 封装为一个匿名函数

```js
Reflect.defineProperty(this, '_internal', {
	value: vm.runInContext(`(function(require, host) { ${cf} \n})`, this._context, {
		filename: `${__dirname}/contextify.js`,
		displayErrors: false
	}).call(this._context, require, host)
});
```

`host` 传入需要用的一些对象

```js
const host={version:parseInt(process.versions.node.split('.')[0]),console,String,Number,Buffer,Boolean,Array,Date,Error,RangeError,ReferenceError,SyntaxError,TypeError,RegExp,Function,Object,VMError,Proxy,Reflect,Map,WeakMap,Set,WeakSet,Promise};
```

那么vm2中的 `contextify.js` 究竟做了什么呢？

最开始定义了一些常量，并且在global和this上添加了相应的属性

```js
// eslint-disable-next-line no-invalid-this, no-shadow
const global = this;

// global is originally prototype of host.Object so it can be used to climb up from the sandbox.
Object.setPrototypeOf(global, Object.prototype);

Object.defineProperties(global, {
	global: {value: global},
	GLOBAL: {value: global},
	root: {value: global},
	isVM: {value: true}
});
```

由于是在函数体外部写了 return 语句，所以webstrom报错，但是实际上这段代码是会被封装到函数中的

```js
function(host, require){...}
```

![](./attachments/image-20200530152550918-1591428078972.png)

`Contextify` 和 `Decontextify` 都是两个 `WeakMap`

```js
const Contextified = new host.WeakMap();
const Decontextified = new host.WeakMap();
```

WeakMap 是 es6 新增的语法，只接受对象作为键名，并且这些对象是不会被计入垃圾回收机制的，这是为了防止内存泄漏。稍后将会看到，这是用来存储已经被代理过的对象的。

我们看下第512行， `Contextify.readonly` 做了些什么

```js
const LocalBuffer = global.Buffer = Contextify.readonly(host.Buffer, {
	allocUnsafe: function allocUnsafe(size) {
		return this.alloc(size);
	},
	allocUnsafeSlow: function allocUnsafeSlow(size) {
		return this.alloc(size);
	}
});
```

函数调用图如下：

!\[\](vm2实现原理分析/vm2-Page-3 (1)-1591428083714.png)

你可能会很好奇，为什么需要调用这么多层方法，最后返回的又是一个什么呢？

我们先来看最后一个调用的方法 `Contextify.object`,从这里可以很清楚地看到，最后返回了一个代理对象，并且其中还做了一个 `Object.assign` 的操作

![](./attachments/image-20200531094815527-1591428086001.png)

`Object.assign` 方法用于将所有可枚举属性的值从一个或多个源对象复制到目标对象。它将返回目标对象。

比如

```js
const target = { a: 1, b: 2 };
const source = { b: 4, c: 5 };

const returnedTarget = Object.assign(target, source); // Object { a: 1, b: 4, c: 5 }
```

也就是说 `source` 的b 会覆盖掉 target的 `b` 了

那么在上图的操作中， `deepTraps > traps > {get:..., set: ...}` (大于符号代表会覆盖)

那么我们来看下此时的 `deepTraps` 是什么

![](./attachments/image-20200530154835380-1591428091360.png)

你会发现， `set, setPrototypeOf ..` 这些方法的返回值都是 false，也就是说当你去调用 `Buffer.a = 1` 的时候(会被代理的set方法拦截)，是无法成功的

那么此时的 `traps` 呢

![](./attachments/image-20200530155017652-1591428100387.png)

这些方法倒是并不会返回false，但是也会在合并的时候，覆盖掉前一个对象的 `get和getPrototypeOf`

那至于之前调用的那么多方法，只是为了区分这个对象是哪种类型的，从而给它加上不同的 `deepTraps` ，到最后一个 `Contextify.object` 方法调用的时候，将它们合并。

最终，我们得到了这样一个 `Buffer` 代理对象，

![](./attachments/image-20200530155404796-1591428103202.png)

这个 `Buffer` 代理拦截了如下操作

![](./attachments/image-20200530155454090-1591428105637.png)

实际上这个 `Buffer` 本身还是nodesj提供的，但是vm2加了一层代理，所以在vm2的沙箱中访问它的属性时就会被设定的方法拦截

除此之外，`Contextify.object` 内部还使用了 `WeakMap` 来存储已经代理过的对象和对象的代理。

![](./attachments/image-20200530154336238-1591428108013.png)

所以在vm2的沙箱环境中，如果是内部的对象，由于vm的实现机制保证了内部定义的对象无法逃逸。如果是外部引入的对象，由于vm2提供的代理机制拦截了 `constructor` 等属性的访问，从而在很大程度上保证了这个沙箱是安全的。

![](./attachments/image-20200531094815527-1591428110937.png)

## 代码举例

为了更深入的了解vm2，我们来调试一段代码

测试方法,在 `main.js` 中编写如下代码：

```js
const {VM, VMScript} = require('vm2');
const fs = require('fs');
const file = `${__dirname}/sandbox.js`;

// By providing a file name as second argument you enable breakpoints
const script = new VMScript(fs.readFileSync(file), file);

console.log(new VM().run(script));
```

然后在 `sandbox.js` 中编写

```js
let a = Buffer.from(""); //访问Buffer的from属性并调用
a.i = () => {}; //给对象添加属性
console.log(a.i); //访问对象的属性
```

这样可以在 `sandbox.js` 中下断点，方便调试运行在沙箱中的代码

前面已经提到 `Buffer` 是一个代理对象，访问其所有属性都会被拦截

![](./attachments/image-20200601145937093-1591428121092.png)

其调用过程如下

![](./attachments/vm2-Page-4-1591428124235.png)

我们看到，`Buffer` 代理对象访问其 `from` 属性，被代理的 `get` 方法拦截，经过层层的调用，最终返回一个函数代理对象

![](./attachments/t0112683473174f27fe-1591428127103.png)

之后调用这个函数，就会被 `apply` 捕获到，拦截的方法如下：

```js
apply: (target, context, args) => {
    try {
        context = Decontextify.value(context);

        // Set context of all arguments to host's context.
        return Contextify.value(fnc.apply(context, Decontextify.arguments(args)));
    } catch (e) {
        throw Contextify.value(e);
    }
}
```

调用过程如下：

![](./attachments/vm2-Page-5-1591428129741.png)

按照proxy的规范，target就是未代理之前的函数，context是函数当前运行的上下文，这里是 `Buffer` 的代理，args是函数的参数，这里是 `""`

这里调用了 `Decontextify.value` ，实际上 `Decontextify` 的实现和 `Contextify` 是对称的，只是略微有一点细节上的区别。`Decontextify.value` 首先会检查 `Contextified` 中是否有这个对象，如果有直接返回，否则也会针对其进行一层代理

从这个函数调用过程中我们看到，虽然vm2是针对很多对象都做了代理，但是当实际要发生一次函数调用的时候，必须要将代理的 “外壳” 给剥除掉，并且必须依靠nodejs提供的API来完成，而如果我们能够捕获到这个被剔除代理的对象，那么就能完成vm2的逃逸，这是vm2沙箱逃逸的核心原理

之后执行

```js
a.i = () => {};
```

给a的属性i赋值，被代理的 `set` 方法拦截

![](./attachments/image-20200531111221966.png)

这个时候的 `value` 是一个函数， `Decontextify.value` 针对其进行了封装，返回一个函数的代理，但是这个函数的代理中：

![](./attachments/image-20200531111430529.png)

我们看到，如果我们访问这个函数代理对象的 `constructor` 属性，返回的是 `host.Function` !

那我们之后将其取出来是不是就能逃出沙箱了呢？

我们看最后一行代码

```js
console.log(a.i); //访问对象的属性
```

此时a内部的i对象，实际上是一个函数的代理对象，当执行 `a.i` 时，会被代理对象a的 `get` 方法拦截

![](./attachments/image-20200531111650333.png)

而不幸的是，vm2的作者显然考虑到了这一点，通过 `Contextify.value` ，取出被代理之前的对象，所以最终我们得到的还是原来的函数。

![](./attachments/image-20200531111825969.png)

这样我们就无法获得那个被代理的函数对象了。但是这里终究是有隐患的，如果我们能够获得这个被代理的对象，那么就能借此逃溢出vm2沙箱。至于究竟如何做到，请看下文vm2沙箱逃逸分析
