---
title: 'Linux文件与磁盘管理'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
#### 写在前面
还记得第一次安装虚拟机之后，安装VMware tools的痛苦经历，安装tools的时候会自动弹入一个.tar的文件， 当然我一看就知道是压缩文件， 但是在Linux的图形界面中是怎么也打不开的。 后来百度之后才知道需要用命令行去解压缩， 我的个乖乖， 那么长的文件名我硬是一个个输进去的。。。想想都觉得自己当时好zz

#### 磁盘管理

##### 磁盘的构造
这部分的内容其实是很重要的，但是我现在还不想写， 虽然这部分的内容我是看了不下很多次， 但是始终不是很明白。

##### Linux磁盘管理的命令
`df`
**用来检查文件系统的磁盘空间占用情况**
-a 列出所有的文件系统， 包括系统特有的/proc等文件系统
(记得曾经写过/proc是一个虚拟的文件系统)
df可以列出所有的文件系统但是不包括/proc等比较特殊的文件系统）
![df - a](https://upload-images.jianshu.io/upload_images/10651191-721790b4dbffc71a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里用的是WSL系统， 反映出的文件系统居然没有NTFS。emm不造了

-k , -m, -h 其中 -k是以KB， -m是以MB， -h以一种比较友好的方式显示出来
-H 以千进制 替换 1024进制
-T 显示文件系统类型
---
> 写道这里我突然明白了， 文件系统和文件系统类型是两个东西， 一个是FileSystem, 另外一个是 FileSystemType 这是不同的概念

![df -Tha](https://upload-images.jianshu.io/upload_images/10651191-b050045de693ff1e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

-i 不用硬盘容量， 而以inode的数量来显示

---
inode 的坑之后再补

`du`
**也是查看空间的， 但du是对文件和目录磁盘使用的空间的查看**
参数如下
-a 列出所有的文件与目录容量
-h 友好的方式
-s 列出总量
-S 不包括子目录下的总计
-k, -m 与df命令一样

`fdisk`
**磁盘分区表的操作工具**
-l 输出后面的接的装置所有的内容

`mkfs` 
**磁盘格式化命令**
> mkfs [-t 文件系统格式] 装置文件名

`fsck`
**用来检查和维护不一致的文件系统**
> fsck [-t 文件系统] [-ACay] 装置名称

`mount`  与`umount`
磁盘挂载与卸载命令

> mount [-t 文件系统] [-L Label名] [-o 额外选项] [-n]  装置文件名  挂载点

---
一次性写这么多我的懵了

这里补充一点笔记

> Linux 操作系统的文件数据除了文件实际内容外，通常含有非常多的属性，例如 Linux 操作系统的文件权限（rwx）与文件属性（拥有者、群组、时间参数等）。文件系统通常会将这两部分的数据分别存放在不同的区块，权限与属性存放在 inode 中，至于实际数据则放置到 data block 区块中。另外，还有一个超级区块（superblock）会记录整个文件系统的整体信息，包括 inode 与 block 的总量、使用量、剩余量等。

> inode：记录文件的属性，一个文件占用一个 inode，同时记录此文件的数据所在的 block。

> 在 Linux 中，可以使用 stat 命令查看某个文件的 inode 信息：

![stat命令](https://upload-images.jianshu.io/upload_images/10651191-7a113ff572f68046.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
