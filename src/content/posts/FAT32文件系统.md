---
title: 'FAT32文件系统'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
概念1：
簇

文件系统将磁盘空间以一定数目的扇区为单位进行划分，这样的单位称为簇

每扇区的大小是512字节

簇的大小一般是512B， 1KB， 2KB，等等

概念2

FAT表项
file allocation table 文件分配表

一种单向链式结构
FAT区用每一个FAT项来记录每一个簇的占用情况
FAT表中表项的个数 = 簇的个数
如果对应的簇的个数为0， 可存储数据

每个表项的大小
FAT32： 32位， 4字节
可表达的最大簇号空间为4G
FAT16 ： 最大簇号为64K

概念3 簇链
一个文件所占用的簇的序号形成的单向链表

实现方法
在文件占用簇的对应簇号的FAT项， 填写下一个簇的簇号， 如果为最后一簇，则输入结束标志FFFFFF0F

文件的存储

1. 按照文件大小定位足够空闲簇
2. 创建文件目录项
3. 在FAT表中构建簇链表
4. 在对应分配的簇中写入数据

目录项的含义
8.3 的文件名
后一个字节是文件属性

![](https://upload-images.jianshu.io/upload_images/10651191-6e51ce3bad27189a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

文件删除的实例

首簇的高位被清零
![](https://upload-images.jianshu.io/upload_images/10651191-4880e0eb458af1bc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-d62960cdc6beb171.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

文件内容其实没有变化

文件恢复的机理

文件被删除之后是否可以恢复

![](https://upload-images.jianshu.io/upload_images/10651191-26d8e0d9fc1ead91.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
