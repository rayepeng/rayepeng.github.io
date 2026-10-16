---
title: '如何创建swap分区'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
# swap分区
在学操作系统内存分配的时候会接触到swap分区， 书上说是交换分区。 主要作用就是将一些内存占用比较大的进程暂时调出来。

# 使用实体分区创建的swap分区

具体过程如下:

## 分区

---
了解一下 `gdisk `命令
**gdisk**， 用于磁盘分区。 注意：
> MBR分区表使用fdisk命令， GPT分区表使用gdisk命令

`lsblk `可以列出系统上所有的磁盘列表

`blkid` 列出设备的UUID参数

`parted` 列出磁盘分区表类型与分区类型

---
分区之前先使用 `lsblk` 或者 `blkid `找到磁盘， 再用 `parted /dev/xxx print ` 来找出内部的分区表类型和分区类型。 之后才使用 `gdisk `或者 `fdisk `来操作系统

## 格式化

## 使用

## 观察

---
摘自鸟叔的Linux私房菜， 不过这一部分的章节还是没看懂。

所有的实体磁盘的文件名都已经仿真为 /dev/sd[a-p] 格式 。 第一颗磁盘文件名为 /dev/sda。

虚拟机的磁盘通常为 /dev/vd[a-p] 格式
