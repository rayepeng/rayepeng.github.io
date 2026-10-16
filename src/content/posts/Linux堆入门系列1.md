---
title: 'Linux堆入门系列1'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
先看下这份代码：
```c
#include <stdio.h>
#include <unistd.h>
#include <sys/types.h>

int main(int argc, char const *argv[])
{
	void *curr_brk,*tmp_brk = NULL;

	printf("Welcome to sbrk expmple:%d\n", getpid());

	tmp_brk = curr_brk = sbrk(0);
	printf("Program Break Location1:%p\n", curr_brk);
	getchar();
	brk(curr_brk+4096);
	curr_brk = sbrk(0);
	printf("Program Break Location2:%p\n", curr_brk);
	getchar();
	brk(tmp_brk);
	curr_brk = sbrk(0);
	printf("Program Break Location3:%p\n", curr_brk);
	getchar();
	return 0;
}
```
getpid()可以获取到当前进程的pid
然后通过 `cat /proc/pid/maps`可以查看到当前程序的内存映射状态
实验截图：
有三次getchat()函数
![](https://upload-images.jianshu.io/upload_images/10651191-495edfb28a65bd9c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

同时三次内存映射：
![](https://upload-images.jianshu.io/upload_images/10651191-661013ed4acfe592.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-46a413ae236f9983.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-cd9b58bbdce6799e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意到什么没？
第一次heap的结束地址是0x583fe000,第二次是0x583ff000,最后一次又变成了0x583fe000

这就是sbrk函数
> sbrk 用来改变 "program break" (程序间断点)的位置

具体的就看这幅图了：
![](https://upload-images.jianshu.io/upload_images/10651191-5187eb3803fdb83a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
（出自GitHub ctfwiki 侵删）
