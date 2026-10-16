---
title: '一步步学ROP'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
```c
#undef _FORTIFY_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

void vulnerable_function() {
	char buf[128];
	read(STDIN_FILENO, buf, 256);
}

int main(int argc, char** argv) {
	vulnerable_function();
	write(STDOUT_FILENO, "Hello, World\n", 13);
}
```
首先复习一下Linux read函数
```c
#include <unistd.h>    
ssize_t read(int fd, void *buf, size_t count);  
```
>成功返回读取的字节数，出错返回-1并设置errno，如果在调read之前已到达文件末尾，则这次read返回0

参数：
count
是请求读取的字节数，读上来的数据保存在缓冲区buf中，同时文件的当前读写位置向后移。注意这个读写位置和使用C标准I/O库时的读写位置有可能不同，这个读写位置是记在内核中的，而使用C标准I/O库时的读写位置是用户空间I/O缓冲区中的位置。比如用fgetc读一个字节，fgetc有可能从内核中预读1024个字节到I/O缓冲区中，再返回第一个字节，这时该文件在内核中记录的读写位置是1024，而在FILE结构体中记录的读写位置是1。注意返回值类型是ssize_t，表示有符号的size_t，这样既可以返回正的字节数、0（表示到达文件末尾）也可以返回负值-1（表示出错）。
read函数返回时，返回值说明了buf中前多少个字节是刚读上来的。有些情况下，实际读到的字节数（返回值）会小于请求读的字节数count，例如：读常规文件时，在读到count个字节之前已到达文件末尾。例如，距文件末尾还有30个字节而请求读100个字节，则read返回30，下次read将返回0。

> STDIN_FILENO属于系统API接口库，其声明为 int 型，是一个打开文件句柄，对应的函数主要包括 open/read/write/close 等系统级调用

stdin类型为 FILE*
STDIN_FILENO类型为 int

之后再认识一下句柄的概念：
句柄的英文是handle，中文就是把手的意思
意思就是用它来控制一个东西，就像把手可以用来控制门一样

句柄就是个数字，一般和当前系统下的整数的位数一样，比如32bit系统下就是4个字节。

这个数字是一个对象的唯一标示，和对象一一对应。这个对象可以是一个块内存，一个资源，或者一个服务的context（如 socket，thread）等等。这个数字的来源可以有很多中，只要能保证和它代表的对象保持唯一对应就可以，比如可以用内存地址，也可以用句柄表的序号，或者干脆用一个自增ID，再或者用以上的值去异或一个常数。

还有write函数
```c
#include <unistd>
ssize_t write(int filedes, void *buf, size_t nbytes);
```
返回：若成功则返回写入的字节数，若出错则返回-1

两个函数还是很对称的

接下来就是直接看代码了
这里缓冲区溢出的漏洞是显然的

但是编译的时候采用
> gcc -fno-stack-protector -z execstack -o level1 level1.c

同时需要在shell中执行：
echo 0> /proc/sys/kernel/randomize_va_space

注意要先切换到root身份才行
