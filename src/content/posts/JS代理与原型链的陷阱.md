---
title: JS代理与原型链的陷阱
published: 2025-10-29
description: ''
customSlug: 'js-proxy-and-prototype-chain-trap'
image: 'https://picgo-1258058044.cos.ap-chengdu.myqcloud.com/img/jsproxy.png'
tags: ['JavaScript', '编程']
category: '编程'
draft: false 
lang: ''
---


```js
var o1,o2,o3,o4

o1 = { coin: 11 };

let handler = {
  get(target, prop, receiver) {
    console.log(`Getting ${prop}!`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.info(target === o1, receiver === o4)
    console.log(`Setting ${prop} to ${value}!`);
    return target[prop]=value;
  }
}

o2 = new Proxy(o1,  handler);
o3 = Object.create(o2);
o4 = Object.create(o3);

o4.coin = 44;

console.info(o1.coin, o2.coin, o3.coin, o4.coin);
```

看上去只是一个很简单的 o4.coin = 44 ，但是却会涉及到原型链的修改

原型链是这样：

```
o4 --> o3 --> o2(Proxy) --> o1
```


handler中的代码：

```js
set(target, prop, value, receiver) {
  console.info(target === o1, receiver === o4)
  console.log(`Setting ${prop} to ${value}!`);
  return target[prop] = value;
}
```

这里的target是指向o1， receiver则是指向o4

- o1.coin = 44 ✅，因为 set handler 实际上修改的是 o1；
- o2.coin = 44 ✅，Proxy 读取的是 o1；
- o3.coin = 44 ✅，通过原型链 o3 → o2(Proxy) → o1；
- o4.coin = 44 ❌，因为 o4 自身并没有 coin 属性，仍然会沿原型链读取最终到 o1，值是 44。

最终打印结果为：

```bash
true true
Setting coin to 44!
Getting coin!
Getting coin!
Getting coin!
44 44 44 44
```

## target vs receiver?

- target 是你传给 Proxy 构造函数的原始对象（例如 o1）；
- receiver 是实际访问/调用的对象（比如赋值时是 o4）；
- receiver 是 希望在哪个对象上定义属性 的“调用者”，特别关键在继承场景中。

因此在 handler中，应该使用Reflect来做，而不是手动赋值

```js
set(target, prop, value, receiver) {
  return Reflect.set(target, prop, value, receiver);
}
```


## 测试getter和setter

```js
var o1, o2, o3, o4;

o1 = { coin: 11 };

// 在 o2 上定义 getter 和 setter，模拟 Proxy 的行为
o2 = Object.create(o1);

Object.defineProperty(o2, 'coin', {
  get() {
    console.log(`Getting coin!`);
    return o1.coin;
  },
  set(value) {
    console.info(o1 === o1, true); // 模拟 Proxy 中 target === o1, receiver === o4
    console.log(`Setting coin to ${value}!`);
    o1.coin = value;
  },
  configurable: true,
  enumerable: true,
});

o3 = Object.create(o2);
o4 = Object.create(o3);

// 测试写入
o4.coin = 44;

// 输出每个对象的 coin 值
console.info(o1.coin, o2.coin, o3.coin, o4.coin);
```


如上，会遇到同样的问题，此时输出是：

```bash
true true
Setting coin to 44!
Getting coin!
Getting coin!
Getting coin!
44 44 44 44
```

