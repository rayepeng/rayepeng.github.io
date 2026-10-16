---
title: '关于-ntdll-dll'
date: 2019-01-01
category: 'windows'
tags: []
lang: 'zh'
draft: true
---
ntdll.dll是重要的Windows NT内核级文件。描述了windows本地NTAPI的接口。当Windows启动时，ntdll.dll就驻留在内存中特定的[写保护]区域，使别的程序无法占用这个内存区域。

ntdll.dll是Windows系统从ring3到ring0的入口。位于Kernel32.dll和user32.dll中的所有win32 API 最终都是调用ntdll.dll中的函数实现的。ntdll.dll中的函数使用SYSENTRY进入ring0，函数的实现实体在ring0中

kernel32.dll是Windows 9x/Me中非常重要的32位动态链接库文件，属于内核级文件。它控制着系统的内存管理、数据的输入输出操作和中断处理，当Windows启动时，kernel32.dll就驻留在内存中特定的写保护区域，使别的程序无法占用这个内存区域。
