---
title: 'pwn真的入门了吗？'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
好多之前学到的东西，命令都记不住
所以 继续总结pwn的一些基础知识

## 0x01 pwntools
python的一个pwn模块
有很多好用的命令

**pwn template**

![这个命令可以用来生成pwn exp的模板](https://upload-images.jianshu.io/upload_images/10651191-6b2819518bc89cfc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**shellcraft**
可以用来生成很多地shellcode
![](https://upload-images.jianshu.io/upload_images/10651191-87d61b5a8ef411a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**asm**
汇编
```python
In [3]: asm(shellcraft.sh())
Out[3]: 'jhh///sh/bin\x89\xe3h\x01\x01\x01\x01\x814$ri\x01\x011\xc9Qj\x04Y\x01\xe1Q\x89\xe11\xd2j\x0bX\xcd\x80'
```
与此相反的disasm可以反汇编

![](https://upload-images.jianshu.io/upload_images/10651191-d2f9984f69fe1b7f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**cyclic**
可以生成指定长度的字符串，同时利用它可以计算出偏移量

默认是Linux i386环境

pwn exp的模板
![](https://upload-images.jianshu.io/upload_images/10651191-a0a957a6e16cdeb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
