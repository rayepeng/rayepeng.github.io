---
title: 'gcc指令'
date: 2019-01-01
category: '汇编'
tags: []
lang: 'zh'
draft: true
---
> 要弄懂命令的意思， 还是需要直接去翻阅doc
# 编译选项的作用

> gcc --help={common|optimizers|params|target|warnings|...

Display specific types of command line options.
命令帮助的归类

* \- E 
只进行预处理 Preprocess only ; do not complie , assemble, or  link
不做编译， 汇编，和链接。 但是不生成文件， 需要进行重定向
> gcc -E hello.c > hello.txt

* -S 
Compile only ; do not assemble or link
只进行编译， 不进行汇编和链接。 得到一个后缀为 .s 的汇编文件

* -c
compile and assemble, but do not link
编译和汇编， 但是不进行链接。 也就是做成一个obj文件。 得到一个后缀为 .o 的文件

* -o
将输出指定到某个文件

* -g
generate debug information in debug format
产生debug信息

* -x
指定文件的语言， 使得后缀名失效。如果是 `-x none` 则让gcc根据文件后缀名识别

---
补充一下Linux dump命令

# dump命令
备份文件系统

# 实例
> dump -0 -u /dev/tape /home/

-0 指定被分等级
-u 要求备份完毕之后将响应的信息存储到文件 /etc/dumpdates 留做记录

---

下图是gcc的编译程序的过程
![gcc编译过程](http://upload-images.jianshu.io/upload_images/10651191-8f4ba1c3bd5066c1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#  几个问题
* 写代码的时候， include的库文件在哪？gcc又是怎么知道的

一般的头文件或者库文件的位置在：
/usr/include及其子目录底下的include文件夹
/usr/local/include及其子目录底下的include文件夹
/usr/lib
/usr/local/lib
/lib

比如常见的` stdio.h `
就位于  `/usr/include `这个文件夹下
至于gcc为什么能够找到， 估计是环境变量的作用

* 编译和汇编？

-S 能够生成一个 `.s` 文件, 也就是汇编语言所写的文件
这个过程叫做编译， 编译就是指生成汇编语言的过程

而反汇编，也就是从可运行的程序 得到汇编语言所写的文件。

汇编是生成目标文件的过程

#参考资料
https://www.cnblogs.com/Leo_wl/p/5457112.html
