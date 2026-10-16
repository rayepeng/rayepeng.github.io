---
title: 'winhex使用'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
硬盘分区结构图(大致）

![](https://upload-images.jianshu.io/upload_images/10651191-77ac64dc420342b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**MBR** 主引导记录， 0柱面0磁道1扇区， 共占用了63个扇区， 但实际上只用了1个扇区。

在总共512字节的主引导记录中，MBR又可分为三部分：
* 第一部分：引导代码，占用了446个字节；
* 第二部分：分区表(DPT)，占用了64字节；
* 第三部分：55AA，结束标志，占用了两个字节。

Windows下的diskpart工具
![diskpart工具](https://upload-images.jianshu.io/upload_images/10651191-3680159cf746311a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

接上上图
![](https://upload-images.jianshu.io/upload_images/10651191-03b3b349f6825c2e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

而每一个分区又由DBR、FAT1、FAT2、DIR、DATA5部分组成：比如C 盘的数据结构：

![](https://upload-images.jianshu.io/upload_images/10651191-821019d1f1621c86.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当然这是FAT文件系统的构成

DBR是DOS引导扇区

![](https://upload-images.jianshu.io/upload_images/10651191-1e716154098476a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以不难理解这幅图了

第一个引导扇区其实就是DBR

## 参考资料

[数据恢复工具winhex使用教程](https://blog.csdn.net/fengyie007/article/details/83286463)
[MBR、EBR、DBR是什么](https://blog.csdn.net/lhf_tiger/article/details/8602437)
[MBR、EBR与DBR详解](https://blog.csdn.net/Hilavergil/article/details/79270379)
