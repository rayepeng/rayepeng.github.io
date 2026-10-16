---
title: '一个最简单的main反汇编'
date: 2019-01-01
category: '汇编'
tags: []
lang: 'zh'
draft: true
---
反汇编代码如下:
```
int main()
{
009718B0  push        ebp  
009718B1  mov         ebp,esp  
009718B3  sub         esp,0D8h  
009718B9  push        ebx  
009718BA  push        esi  
009718BB  push        edi  
009718BC  lea         edi,[ebp-0D8h]  
009718C2  mov         ecx,36h  
009718C7  mov         eax,0CCCCCCCCh  
009718CC  rep stos    dword ptr es:[edi]  
009718CE  mov         ecx,offset _3546DA2A_12.22.cpp (097C027h)  
009718D3  call        @__CheckForDebuggerJustMyCode@4 (097121Ch)  
	unsigned short x = 65535;
009718D8  mov         eax,0FFFFh  
009718DD  mov         word ptr [x],ax    //把eax低16位的数据放入x变量中  
	short y = (short)x;
009718E1  mov         ax,word ptr [x]  
009718E5  mov         word ptr [y],ax  
	printf("x = %u, y = %d\n",x, y);
009718E9  movsx       eax,word ptr [y]   //先符号扩展，再传送
009718ED  push        eax  
009718EE  movzx       ecx,word ptr [x]   //先零位扩展，再传送
009718F2  push        ecx  
009718F3  push        offset string "x = %u, y = %d\n" (0977B30h)  
009718F8  call        _printf (097104Bh)  
009718FD  add         esp,0Ch  
	system("pause");
00971900  mov         esi,esp  
00971902  push        offset string "pause" (0977B44h)  
00971907  call        dword ptr [__imp__system (097B170h)]  
0097190D  add         esp,4  
00971910  cmp         esi,esp  
00971912  call        __RTC_CheckEsp (0971226h)  
	return 0;
00971917  xor         eax,eax  
}
00971919  pop         edi  
0097191A  pop         esi  
0097191B  pop         ebx  
0097191C  add         esp,0D8h  
00971922  cmp         ebp,esp  
00971924  call        __RTC_CheckEsp (0971226h)  
00971929  mov         esp,ebp  
0097192B  pop         ebp  
0097192C  ret  
```

以下内容来自网上:
> ESI/EDI 分别叫做"源/目标索引寄存器"(source/destination index),
因为在很多字符串操作指令中, DS:ESI指向源串,而ES:EDI指向目标串.

> MSVC在debug模式下会对栈帧写入一些"safe guard"——即在栈帧边界上填0xCCCCCCCC来提醒不慎越界的程序员. 如果是在heap上分配空间(malloc, new之类), 则在边界上会被填入0xCDCDCDCD.
