---
title: TS挑战记录(一)
published: 2023-07-29
description: ''
image: ''
tags: ['post', 'TS', '学习', '记录', '编程']
category: '周报'
draft: false
lang: ''
---
 TS挑战记录(一)


<!-- ![vipul-jha-a4X1cdC1QAc-unsplash](./attachments/bafybeietch6wboqulomckko6fqwhyi735lbkohkug2brqzxupzmvt4r5t4.jpeg) -->

 TS挑战记录(一)

题目记录在这里： [https://github.com/type-challenges/type-challenges/blob/main/README.md](https://github.com/type-challenges/type-challenges/blob/main/README.md)

这个挑战主要是让挑战者更好的了解TS的类型系统，通过 `type` 这个语法来实现TS中的各种功能，感觉还挺有意思的！

同是`type`是一个图灵完备的系统？也就是可以实现类似`C++`template的元编程？🤔有空可以好好研究下：
[https://github.com/microsoft/TypeScript/issues/14833](https://github.com/microsoft/TypeScript/issues/14833)

Hello World挑战：

```ts
// expected to be string
type HelloWorld = any

// you should make this work
type test = Expect<Equal<HelloWorld, string>>
```

第一个示例主要是展示 `type` 的用法，答案：

```ts
type HelloWorld = string
```


> 既然这题题目本质上都是为了让你给理解type的用法，那先记录下学习type的一些笔记，不然后面的题目真的看不懂了

 type的主要用法

这里先总结一下 type 的主要用法，防止后面的代码看不懂（其实我就是先做题再反过去学type关键字的😅）

 1. 基本类型别名

```ts
type Word = string;
```

这个很好理解，自定义一个类型 `Word` ，用来替代 `string` 

 2. 联合类型

```ts
type StringOrNumber = string | number;
```

这里开始复杂起来了，不过可以理解为一个 `union` ，通过 `StringOrNumber`  可以声明 string 或者 number 类型的变量

注意这里的类型也可以是字面量类型，如

```ts
type ABC = "A" | "B" | "C"
```

这就表明ABC类型的变量值只能是 `"A","B","C"` 这三者之一

 3. 交叉类型

```ts
type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged;
```

如果要使用该交叉类型，则

```ts
let person: Person = {
    name: 'Alice',
    age: 30
};
```

 4. typeof && keyof

`typeof` 是获取一个变量或值的类型，有点类似`C++` 的type，但是用途更广泛

比如对一个函数使用 `typeof` 操作符，可以获得函数对应的类型，有点类似 `C++` auto自动推导

```ts
const foo = (arg1: string, arg2: number): void => {}
```

通过 `typeof` 来定义参数类型

```ts
const bar = (f: typeof foo) => {
  f("Hello", 42);
}
```


`keyof` 则是获取一个类型的所有键名，如下示例

```ts
type Person {
  name: string;
  age: number;
}

type K = keyof Person;  // "name" | "age"
```

 extends 

extends 主要用于判断给定的泛型变量是否可以赋值给指定的类型

```ts
T extends U ? X : Y
```

> 当然，后续你会发现 extends 有很多神奇的用法 🤣

 in 

TS的in运算符除了常用法外，还可以用于遍历类型，可以作为元编程，举例如下：

```ts
type Keys = 'a' | 'b'

type MyMap<T> = {
  [K in Keys]: T
}
```

Keys 代表表示可以是 `'a'` 或者 `'b'` 这两种字面量类型

K in Keys则可以遍历这两种类型

最后的 `MyMap` 结构你可以理解成这样的：

```ts
{
	a: T, // 'a' 类型，其实key必须是a
	b: T // 'b' 类型，其实key必须是b
}
```


 infer 

infer的作用就是可以放在一个地方，用来指定推断出的类型（我反正这么理解的

看一个简单的示例：

这里我们用 `(...args: any) => infer R` 这里是一个函数的形式，想象 `infer R` 是一个整体，其实代表的是箭头函数的返回值，那么 `infer R` 自然就等于是返回值类型了

```ts
type ReturnType<T> = T extends (...args: any) => infer R ? R : any;
```

使用示例：可以看到 `ReturnType` 推断除了 R 是 `string` 类型

```ts
type T = (a: number) => string
type R = ReturnType<T> // string
```

> 补充完这些知识之后，就可以开始做题了 😉


 实现MyPick


```ts
interface Todo {
  title: string
  description: string
  completed: boolean
}

type TodoPreview = MyPick<Todo, 'title' | 'completed'>

const todo: TodoPreview = {
    title: 'Clean room',
    completed: false,
}
```

通过 `keyof` 可以获取类型的所有属性组成的字面量联合类型，然后通过in遍历即可

```ts
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```


 实现 MyReadonly

```ts
interface Todo {
  title: string
  description: string
}

const todo: MyReadonly<Todo> = {
  title: "Hey",
  description: "foobar"
}

todo.title = "Hello" // Error: cannot reassign a readonly property
todo.description = "barFoo" // Error: cannot reassign a readonly property
```

给属性加上 `readonly` 即可

```ts
type MyReadonly<T> = {
	readonly [P in keyof T]: T[P];
}
```


 Tuple to Object

```ts
const tuple = ['tesla', 'model 3', 'model X', 'model Y'] as const

type result = TupleToObject<typeof tuple> // expected { 'tesla': 'tesla', 'model 3': 'model 3', 'model X': 'model X', 'model Y': 'model Y'}
```

这个想法倒是不难，但是没想全，直接看答案了：

```ts
type TupleToObject<T extends readonly (keyof any)[]> = {
  [K in T[number]]: K;
};
```

有一些关键部分要解释下：
- `keyof any` 其实就是所有能表述的枚举类型，即 `string | number | symbol` ，因为 `any` 类型就是这三种 🤣
- `readonly (keysof any)[]` 表示所有只读的 `(string | number | symbol)[]`，即混合类型的数组
- `[K in T[number]]` 这里就是用 number 来表示数字字面量

> 这里为什么要用 `readonly (keyof any)[]` ？，而不是 `readonly any[]`

因为最后我们的呢结果是一个Object，而JS中Object的key只能是 `string`, `number` 和 `symbol` ，如果这里改成 `T extends readonly any[]`, 那么就可能导致 `undefined, boolean, null` 这样的值成为key从而报错


另外一个比较难理解的就是 `T[number]` ，这个看个示例就懂了

```ts
type Person = {
  name: string;
  age: number;
};

type PersonName = Person["name"];  // PersonName 将得到 "string" 类型
type PersonAge = Person["age"];  // PersonAge 将得到 "number" 类型
```

可以理解为通过 `T[K]` 的语法获得对应的 value 类型

依次类推：

```ts
type ArrayType = string[];

type ElementType = ArrayType[number];  // ElementType 将得到 "string" 类型

type TupleType = [string, number, boolean];

type TupleFirstElementType = TupleType[0];  // TupleFirstElementType 将得到 "string" 类型
type TupleSecondElementType = TupleType[1];  // TupleSecondElementType 将得到 "number" 类型
```

那么答案中的 `T[number]` 即表示数组中每个元素的类型，再通过 `K in T[number]` 即可获得每一个类型



 First of Array


```ts
type arr1 = ['a', 'b', 'c']
type arr2 = [3, 2, 1]

type head1 = First<arr1> // expected to be 'a'
type head2 = First<arr2> // expected to be 3
```


这题的思路因为要求数组第一个元素的类型，数组的元素类型可以是任意的（没有必须作为Object Key的限制）

如果直接取第一个元素

```ts
type First<T extends any[]> = T[0]
```

但是这里要判断数组是否为空，有两种判断方法

最简单的当然是：

```ts
type First<T extends any[]> = T extends [] ? never : T[0]
```

但是TS的类型，还可以当做值一样去运算，比如我们计算 `T['length']` 也是可以的，因此

```ts
type First<extends any[]> = T['length'] extends 0 ? never : T[0]
```


还有一种思路就是：把数组做分解，想不出来😓

```ts
type First<T extends any[]> = T extends [infer A, ...infer rest] ? A : never
```


 Length of Tuple


```ts
type tesla = ['tesla', 'model 3', 'model X', 'model Y']
type spaceX = ['FALCON 9', 'FALCON HEAVY', 'DRAGON', 'STARSHIP', 'HUMAN SPACEFLIGHT']

type teslaLength = Length<tesla>  // expected 4
type spaceXLength = Length<spaceX> // expected 5
```

这个直接取 `length` 属性即可，但也可以不`readonly`的，猜测是怕影响到原有的数组刻意加的吧

```ts
type Length<T extends readonly any[]> =  T['length']
```


 Exclude

```ts
type Result = MyExclude<'a' | 'b' | 'c', 'a'> // 'b' | 'c'
```

这个应该是最难理解的了，答案是这个：

```ts
type MyExclude<T, U> =  T extends U ? never : T;
```

明明 `extends` 只是判断 T 是否能被赋值为 U 类型，

但是实际这里的执行过程为

- `'a' extends 'a' ? never : 'a'`，返回 never
- `'b' extends 'a' ? never : 'b'`，返回`'b'`
- `'c' extends 'a' ? never : 'c'`，返回 `'c'`

最后结果拼接，自然返回就是 `'b' | 'c'` 了

参考这篇
[https://www.typescriptlang.org/docs/handbook/2/conditional-types.htmldistributive-conditional-types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.htmldistributive-conditional-types)

 Awaited

这个也是很难理解的🫠

```ts
type ExampleType = Promise<string>

type Result = MyAwaited<ExampleType> // string
```

刚开始看不是很简单吗，我直接

```ts
type MyAwaited<T> = T extends Promise<infer U> ? U : never;
```

> 但是你有没有考虑到`Promise`里面可能嵌套了 `Promise` 呢？

那就改进下：（对你没看错type居然还支持递归）

```ts
type MyAwaited<T extends Promise<any>> = T extends Promise<infer U>
  ? U extends Promise<any>
    ? MyAwaited<U>
    : U
  : never;
```


理论上这样应该就可以了吧，但是我看了点赞最多的一个答案如下：

```ts
type Thenable<T> = {
  then: (onfulfilled: (arg: T) => unknown) => unknown;
}

type MyAwaited<T extends Thenable<any> | Promise<any>> = T extends Promise<infer Inner>
? Inner extends Promise<any> ? MyAwaited<Inner> : Inner
: T extends Thenable<infer U> ? U : false
```


这就有点懵了，为什么还要额外定一个 `Thenable` 类型，并且额外判断这种情况呢？暂时也没想明白🤔
如果不自定义 `Thenable` 类型，也可以直接用 `PromiseLike` ，后面有空再研究下


 If

```ts
type A = If<true, 'a', 'b'>  // expected to be 'a'
type B = If<false, 'a', 'b'> // expected to be 'b'
```


这个就很简单了，第一个值必须 `extends boolean` ，并且需要判断是否能被赋值给 `true` 类型（注意直接写 `C ? T :F ` 是不行的 🤣

```ts
type If<C extends boolean, T, F> = C extends true ? T : F;
```


 Concat


```ts
type Result = Concat<[1], [2]> // expected to be [1, 2]
```

想不到吧，数组类型居然还支持 `...` 运算符

```ts
type Concat<T extends any[], U extends any[]> = [...T, ...U]
```

 Includes

```ts
type isPillarMen = Includes<['Kars', 'Esidisi', 'Wamuu', 'Santana'], 'Dio'> // expected to be `false`
```

这里看上去是要写一个循环，但实际根据 `extends`，如果是判断能否转为一个联合类型，则会展开然后依次判断，即


```ts
type Includes<T extends readonly any[], U> = U extends T[number] ? true : false
```

可以看到 `T[number]` 实际上是如下：

```ts
'Kars' | 'Esidisi' | 'Wamuu' | 'Santana'
```

然后 `U extends T[number]` 就会逐个去判断


 Push

```ts
type Result = Push<[1, 2], '3'> // [1, 2, '3']
```

这个也很简单了，直接展开T，并且加上U即可

```ts
type Push<T extends any[], U> = [...T, U]
```

 Unshift

```ts
type Result = Unshift<[1, 2], 0> // [0, 1, 2,]
```

很简单不细说了

```ts
type Unshift<T extends any[], U> = [U, ...T]
```

 Parameters

```ts
const foo = (arg1: string, arg2: number): void => {}

type FunctionParamsType = MyParameters<typeof foo> // [arg1: string, arg2: number]
```

这个也挺简单的，注意理清关系就好了

```ts
type MyParameters<T extends (...args:any) => any> = T extends (...args:infer P) => any ? P : never;
```
