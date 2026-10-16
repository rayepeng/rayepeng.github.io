---
title: 'gdb及其插件'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
要想学会调试pwn
就得先学会使用gdb及其插件

# gdb基本命令

## 运行时查看代码

l 显示代码

![](https://upload-images.jianshu.io/upload_images/10651191-ad03ac6920507092.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

或者直接查看地址的部分

![](https://upload-images.jianshu.io/upload_images/10651191-42b1f420ac8e3c6c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 查看内存

x/<n/f/u> <addr>

n是一个正整数，表示需要显示的内存单元的个数，也就是说从当前地址向后显示几个内存单元的内容，一个内存单元的大小由后面的u定义。

u 表示从当前地址往后请求的字节数，如果不指定的话，GDB默认是4个bytes。u参数可以用下面的字符来代替，b表示单字节，h表示双字节，w表示四字 节，g表示八字节。当我们指定了字节长度后，GDB会从指内存定的内存地址开始，读写指定字节，并把其当作一个值取出来。

 x 按十六进制格式显示变量。

d 按十进制格式显示变量。

u 按十六进制格式显示无符号整型。

o 按八进制格式显示变量。

t 按二进制格式显示变量。

a 按十六进制格式显示变量。

c 按字符格式显示变量。

f 按浮点数格式显示变量。

# 关于peda

aslr显示/设定GDB的ASLR(地址空间配置随机加载)设置 

checksec 检查二进制文件的各种安全选项 

dumpargs 函数将要被调用时，显示将要被传入函数的所有参数(默认会在反汇编代码下方自动显示)

dumprop  在给定内存范围中Dump出所有ROP gadgets 

elfheader – Get headers information from debugged ELF file

elfsymbol – 获取non-debugging symbol信息（plt表） 

vmmap – 可以用来查看栈、bss段是否可以执行 

# gdb attach

ps命令查看进程id。 
执行gdb attach pid即可调试正在运行的程序。 
info proc显示当前程序可执行文件相关信息（name，pwd）

b pkt.c:22(在pkt.c文件的22行打断点) 
b eth_rcv （在函数eth_rcv入口打断点） 
info b；显示当前所有断点； 
d num；删除断点num； 
n num；向后执行num步

bt显示当前函数的调用过程；

# 参考

[https://blog.csdn.net/lovemysea/article/details/78397532](https://blog.csdn.net/lovemysea/article/details/78397532)
