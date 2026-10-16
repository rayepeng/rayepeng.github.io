---
title: 'Windows——启动技术'
date: 2019-01-01
category: 'windows'
tags: []
lang: 'zh'
draft: true
---
创建进程API

1. WinExec函数
```c
WinExec(
    __in LPCSTR lpCmdLine,
    __in UINT uCmdShow
    );
```
__in的宏定义：
> \#define __in                                          __allowed(on_parameter)

有两个参数：lpCmdLine要执行的应用程序的命令行和uCmdShow是显示选项

返回值大于31表示创建成功

```c
BOOL WinExec_Test(char *pszExePath, UINT uiCmdShow)
{
	UINT uiRet = 0;
	uiRet = ::WinExec(pszExePath, uiCmdShow);
	if (31 < uiRet)
	{
		return TRUE;
	}
	return FALSE;
}
```

2. ShellExecute函数
运行一个外部程序，并对外部程序进行一定程度的控制

```c
SHSTDAPI_(HINSTANCE) ShellExecuteA(__in_opt HWND hwnd, __in_opt LPCSTR lpOperation, __in LPCSTR lpFile, __in_opt LPCSTR lpParameters,
    __in_opt LPCSTR lpDirectory, __in INT nShowCmd);
```
ShellExecut函数实际上是ShellExecutA函数的宏定义

```c
BOOL ShellExecute_Test(char *pszExePath, UINT uiCmdShow)
{
	HINSTANCE hInstance = 0;
	hInstance = ::ShellExecute(NULL, NULL, pszExePath, NULL, NULL, uiCmdShow);
	if (32 < (DWORD)hInstance)
	{
		return TRUE;
	}
	return FALSE;
}
```

3. CreateProcess函数
创建一个新进程及主线程，新进程在调用进程的安全的上下文中运行。
```c
CreateProcessA(
    __in_opt    LPCSTR lpApplicationName,
    __inout_opt LPSTR lpCommandLine,
    __in_opt    LPSECURITY_ATTRIBUTES lpProcessAttributes,
    __in_opt    LPSECURITY_ATTRIBUTES lpThreadAttributes,
    __in        BOOL bInheritHandles,
    __in        DWORD dwCreationFlags,
    __in_opt    LPVOID lpEnvironment,
    __in_opt    LPCSTR lpCurrentDirectory,
    __in        LPSTARTUPINFOA lpStartupInfo,
    __out       LPPROCESS_INFORMATION lpProcessInformation
    );
```

例子：
```c
BOOL CreateProcess_Test(char *pszExePath, UINT uiCmdShow)
{
	STARTUPINFO si = { 0 };
	PROCESS_INFORMATION pi;
	BOOL bRet = FALSE;
	si.cb = sizeof(si);
	si.dwFlags = STARTF_USESHOWWINDOW;  //指定wShowWindow成员有效
	si.wShowWindow = uiCmdShow;
	bRet = ::CreateProcess(NULL, pszExePath, NULL, NULL, FALSE, CREATE_NEW_CONSOLE, NULL, NULL, &si, &pi);
	if (bRet)
	{
		//不使用的句柄最好关掉
		::CloseHandle(pi.hThread);
		::CloseHandle(pi.hProcess);
		return TRUE;
	}
	return FALSE;
}
```
