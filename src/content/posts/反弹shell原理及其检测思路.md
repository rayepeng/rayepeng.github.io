---
title: '反弹shell原理及其检测思路'
date: 2020-04-03
updated: 2020-07-01
category: 'CTF'
tags:
  - 'CTF'
  - 'shell'
lang: 'zh'
draft: false
---
## 反弹shell的原理

### 文件描述符与重定向

先来看这个

![](https://cdn.jsdelivr.net/gh/xinyongpeng/image/img20200701200903.png)

第一个 `>` 符号，将标准输出的内容重定向到文件 `test.txt`

第二个 `<` 符号，似乎不太好理解？

在我们的印象中，cat似乎就是用来读文件的，但是实际上，cat还可以这么用：

![](https://cdn.jsdelivr.net/gh/xinyongpeng/image/img20200701201351.png)

也就是说，我们输入的数据，cat 会原封不动的打印出来

> cat 可以接收标准输入的数据，将其打印在标准输出(屏幕)上

于是我们就可以将标准输入这个文件描述符指向 `test.txt`，从而打印其内容

实际上，

-   `<` 称为输入重定向符，`<` 等价于 `0<`
-   `>` 称为输出重定向符， `>` 等价于`1>`

不行你看

![](https://cdn.jsdelivr.net/gh/xinyongpeng/image/img20200701201729.png)

实际上，Linux中总共提供了三个文件描述符

-   0 标准输入
-   1 标准输出
-   2 标准错误输出

这三个文件描述符，实际上就是三个指针，我们可以随时改变它们的指向。比如上文提到的，将标准输出指向了一个文件，将标准输入也指向了一个文件。

同样的，标准错误输出也可以重定向到一个文件中，不过由于 `>` 默认等价于 `1>`，所以我们需要写明

![](https://cdn.jsdelivr.net/gh/xinyongpeng/image/img20200701202131.png)

### 文件描述符与重定向进阶
