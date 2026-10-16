---
title: 'Windows——注入技术'
date: 2019-01-01
category: 'windows'
tags: []
lang: 'zh'
draft: true
---
在Windows中大部分的应用程序都是基于消息机制的，它们都有一个消息过程函数，根据不同的消息完成不同的功能，Windows操作系统提供的钩子机制就是用来截获和监视系统中这些消息的

按照钩子的作用域可以分为全局钩子和局部钩子
局部钩子是针对某个过程的，全局钩子则是作用于整个系统的基于消息的应用。全局钩子需要使用DLL文件，在DLL中实现相应的钩子函数

**SetWindowsHookEx**
将程序定义的钩子安装到挂勾链中，安装钩子程序可以监视系统是否存在某些类型的事件，这些事件与特定线程或调用线程所在桌面中的所有线程相关联

为了能让DLL注入到所有的进程中，程序设置WH_GETMESSAGE消息的全局钩子
因为这个类型的钩子会监视消息队列，并且Windows系统是基于消息驱动的，所以所有的进程都会有一个自己的消息队列，都回家在WH_GETMESSAGE类型的全局钩子

设置全局钩子
```c
// 设置全局钩子
BOOL SetGlobalHook()
{
	g_hHook = ::SetWindowsHookEx(WH_GETMESSAGE, (HOOKPROC)GetMsgProc, g_hDllModule, 0);
	if (NULL == g_hHook)
	{
		return FALSE;
	}
	return TRUE;
}
```
钩子回调函数
```c
// 钩子回调函数
LRESULT GetMsgProc(
	int code,
	WPARAM wParam,
	LPARAM lParam)
{
	return ::CallNextHookEx(g_hHook, code, wParam, lParam);
}
```

卸载钩子
```c
// 卸载钩子
BOOL UnsetGlobalHook()
{
	if (g_hHook)
	{
		::UnhookWindowsHookEx(g_hHook);
	}
	return TRUE;
}
```
以上就是全局钩子的设置
这些操作都需要用到全局钩子的句柄作为参数，而全局钩子是以DLL形式加载到其他进程空间的，并且进程是独立的，所以采用创建共享内存的方式来突破进程的独立性
共享内存的设置
```c
#pragma data_seg("mydata")
    HHOOK g_hHook = NULL;
#pragma data_seg()
#pragma comment(linker, "/SECTION:mydata,RWS")
```

一个钩子加载进了
![](https://upload-images.jianshu.io/upload_images/10651191-16c948a4587efa98.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后就消失了

![](https://upload-images.jianshu.io/upload_images/10651191-91b55ac7c430e814.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## APC注入
APC为异步过程调用，是指函数在特定线程中被异步执行，在Windows系统中，APC是一种并发机制，用于异步IO或者定时器。

每一个线程都维护者一个APC队列，使用`QueueUserAPC`函数把一个APC函数压入APC队列中，当处于用户模式的APC压入线程APC队列后，该线程并不直接调用APC函数，除非该线程处于可通知状态，调用的顺序为FIFO。

```c
QueueUserAPC(
    __in PAPCFUNC pfnAPC,
    __in HANDLE hThread,
    __in ULONG_PTR dwData
    );
```
pfnAPC：指向应用程序提供的APC函数的指针
hThread: 线程的句柄
dwData: 传递由pfnAPC参数指向的APC函数的单个值

APC注入的基本步骤：
1. 通过OpenProcess函数打开目标进程，获取目标进程的句柄
2. 获取目标进程的所有线程的ID
3. 调用VirtualAllocEx函数在目标进程中申请内存，调用WriteProcessMemory函数向内存中写入DLL的注入路径。
4. 遍历线程ID，插入APC函数，设置APC函数的地址为LoadLibrary函数的地址，设置APC函数参数为上述DLL路径的地址

3. 突破session0隔离的远程线程注入

ZwCreatThreadEx比CreatRemoteThread函数更为底层。
