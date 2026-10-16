---
title: 'Windows堆的分析'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
又把0day安全翻了一下收获了很多，还是关于堆的知识
源代码：
```c
#include <windows.h>
main()
{
	HLOCAL h1,h2,h3,h4,h5,h6;
	HANDLE hp;
	hp = HeapCreate(0,0x1000,0x10000);
	__asm int 3

	h1 = HeapAlloc(hp,HEAP_ZERO_MEMORY,3);
	h2 = HeapAlloc(hp,HEAP_ZERO_MEMORY,5);
	h3 = HeapAlloc(hp,HEAP_ZERO_MEMORY,6);
	h4 = HeapAlloc(hp,HEAP_ZERO_MEMORY,8);
	h5 = HeapAlloc(hp,HEAP_ZERO_MEMORY,19);
	h6 = HeapAlloc(hp,HEAP_ZERO_MEMORY,24);
	
	//free block and prevent coaleses
	HeapFree(hp,0,h1); //free to freelist[2] 
	HeapFree(hp,0,h3); //free to freelist[2] 
	HeapFree(hp,0,h5); //free to freelist[4]
	
	HeapFree(hp,0,h4); //coalese h3,h4,h5,link the large block to freelist[8]

	
	return 0;
}
```
堆的起始地址为3a0000
偏移3a0178处为freelist
可以看到这里有好多指针
![](https://upload-images.jianshu.io/upload_images/10651191-fcaea6c10721944d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
3a0688处的这一个堆块是最大的，后续的分配从这里开始
![](https://upload-images.jianshu.io/upload_images/10651191-0670c61f8e769d74.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第一次分配16字节：返回的句柄为3a0688，但是实际上在之前还有16个字节的块首
02代表分配的是16字节，
![](https://upload-images.jianshu.io/upload_images/10651191-0d18398e2920c663.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此时的freelist指向了3a0698
![](https://upload-images.jianshu.io/upload_images/10651191-1151b855fe00e10a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
再分配16字节

![](https://upload-images.jianshu.io/upload_images/10651191-ff1c78a95687fe34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后freelist的指针继续修改
![](https://upload-images.jianshu.io/upload_images/10651191-4da2ac4137e48949.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

继续分配：
此时已经分配了4个16个字节
![](https://upload-images.jianshu.io/upload_images/10651191-1a3c3cad374d0b75.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

接下来分配两次32字节的
这是所有分配出去的
![](https://upload-images.jianshu.io/upload_images/10651191-b5b4eaf7bfc615a3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此时freelist0指向了3a0708，这应该很明显了吧

接下来开始释放，释放掉h1和h3，它们都是16个字节的，所以由freelist2来管理它们

第一次释放掉h1
![](https://upload-images.jianshu.io/upload_images/10651191-ddba5b07958d0aaa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3a0188就是freelist2
freelist2也指向了h1
![](https://upload-images.jianshu.io/upload_images/10651191-ab4f8a7461ab6af7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

继续释放掉h3
此时
freelist2的flink指向，h1的flink指向h3,h3的flink指向freelist2
就是一个单链表的指向关系
![](https://upload-images.jianshu.io/upload_images/10651191-26221c44c597e58d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

释放掉h5, h5是32个字节，链接到freelist4

![](https://upload-images.jianshu.io/upload_images/10651191-067c747dabdf42b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后释放掉h4
触发合并操作

这是合并之后的堆块
3a01b8恰好就是freelist8

![](https://upload-images.jianshu.io/upload_images/10651191-97108f2ebe578137.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---
Q&A
堆中的数据存放在哪里？
一定要对堆的结构很清楚，占用态的堆是由程序员来管理，空闲态的堆是由空表或者快表管理的，所以空闲态的堆块需要用链表链接起来，而对于占用态的堆块的管理这个锅就丢给了程序员。占用态的堆块是没有前向指针和后向指针的，而返回给程序员的句柄只是指向了块身，所以堆块最小也是16个字节(8+8个字节的块首),数据就会存放在块身处

如何得知堆这片内存的起始地址？
调用函数之后会返回一个句柄，存放在eax寄存器中，这个句柄就指向了这篇内存，至于如何通过内存映射去查看这个我也不清楚。不过似乎每个系统的堆这篇内存的起始地址都是固定的？
