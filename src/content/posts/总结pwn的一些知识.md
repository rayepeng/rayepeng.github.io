---
title: '总结pwn的一些知识'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
# 泄露libc基址

libc中的函数相对于libc的基地址的偏移都是确定的，如果有一道题给你了libc的文件，就可以通过libc文件泄露出system函数和binsh的地址，然后再构造payload。

一般通过write函数来泄露

> payload 一般是填充字符（栈的大小）+ ‘aaaa’（覆盖EBP）+  p32(write_plt) + p32(start)(返回地址） + p32(1)+ p32(write_got)+p32(4)

除了之上提到的方法之外，还可以通过double free的方式来泄露
double free需要伪造整个chunk并且欺骗操作系统

## double free的原理
free函数在释放堆块时， 会通过隐式链表判断相邻前后堆块是否为空闲堆块
如果是空闲就会进行合并了， 之后利用unlink机制将该空闲堆块从unsorted bin中取下，
