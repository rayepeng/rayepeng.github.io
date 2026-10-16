---
title: 'metasploit渗透测试'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
# 在metasploit中使用数据库

使用如下命令开启metasploit数据库服务
**service postgresql start**
**msfdbinit**
检查数据库状态
**db_status**
连接数据库
**db_connet**

使用数据库相关的命令
**db_nmap**
# 相关的漏洞分析
`VSFTPD2.4.3`后门

模块位于 `exploit/uix/ftp/vsftpd_234_backdoor`

输入`info`可以查看相关的信息

漏洞渗透的过程

漏洞相关的代码
```c
else if((p_str->p_buf[i] == 0x3a)) && (p_str->p_buf[i+1] == 0x29)
{
	vsf_sysutil_extra(); 
}
```
具体的细节之后补充

payload的选择，可以使用
**show payloads`来·选择相关的payload

# easyFileSharing 基于SEH的栈溢出

寻找PPR
PPR也就是pop,pop,rtn的缩写

漏洞原理：
在处理请求时存在漏洞—— 一个恶意的请求头部（HEAD或
GET）就可以引起缓冲区溢出，从而改写SEH链的地址。

> POP POP RET是创建SEH(Structured Exception Handler，结构化异常处理程序)漏洞所需的指令序列。弹出值所对应的寄存器对于攻击成功不重要，重要的是ESP向更高地址移动两次，然后执行RET。因此，POP EAX，POP EBX，RET或POP ECX，POP ECX，RET或POP EDX，POP EAX，RET(等等)都可以。
每次发生RET时，地址ESP中的内容被放入EIP中执行

关于SEH
> SEH大部分由链接的记录列表组成，每个记录对应一个异常处理程序。每个记录的第一个字段是指向下一个记录的指针，第二个字段是异常处理程序的地址。

![但是这里为什么第一个指针式指向异常处理程序，下一个指针才是指向像一个seh呢？](https://upload-images.jianshu.io/upload_images/10651191-2a57e492047c82a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

SEH漏洞基于这样的事实:攻击者可以改变堆栈的一部分(通过缓冲区溢出)，并在那里放置值，从而在异常发生后错误地引导SEH handler的执行。

异常发生之后，程序从驻留在堆栈中的第一个SEH handler指向的地址开始执行，攻击者可以找到此地址并更改它。所以攻击者可以通过在堆栈中放置shellcode来改变堆栈，以便改变SEH handler将开始执行的地址，使其指向shellcode。
