---
title: 'PE文件'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
NT映像头的起始位置
![](https://upload-images.jianshu.io/upload_images/10651191-b05311b33e226613.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这一部分是NT映像头
![](https://upload-images.jianshu.io/upload_images/10651191-77f5bbcb5f1e2406.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

文件真正执行的位置是023AH
![](https://upload-images.jianshu.io/upload_images/10651191-071fe7b9f100bae9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

节对齐与文件对齐都是4
![](https://upload-images.jianshu.io/upload_images/10651191-e9a1dae86f01e066.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

目录项数 
![](https://upload-images.jianshu.io/upload_images/10651191-4a4dce9a33c04bd9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

将目录项数设置为2，并将多余的目录项全部删除
![](https://upload-images.jianshu.io/upload_images/10651191-636d827e4d2b1f68.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-e7562dc7297ff0e8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里分别是引出函数表的RVA和大小，还有引入函数表的RVA和大小
![](https://upload-images.jianshu.io/upload_images/10651191-1e76f57e9f98701c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

代码节

![](https://upload-images.jianshu.io/upload_images/10651191-fab5a3c5246394ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

rdata节
![](https://upload-images.jianshu.io/upload_images/10651191-8e2a9d2a0c646f38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这两个节也是都可以删掉的

引入函数表一共是20个字节
![](https://upload-images.jianshu.io/upload_images/10651191-66c35fb2cd48a391.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

kernel32 dll名字的RVA
![](https://upload-images.jianshu.io/upload_images/10651191-569fdca8b639ccac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![](https://upload-images.jianshu.io/upload_images/10651191-9e4addc89c83288f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

02D0 指向Name RVA
![](https://upload-images.jianshu.io/upload_images/10651191-1061523f01947c77.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

026C指向IAT表
![](https://upload-images.jianshu.io/upload_images/10651191-336ea0df8467682c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是程序的执行流程
```
mov eax, 弹框标题字符串所在地址
mov word ptr [eax], My
xor ebx, ebx
push ebx
push eax
add al, 14
push eax
push ebx
mov dword ptr [exa+16], dcb0d3c2:"馨勇"
push eax
call dword ptr[eax-36]
retn
```

最终修改的

![](https://upload-images.jianshu.io/upload_images/10651191-fe56c73cca8bd5d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

大部分都是跟着课件上走的，暂时还没有思考为什么不能在win10中运行
之后有时间再继续修改
