---
title: '聊聊plt与got'
date: 2019-07-24
updated: 2019-08-20
category: 'note'
tags:
  - 'ctf'
  - 'pwn'
lang: 'zh'
draft: false
---
# 深入理解plt和got

先写一段代码：

```c
// Build with: gcc -m32 --no-pie -g -o plt plt.c

#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv) {
  puts("Hello world!");
  exit(0);
}
```

途中遇到了一个报错：  

```
In file included from /usr/include/stdio.h:27:0,
                 from plt.c:3:
/usr/include/features.h:374:25: fatal error: sys/cdefs.h: No such file or directory
 #  include <sys/cdefs.h>
```

然后安装一个:  
`apt install libc6-dev-i386`

编译好程序之后

```
$ checksec plt     
[*] '/home/pxy/pwnable/plt'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```

程序是没有pie的

`readelf -S plt`查看节表

```
[Nr] Name              Type            Addr     Off    Size   ES Flg Lk Inf Al
[12] .plt              PROGBITS        08048300 000300 000050 04  AX  0   0 16
[13] .text             PROGBITS        08048350 000350 000192 00  AX  0   0 16
[22] .got              PROGBITS        08049ffc 000ffc 000004 04  WA  0   0  4
[23] .got.plt          PROGBITS        0804a000 001000 00001c 04  WA  0   0  4
```

可以看到：

-   .plt 基地址为： `0x08048300`
-   .got 基地址为： `0x08049ffc`
-   .got.plt 基地址为： `0x0x804a000`

我们从调用puts函数那里开始单步执行

首先跳转到plt表中  

```
0x804845d <main+16>               call   puts@plt <0x8048310>
0x8048310  <puts@plt>                  jmp    dword ptr [puts@got.plt] <0x804a00c>
```

call puts之后，下一条指令也是一个跳转

`jmp dword ptr [puts@got.plt] <0x804a00c>`  
这条指令的意思是取出`puts@got.plt`表中的值，放到pc寄存器中

所以？查看一下此处内存的值：

```
pwndbg> x/2x 0x804a00c
0x804a00c <puts@got.plt>:	0x08048316	0x08048326
```

所以下一条指令的地址就是`0x08048316`还是在plt表中

```
► 0x8048316  <puts@plt+6>                push   0
  0x804831b  <puts@plt+11>               jmp    0x8048300
```

这里先将0放到栈上，表明是要解析puts函数的地址，然后再跳转到`0x8048300`也就是plt表的开始部分

```
► 0x8048300                              push   dword ptr [_GLOBAL_OFFSET_TABLE_+4] <0x804a004>
  0x8048306                              jmp    dword ptr [0x804a008] <0xf7ff0650>
```

这时候先把.got.plt表中的第二项放到栈上  
先查看一下.got.plt中前三项的内容:

```
pwndbg> x/3x 0x804a000
0x804a000:	0x08049f14	0xf7ffd938	0xf7ff0650
```

将`0xf7ffd938`放置到栈上，然后跳转到.got.plt中的第三项，也就是  
`0xf7ff0650`，这个地址就是`_dl_runtime_resolve`函数的地址  
负责解析函数的地址

此时我们的got表内容如下：

```
pwndbg> got

GOT protection: Partial RELRO | GOT functions: 4

[0x804a00c] puts -> 0x8048316 (puts@plt+6) ◂— push   0 /* 'h' */
[0x804a010] __gmon_start__ -> 0x8048326 (__gmon_start__@plt+6) ◂— push   8
[0x804a014] exit -> 0x8048336 (exit@plt+6) ◂— push   0x10
[0x804a018] __libc_start_main -> 0xf7e26a00 (__libc_start_main) ◂— push   ebp
```

puts函数的地址还没有重定位

当我们执行过一遍puts函数之后  
这时候回过头来继续查看got表中的内容：

```
pwndbg> got

GOT protection: Partial RELRO | GOT functions: 4

[0x804a00c] puts -> 0xf7e727e0 (puts) ◂— push   ebp
[0x804a010] __gmon_start__ -> 0x8048326 (__gmon_start__@plt+6) ◂— push   8
[0x804a014] exit -> 0x8048336 (exit@plt+6) ◂— push   0x10
[0x804a018] __libc_start_main -> 0xf7e26a00 (__libc_start_main) ◂— push   ebp
```

