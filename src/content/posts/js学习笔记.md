---
title: 'js学习笔记'
date: 2020-04-21
updated: 2020-04-25
category: '编程'
tags:
  - 'js'
lang: 'zh'
draft: false
---
## Object对象

### 静态方法

Object.keys()，Object.getOwnPropertyNames()

可以用来遍历对象的属性

```js
var obj1 = {
    "name":"pxy",
    "age":12
}
//undefined
Object.getOwnPropertyNames(obj1)

//(2) ["name", "age"]
```

### 实例方法

Object.protype上定义的方法就是实例方法，能够被Object的实例调用

```js
Object.getOwnPropertyNames(Object.prototype)

(12) ["constructor", "__defineGetter__", "__defineSetter__", "hasOwnProperty", "__lookupGetter__", "__lookupSetter__", "isPrototypeOf", "propertyIsEnumerable", "toString", "valueOf", "__proto__", "toLocaleString"]
0: "constructor"
1: "__defineGetter__"
2: "__defineSetter__"
3: "hasOwnProperty"
4: "__lookupGetter__"
5: "__lookupSetter__"
6: "isPrototypeOf"
7: "propertyIsEnumerable"
8: "toString"
9: "valueOf"
10: "__proto__"
11: "toLocaleString"
length: 12
__proto__: Array(0)
```

这些方法是所有对象都公有的

### valueOf

`valueOf`方法的作用是返回一个对象的“值”，默认情况下返回对象本身。

```js
var obj = new Object();
obj.valueOf() === obj // true
```

但是这种情况除外：

```
var a = new Object(1)
a.valueOf() === a // false
```

`valueOf`方法的主要用途是，JavaScript 自动类型转换时会默认调用这个方法

```js
var obj = new Object();
1 + obj 
//"1[object Object]"
```

可以重写 `valueOf` 方法

```js
obj.valueOf = function(){
    return 2;
}
1+obj
//3
```

这个很好理解，因为obj查找 `valueOf` 函数，会先从自己的属性开始找，找不到就通过 `__proto__` 找上层对象的`valueOf` 属性

## 编码风格

### switch case 结构

不推荐如下的方式

```js
function doAction(action) {
  switch (action) {
    case 'hack':
      return 'hack';
    case 'slash':
      return 'slash';
    case 'run':
      return 'run';
    default:
      throw new Error('Invalid action.');
  }
}
```

推荐使用对象的方式

```js
function doAction(action) {
  var actions = {
    'hack': function () {
      return 'hack';
    },
    'slash': function () {
      return 'slash';
    },
    'run': function () {
      return 'run';
    }
  };

  if (typeof actions[action] !== 'function') {
    throw new Error('Invalid action.');
  }

  return actions[action]();
}
```

更加简洁
