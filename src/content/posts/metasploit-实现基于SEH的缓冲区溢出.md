---
title: 'metasploit-实现基于SEH的缓冲区溢出'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
## 0x0x1 知识补充
异常处理程序：(exception handler)
式用来捕获在程序执行期间生成的异常和错误的代码模块，这种机制可以保证程序继续执行而不崩溃

当程序产生了异常之后，就会从栈中加载catch代码的地址并调用catch代码，因此，如果以某种方式设法覆盖了程序的catch代码地址，我们就能够控制这个程序

栈中包含了catch块的地址，我们需要改写它

SEH结构：
一个SEH记录中的前四个字节是它后面的SEH异常处理程序的地址，后四个字节是catch块的地址，一个应用程序可能有多个异常处理程序，因此一个SEH记录将前四个字节用来保存下一条SEH记录的地址

利用过程
1. 引起应用程序的异常
2. 使用一条PPR指令来改写异常处理程序的地址
之所以使用PPR，是因为用来调用catch块的内存地址保存在栈中，指向下一条SEH指针的地址就是ESP+8，因此两个POP操作就可以执行重定向到下一条SEH记录的地址

用人话来说，就是程序发生异常时，会跳到一个地址处，而我们预先将这个地址的内容填充为一条指向PPR指令的地址，然后EIP就会执行PPR指令，此时ESP就加8，指向了下一条SEH记录，下一条SEH记录中包含了一条短跳转指令，短跳转之后就会执行我们预先设定的shellcode

接下来是具体的操作步骤：

## 0x02 exploit

1. 构造输入，让程序崩溃，获取到SEH的记录

> /pattern_create.rb -l 10000 > a.txt
python -c "print(' HTTP/1.0\r\n\r\n')" > b.txt
cat a.txt b.txt > c.txt
vim -b c.txt

nc 192.168.41.144  80 < c.txt

2. 确定偏移量

3. 搜索PPR指令