可以看到地址已经重定位好了

这和Windows的PE文件格式似乎有点不同了，PE文件是装载进内存之后函数地址都已经重定位好了，而Linux的elf文件刚刚装进内存之后函数的地址还是不确定的，需要在运行的时候进行重定位。

当我们将代码修改为如下时：

```c
pwndbg> l 1, 20
// Build with: gcc -m32 -no-pie -g -o plt plt.c

#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv) {
  puts("Hello world!");
  puts("hello world again !!!");
  exit(0);
}
```

第一次调用`puts`函数之后：  
`[0x804a00c] puts -> 0xf7e727e0 (puts) ◂— push ebp`

puts函数地址已经重定位好了

接下来再次调用puts函数

```
► 0x8048310  <puts@plt>    jmp    dword ptr [0x804a00c] <0xf7e727e0>
   ↓
  0xf7e727e0 <puts>        push   ebp
  0xf7e727e1 <puts+1>      push   edi
  0xf7e727e2 <puts+2>      push   esi
  0xf7e727e3 <puts+3>      push   ebx
```

此时可以看到直接就跳到函数的地址了  
因为此时的.got.plt已经是puts函数的地址了， Linux tql

# 整理一下

之前看参考资料中博主的文章一直没有很理解，这里直接统一说一下我的理解：

## 何谓PLT与GOT

其实这里准确的来说应该叫got.plt而不是叫got，不过为了方便我们还是叫它got表吧

![got](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/got0_bmqvjb601.jpg)  
要注意那个`jmp *printf@got` \*号是取出地址处的值，并不是跳到got表中去

## 延迟重定位

这篇文章我觉得写的很精彩

Linux为了缩减代码,就是按照这种模式来的：

```c
void printf@plt()
{
address_good:
    jmp *printf@got            // 链接器将printf@got填成下一语句lookup_printf的地址

lookup_printf:
        调用重定位函数查找printf地址，并写到printf@got

        goto address_good;
}
```

也就和上面那张图是一一对应的

## 公共got表项

在解析函数的真正地址时， `_dl_runtime_resolve`是怎么知道它要解析哪个函数的

因为：

```
printf@plt>:
   jmp *0x80496f8
   push $0x00
   jmp common@plt
```

这里push的值不一样，相当于就是每个函数取了一个id

之后就是公共got表的内容：

-   got\[0\]: 本ELF动态段(.dynamic段）的装载地址
-   got\[1\]：本ELF的link\_map数据结构描述符地址
-   got\[2\]：\_dl\_runtime\_resolve函数的地址

## 穿针引线

![got](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/got1_8tzb6jmh9)

> PLT表中的第一项为公共表项，剩下的是每个动态库函数为一项（当然每项是由多条指令组成的，jmp \*0xXXXXXXXX这条指令是所有plt的开始指令）每项PLT都从对应的GOT表项中读取目标函数地址
> 
> GOT表中前3个为特殊项，分别用于保存 .dynamic段地址、本镜像的link\_map数据结构地址和\_dl\_runtime\_resolve函数地址；但在编译时，无法获取知道link\_map地址和\_dl\_runtime\_resolve函数地址，所以编译时填零地址，进程启动时由动态链接器进行填充

# 参考

[聊聊Linux动态链接中的PLT和GOT（１）——何谓PLT与GOT](https://blog.csdn.net/linyt/article/details/51635768?from=singlemessage)  
[聊聊Linux动态链接中的PLT和GOT（２）——延迟重定位](https://blog.csdn.net/linyt/article/details/51636753)  
[聊聊Linux动态链接中的PLT和GOT（３）——公共GOT表项](https://blog.csdn.net/linyt/article/details/51637832)  
[聊聊Linux动态链接中的PLT和GOT（4）—— 穿针引线](https://blog.csdn.net/linyt/article/details/51893258)  
[GOT and PLT for pwning.](https://systemoverlord.com/2017/03/19/got-and-plt-for-pwning.html)
