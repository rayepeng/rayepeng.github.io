---
title: 'MIPS的栈溢出'
date: 2019-01-01
category: 'IOT'
tags: []
lang: 'zh'
draft: true
---
先看代码：
```mips
addiu $sp, -0x38 #开辟栈空间
sw $ra, 0x38+var_4($sp) #保存返回地址
sw $fp, 0x38+var_8($sp) #保存栈帧基址
move $fp,$sp #创建新栈帧
li $gp,0x4271E0
sw $gp, 0x38+var_28($sp)
sw $a0, 0x30+arg_0($fp)
sw $zero, 0x38+var_20($fp)
sw $zero, 0x38+var_1C($fp)
sw $zero, 0x38+var_18($fp)
sw $zero, 0x38+var_14($fp)
sw $zero, 0x38+var_10($fp)
lw $a1, 0x38+arg_0($fp)
addiu $v0, $fp, 0x38+var_20 #参数v0
move $a0,$v0
la $v0,strcpy #取得strcpy函数的地址
move $t9,$v0
bal strcpy
nop
lw $gp, 0x38+var_28($fp)
lui $v0, 0x41
addiu $a0, $v0, (aCopySuccess - 0x410000)
la $v0,puts
move $t9,$v0
```

栈的构造大体类似x86
就是先保存返回地址，然后保存原来函数栈的基址
然后继续观察，里面有一个数组，从0x38+var_20开始
调用了strcpy函数

这就是很显然的栈溢出了，填充0x38-0x20+0x4 = 28个字节

原始的C语言代码如下：
```c
#include <stdio.h>

void vuln(){
        system("/bin/sh");
}

void has_stack(char *src){
        char dst[20] = {0};
        strcpy(dst,src);
        printf("copy success!n");
}

void main(int argc,char *argv[]){
        has_stack(argv[1]);
}
```
