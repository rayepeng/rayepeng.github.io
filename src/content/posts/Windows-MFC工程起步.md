---
title: 'Windows-MFC工程起步'
date: 2019-01-01
category: 'windows'
tags: []
lang: 'zh'
draft: true
---
先填坑

VS2019安装MFC库，折腾可半天，看这篇[文章](https://blog.csdn.net/qq_36556893/article/details/89945943)

![MFC](https://upload-images.jianshu.io/upload_images/10651191-4fbae24a13cf0257.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

还有这个
![](https://upload-images.jianshu.io/upload_images/10651191-9a54562c43316f1c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后就成功了
![](https://upload-images.jianshu.io/upload_images/10651191-ad320c5e736d9d23.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

从三个实验说起

#0x01 资源释放

病毒木马大多使用资源释放技术，它可以使程序变得更为简洁，如果程序额外需要加载一些DLL文件，文本文件，图片文件，或者其他的音/频文件灯，可以把它们作为资源插入到程序里，等到程序运行的时候，再把他们释放到本地上，这样做的好处不言而喻。

介绍几个函数
**FIndResource**
确定模块中指定类型和名称的资源所在的位置
如果函数运行成功，那么返回值为指定资源信息块的句柄，可以将这个句柄传递给LoadResource函数来获得这些资源，如果函数运行失败，则返回值为NULL

**SizeOfResource**
获取指定资源的字节数

**LoadResource**
装载指定资源到全局存储器

**LockResource**
锁定资源并得到资源在内存中第一个字节的指针

先来展示一下效果：
这是生成的exe文件，此时内部这一个exe文件
![](https://upload-images.jianshu.io/upload_images/10651191-d740463259369a12.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

拖入到PeView中看一下

这个程序的资源节好大
![peview中查看](https://upload-images.jianshu.io/upload_images/10651191-119650279d15671a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
打开之后是这个：
![](https://upload-images.jianshu.io/upload_images/10651191-ece5cb84e702d6db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

单击释放之后
一个资源被释放出来了
![](https://upload-images.jianshu.io/upload_images/10651191-2aac140c9380d674.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们分析下源代码中式如何实现的
```c
BOOL FreeMyResource(UINT uiResouceName, char *lpszResourceType, char *lpszSaveFileName)
{
	// 获取指定模块里的指定资源
	HRSRC hRsrc = ::FindResource(NULL, MAKEINTRESOURCE(uiResouceName), lpszResourceType);
	if (NULL == hRsrc)
	{
		FreeRes_ShowError("FindResource");
		return FALSE;
	}
	// 获取资源的大小
	DWORD dwSize = ::SizeofResource(NULL, hRsrc);
	if (0 >= dwSize)
	{
		FreeRes_ShowError("SizeofResource");
		return FALSE;
	}
	// 将资源加载到内存里
	HGLOBAL hGlobal = ::LoadResource(NULL, hRsrc);
	if (NULL == hGlobal)
	{
		FreeRes_ShowError("LoadResource");
		return FALSE;
	}
	// 锁定资源
	LPVOID lpVoid = ::LockResource(hGlobal);
	if (NULL == lpVoid)
	{
		FreeRes_ShowError("LockResource");
		return FALSE;
	}

	// 保存资源为文件
	FILE *fp = NULL;
	fopen_s(&fp, lpszSaveFileName, "wb+");
	if (NULL == fp)
	{
		FreeRes_ShowError("LockResource");
		return FALSE;
	}
	fwrite(lpVoid, sizeof(char), dwSize, fp);
	fclose(fp);

	return TRUE;
}
```

代码的基本思路：通过`FindResource`定位程序里的资源，主要是根据资源类型和资源名称进行定位，从而获取资源信息的句柄
其次，根据获取到的资源信息块的句柄，利用`SizeofResource`函数获取资源的大小，再通过`LoadResource`把资源加载到程序内存中。
通过LockResource锁定加载到内存中的资源，防止程序中的其他操作影响这块内存。
接着，根据资源大小以及进程内存的起始地址，可将资源数据读取出来并保存为本地文件

![获取到的资源句柄](https://upload-images.jianshu.io/upload_images/10651191-6a6312a14648aa31.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

资源大小是31
![资源大小](https://upload-images.jianshu.io/upload_images/10651191-b41896eb87f3773b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![装载资源](https://upload-images.jianshu.io/upload_images/10651191-9e65c350c8db811d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![锁定资源](https://upload-images.jianshu.io/upload_images/10651191-8d9ec2bb2dcfc1e1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后打开一个文件进行写入

当然这里只是显示了这个函数的代码，具体的调用是这样子的：
```c
void CResourceFree_TestDlg::OnBnClickedButtonRelease()
{
	// TODO:  在此添加控件通知处理程序代码
	char szSaveName[MAX_PATH] = "520.txt";
	// 释放资源
	BOOL bRet = FreeMyResource(IDR_MYRES2, "MYRES", szSaveName);
	if (FALSE == bRet)
	{
		::MessageBox(NULL, "Free Resource Error!", "ERROR", MB_OK);
	}
	else
	{
		::MessageBox(NULL, "Free Resource OK!", "OK", MB_OK);
	}
}
```

可以根据PE结构中的资源表IMAGE_RESOURCE_DIRECTORY 来解析PE文件中包含的所有资源，并且获取资源的偏移地址及数据大小。

#0x02 DLL延迟加载

DLL延迟加载技术是病毒中广泛使用的一种技术，这样可执行程序就可以先加载执行，所依赖的DLL在正式调用时再加载进来。

DLL的延迟加载不需要任何编码，只需要在VS开发环境中的链接选项进行手动设置即可
![DLL延迟加载](https://upload-images.jianshu.io/upload_images/10651191-60dd7e069c97bcff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此时就可以看到可执行文件并没有引入任何dll文件，是通过延迟加载
![](https://upload-images.jianshu.io/upload_images/10651191-2c89b1fb4b4aff71.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

作为对比，我们去掉延迟加载选项

然后重新编译生成

尴尬了。。运行失败

#0x03 运行单一实例

病毒木马必须确保自身只被执行一次
确保自身只执行一次的方式有很多：可以通过扫描进程列表来实现，可以通过枚举程序窗口来实现，可以通过共享全局变量来实现，这次采用的方式是创建系统互斥对象的方式来实现

**CreatMutex**
这个函数会创建或者打开一个已命名或未命名的互斥对象，程序在每次运行的时候，通过判断系统中是否存在相同命名的互斥对象来确定程序是否重复运行

```c
// 判断是否重复运行
BOOL IsAlreadyRun()
{
	HANDLE hMutex = NULL;
	hMutex = ::CreateMutex(NULL, FALSE, "TEST");
	if (hMutex)
	{
		if (ERROR_ALREADY_EXISTS == ::GetLastError())
		{
			return TRUE;
		}
	}
	return FALSE;
}
```

基本原理：
通过CreatMutext函数创建一个命名的互斥对象，如果对象创建成功，而且通过调用GetLastError函数获取的返回码为。。。。则表示该命名互斥对象存在，即程序重复运行，否则会认为程序是首次运行

![运行效果](https://upload-images.jianshu.io/upload_images/10651191-d5089086035da8b0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
