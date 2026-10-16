---
title: 'Debug指令练习'
date: 2019-01-01
category: 'windows'
tags: []
lang: 'zh'
draft: true
---
关于之前的一部分指令，可以参考[这篇文章](https://blog.csdn.net/zpy1998zpy/article/details/83749626)

>rep stosd循环：
从lea edi , [EBP+arg_0] 开始，到rep stosd 结束。EDI中存入的是循环操作的起始地址，ECX存入的是循环次数，EAX是循环填入的值。这一段的操作就是从EBP+var_40处开始，循环十次，向下依次填入CCCCCCCC，写入的长度由EAX决定，32位。

```c
1:    #include <stdio.h>
2:    #include <stdlib.h>
3:
4:    int main(int argc, char *argv[])
5:    {
00401010   push        ebp
00401011   mov         ebp,esp
00401013   sub         esp,44h
00401016   push        ebx
00401017   push        esi
00401018   push        edi
00401019   lea         edi,[ebp-44h]
0040101C   mov         ecx,11h
00401021   mov         eax,0CCCCCCCCh
00401026   rep stos    dword ptr [edi]
;这部分之前的指令都是一些初始化的工作
6:        float fFloat = (float)argc;
00401028   fild        dword ptr [ebp+8]
0040102B   fst         dword ptr [ebp-4]
7:        printf("%f", fFloat);
0040102E   sub         esp,8
00401031   fstp        qword ptr [esp]
00401034   push        offset string "%f" (00426020)
00401039   call        printf (00401090)
0040103E   add         esp,0Ch
8:        argc = (int)fFloat;
00401041   fld         dword ptr [ebp-4]
00401044   call        __ftol (004011f8)
00401049   mov         dword ptr [ebp+8],eax
9:        printf("%d", argc);
0040104C   mov         eax,dword ptr [ebp+8]
0040104F   push        eax
00401050   push        offset string "%d" (0042601c)
00401055   call        printf (00401090)
0040105A   add         esp,8
10:       return 0;
0040105D   xor         eax,eax
11:   }

```

现场开始单步调试
![](https://upload-images.jianshu.io/upload_images/10651191-16f89daf8c2a7f9f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此时的内存和寄存器值：
![0x0012FF84是esp当前的指向](https://upload-images.jianshu.io/upload_images/10651191-927c17216e87b597.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当我们push一个ebp进去之后，esp减去4，指向了`0x0012FF80`，往地址增大的方向数四个字节就是刚刚的ebp的值，这我就理解了按字节编址的机器中都是往地址高的地方去数四个字节
![](https://upload-images.jianshu.io/upload_images/10651191-8bec543067b37885.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

push两个值进去之后，
![标注除了ebx和esi寄存器](https://upload-images.jianshu.io/upload_images/10651191-cad6143b4cbaf4f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![继续push了edi寄存器的值](https://upload-images.jianshu.io/upload_images/10651191-65e02d9956defa47.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> lea         edi,[ebp-44h]是将esp-44h然后将这个地址赋值给edi,这个方括号有点让人迷

edi此时指向了这个地址
接下来要完成的操作是：

![](https://upload-images.jianshu.io/upload_images/10651191-3c16fb514b695541.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```c
0040101C   mov         ecx,11h
00401021   mov         eax,0CCCCCCCCh
00401026   rep stos    dword ptr [edi]
```
![连续17次rep stos](https://upload-images.jianshu.io/upload_images/10651191-9798b2d5de574ce0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样就大概解释清楚了吧

## 0x02float指令分析

```c
6:        float fFloat = (float)argc;
;将地址ebp+8处的整型数据转换成浮点型，并放入ST(0)中，对应变量argc
00401028   fild        dword ptr [ebp+8]
;从ST(0)中取出数据以浮点编码方式放入地址ebp-4中，对应变量fFloat
0040102B   fst         dword ptr [ebp-4]
```
ctrl+f10让其执行到贯标所处的位置
![](https://upload-images.jianshu.io/upload_images/10651191-5c19f744d4adc22c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[ebp+8]处对应的值：

![](https://upload-images.jianshu.io/upload_images/10651191-30a1a7fb5acd0b13.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里是ebp-4对应的值，还没有被修改
![](https://upload-images.jianshu.io/upload_images/10651191-a1e3cc961e64b569.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

此处的值被修改成了`0x3F800000`
![执行完 fst         dword ptr [ebp-4]后](https://upload-images.jianshu.io/upload_images/10651191-9e62948d3e340406.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

而此时的float值也被修改了
![](https://upload-images.jianshu.io/upload_images/10651191-832a14f35e73d0fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是对应的二进制
![](https://upload-images.jianshu.io/upload_images/10651191-1ce026671f111193.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

0表示符号位，011 1111 1表示指数部分，最后的全0代表尾数部分。

指数是加了127的，此处减去127即为0，又由于尾数中隐含前导1
所以`0x3F800000`就是1对应的浮点数表示方法

略过printf函数
这是第一次打印出来的值
![](https://upload-images.jianshu.io/upload_images/10651191-34ff48cdc970ac94.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```c
8:        argc = (int)fFloat;
;将地址ebp-4处的数据以浮点型压入ST(0)中
00401041   fld         dword ptr [ebp-4]
;调用__ftol函数进行浮点转换
00401044   call        __ftol (004011f8)
;转换后的结果放入eax中，并传递到ebp+8地址处
00401049   mov         dword ptr [ebp+8],eax
```
这是转换函数的实现
```c
004011F8   push        ebp
004011F9   mov         ebp,esp
004011FB   add         esp,0F4h
004011FE   wait
004011FF   fnstcw      word ptr [ebp-2]
00401202   wait
00401203   mov         ax,word ptr [ebp-2]
00401207   or          ah,0Ch
0040120A   mov         word ptr [ebp-4],ax
0040120E   fldcw       word ptr [ebp-4]
00401211   fistp       qword ptr [ebp-0Ch]
00401214   fldcw       word ptr [ebp-2]
00401217   mov         eax,dword ptr [ebp-0Ch]
0040121A   mov         edx,dword ptr [ebp-8]
0040121D   leave
```
![此时eax中存放了返回的值](https://upload-images.jianshu.io/upload_images/10651191-4205f3de1e37e2a6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里让我比较困惑了,ebp+8处存放的值就是之前的argc,所以在`mov         dword ptr [ebp+8],eax`时并没有修改此处的值
![](https://upload-images.jianshu.io/upload_images/10651191-ab1c26b1fa5c958f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
