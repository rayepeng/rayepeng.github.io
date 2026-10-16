---
title: 'rep-stos-指令'
date: 2019-01-01
category: '汇编'
tags: []
lang: 'zh'
draft: true
---
附上一个[链接](https://blog.csdn.net/ypist/article/details/8467163)
> 如下代码：
```
lea     edi,[ebp-0C0h] 
mov     ecx,30h 
mov     eax,0CCCCCCCCh 
rep stos dword ptr es:[edi]
```

> rep指令的目的是重复其上面的指令.ECX的值是重复的次数.
STOS指令的作用是将eax中的值拷贝到ES:EDI指向的地址.

REP可以是任何字符传指令(CMPS, LODS, MOVS, SCAS, STOS)的前缀. 
REP能够引发其后的字符串指令被重复, 只要ecx的值不为0, 重复就会继续. 
每一次字符串指令执行后, ecx的值都会减小.

stos((store into String)，意思是把eax的内容拷贝到目的地址。
用法：stos dst，dst是一个目的地址，例如：stos dword ptr es:[edi]。dword ptr前缀告诉stos，一次拷贝双字(4个字节)的数据到目的地址。为什么一次非要拷贝双字呢？这和eax寄存器有关，到底神马关系，慢慢道来。。

> eax的内容是cccccccc，不用说都明白int3中断。
int 3终端的目的是： 放置该空间里的东东被意外执行

所以在上一篇文章中，遇到的
```
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
```
其中的倒数第二句话目的就是让新开辟的空间都填满eax寄存器的值
