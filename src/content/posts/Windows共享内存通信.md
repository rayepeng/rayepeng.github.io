---
title: 'Windows共享内存通信'
date: 2019-01-01
category: '操作系统'
tags: []
lang: 'zh'
draft: true
---
和Linux进程间通过共享内存方式通信类似
Windows也是通过打开文件， 将物理上的磁盘文件映射到内存中， 然后相互通信。
不过有一点不一样吧， 因为Linux我们可以fork()一个子进程， 但是Windows不知道怎么fork， 所以就写两份文件吧

# 发送方

vs2019选择创建桌面应用程序

![](https://upload-images.jianshu.io/upload_images/10651191-6e7a38609c47e5c4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

进去之后是一堆的代码

找到这个位置开始添加自己的代码

![](https://upload-images.jianshu.io/upload_images/10651191-cb0683fd91c4c9e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

比如调用一个`MessageBoxA()`函数

![](https://upload-images.jianshu.io/upload_images/10651191-ab57fd2712edd042.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

开始做正事了

```
HANDLE hFile = CreateFile(TEXT("h:\test.txt"), GENERIC_READ | GENERIC_WRITE, 0,
		NULL, CREATE_ALWAYS, FILE_ATTRIBUTE_NORMAL, NULL);

	//创建一个文件句柄， 然后进行判断
	if (hFile == NULL)
	{
		printf("create file error!");
		return 0;
	}

```

具体的参数含义如下：
等我查一下MSDN就告诉你
大致的含义如下

![](https://upload-images.jianshu.io/upload_images/10651191-c69073729d4c6a03.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
//创建内存映射文件

	HANDLE hMap = CreateFileMapping(hFile, NULL, PAGE_READWRITE, 0, 1024 * 1024, TEXT("PXY"));

	int rst = GetLastError();

	if (hMap != NULL && rst == ERROR_ALREADY_EXISTS)
	{
		printf("hMap error\n");
		CloseHandle(hMap);
		hMap = NULL;
		return 0;
	}
	

```

参数解释： 
hFile: 是对应的物理文件。如果hFile=NULL,即没有通过CreateFile创建一个实际存在的文件，有解释为创建一个进程间共享的对象。
NULL: 安全属性
PAGE_READWRITE: 可读可写
0，  1024*1024： 从物理文件的高0位到低1024*1024位映射成虚拟文件。
PXY :是虚拟文件的名字，客户端读时也用这个名字，所以，可能这个名字是会在进程外部注册的。

接下来

将虚拟文件映射成内存地址，方便使用。即将文件与内存绑定，以后操作该内存其实就是操作该文件。

```
	CHAR* pszText = NULL;

	pszText = (CHAR*)MapViewOfFile(hMap, FILE_MAP_ALL_ACCESS, 0, 0, 1024 * 1024);

	if (pszText == NULL)
	{
		printf("view map error!");
		return 0;
	}

	sprintf(pszText, "hello my first mapping file!\n");
 //其实是向文件中（共享内存中）写入了

```

参数解释：hMap：虚拟文件名
FILE_MAP_ALL_ACCESS：访问模式
0,0：从虚拟文件的哪个位置开始映射成内存
1024*1024： 映射多大的内存

## 写
　sprintf(pszText,"hello my first mapping file!\n"); //语句本身的意思，是将句子写入字符串pszText中，而这个字符串并没有在程序中分配空间，即没有new
 但这句话也不会报错。是因为该字符串地址指向了映射文件，即通过操作该指针，实际是操作了文件，句子写入了文件当中。

## 读

printf（pszText); //语句本身是将字符串中的内容输出到屏幕上，该字符串中没有分配空间，也没有赋值。但通过映射为文件，可以将文件中的内容通过该指针输出到屏幕上。

读到了！
![](https://upload-images.jianshu.io/upload_images/10651191-266bcefbc8853058.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其实这个才是的

![](https://upload-images.jianshu.io/upload_images/10651191-619648130e8601f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
