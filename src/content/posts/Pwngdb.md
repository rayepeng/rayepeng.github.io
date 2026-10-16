---
title: 'Pwngdb'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
原来除了pwndbg之外还有一个叫做pwngdb的工具

今天尝试了一下感觉挺好用的

常用的命令：
* libc: 打印libc的基地址
* ld: 打印ld的基地址
* codebase: 打印数据段的基地址
* heap: 打印堆的基地址
* got: 打印got表的相关信息
* dyn: 打印动态段信息
* findcall: 找到一些函数调用
* bcall: 在函数调用上设置断点
* tls: 打印线程本地存储地址
* at: 附加进程
* findsyscall: 找到系统调用
* fmtarg: 计算格式化字符串的index（前提是需要在printf处设置断点
* force: 计算nb 在house of force(没看懂英文）
* heapinfo: 打印一些堆的信息

* heapinfoall: 打印所有线程的堆信息
* arenainfo: 打印所有arena的信息
* chunkinfo: 打印所有chunk的信息
* chunkptr: 打印chunk的信息
* mergeinfo: 打印merge的信息
* printfastbin: 打印fastbin的信息
* tracemalloc on : 跟踪malloc调用检测错误
* parseheap: 解析堆的布局
* magic: 打印有用的变量和函数(glibc)
* fp: 展示文件结构
* fpchain: 展示文件链接信息

gef插件
* heap chunks <location>
* heap arenas 
* heap bins
