---
title: 'IOT D-link'
date: 2019-07-20
updated: 2019-10-06
category: 'IOT'
tags:
  - 'IOT'
  - 'D-LINK'
lang: 'zh'
draft: false
---
# DIR-815栈溢出漏洞

屡次调试都失败了，我才发现原来这个版本的DIR-815已经修复了(DIR-815\_REVB\_FIRMWARE\_2.03.B08)。  
所以这个栈溢出是不存在的

```
.text:0040BE04 move    $a3, $s2
.text:0040BE08 la      $a2, aSSPostxml                  # "%s/%s/postxml"
.text:0040BE0C move    $a0, $s1                         # s
.text:0040BE10 li      $a1, 0x400                       # maxlen
.text:0040BE14 jalr    $t9 ; snprintf
.text:0040BE18 sw      $v0, 0x4F0+var_4E0($sp)
.text:0040BE1C lw      $gp, 0x4F0+var_4D8($sp)
.text:0040BE20 move    $a2, $s1
.text:0040BE24 la      $t9, xmldbc_del
```

# DIR-645 缓冲区溢出漏洞

动态调试：  
在`authenticationcgi_main`处下断点

此时返回地址保存在这里：  
![645-0](https://i.imgur.com/oh6ghYW.png)

之后运行到此处：  
![645-1](https://i.imgur.com/ANbYbap.png)

此时返回地址被覆盖了  
![645-2](https://i.imgur.com/FPyCjMv.png)

继续运行，程序果然崩溃了  
![645-3](https://i.imgur.com/FL4my7C.png)

进入到函数`sub40A424`  
程序在此时崩溃了  
![645-4](https://i.imgur.com/OXwIv4A.png)

尝试修改password长度  
![645-5](https://i.imgur.com/DVBCxyS.png)  
程序还是崩溃了  
![645-6](https://i.imgur.com/MpSoECY.png)  
查看反汇编代码  
程序从外部读入`CONTENT_LENGTH`没有进行任何检查  

```
text:0040B4A0                 la      $t9, getenv
.text:0040B4A4                 la      $a0, aContent_length  # "CONTENT_LENGTH"
.text:0040B4A8                 jalr    $t9 ; getenv
.text:0040B4AC                 move    $s0, $v0
.text:0040B4B0                 lw      $gp, 0xF90+var_F78($sp)
.text:0040B4B4                 beqz    $s0, loc_40B610
.text:0040B4B8                 addiu   $a0, $sp, 0xF90+var_938
.text:0040B4BC                 beqz    $v0, loc_40B614
.text:0040B4C0                 addiu   $a1, $sp, 0xF90+var_E1C
.text:0040B4C4                 la      $t9, atoi
.text:0040B4C8                 nop
.text:0040B4CC                 jalr    $t9 ; atoi
.text:0040B4D0                 move    $a0, $v0         # nptr
.text:0040B4D4                 lw      $gp, 0xF90+var_F78($sp)
.text:0040B4D8                 move    $s0, $v0
.text:0040B4DC                 la      $v1, stdin
.text:0040B4E0                 la      $t9, fileno
.text:0040B4E4                 lw      $a0, (stdin - 0x4353CC)($v1)  # stream
.text:0040B4E8                 jalr    $t9 ; fileno
.text:0040B4EC                 addiu   $s1, $sp, 0xF90+var_430
.text:0040B4F0                 lw      $gp, 0xF90+var_F78($sp)
.text:0040B4F4                 move    $a0, $v0         # fd
.text:0040B4F8                 la      $t9, read
.text:0040B4FC                 move    $a1, $s1         # buf
.text:0040B500                 jalr    $t9 ; read
```

计算偏移量；  
![645-7](https://i.imgur.com/a2gu75K.png)

后面的利用过程感觉比较复杂，没能成功地复现

# DIR-645命令执行漏洞

在安全客上看到了一篇分析DIR-645命令执行地文章，随分析一下原理

直接查看`servicecgi_main`函数

首先会对请求方法进行判断，如果是POST方法则会调用`cgibin_parse_request`解析参数，具体的实现暂时不考虑，主要是解析CONTENT\_TYPE和CONTENT\_LENGTH,之后会调用`sess_ispoweruser`判断是否为合法用户  
之后获取 POST 表单字段，若字段名为 EVENT 的话，就将 “event %s > /dev/null” 作为参数执行 lxmldbc\_system 函数。  
查看`lxmldbc_system`函数  

```
sw      $a1, 0x428+arg_4($sp)
sw      $a2, 0x428+arg_8($sp)
sw      $a3, 0x428+arg_C($sp)
move    $a2, $a0         # format
move    $a3, $v0         # arg
move    $a0, $s0         # s
sw      $v0, 0x428+var_410($sp)
jalr    $t9 ; vsnprintf  
li      $a1, 0x400       # maxlen
```

主要关注最后两条指令，因为这里用到了MIPS中地分支延迟槽技术，所以`$a1`传递参数的指令存放在`jalr`指令之后  
故`vsnprintf($sp+0x428+var_40C,0x400,"event %s > /dev/null",arg_4)`  
vsnprintf函数的用法：

> 函数原型：int vsnprintf(char str, size\_t size, const char format,va\_list ap);  
> 函数说明：将可变参数格式化输出到一个字符数组  
> 参数：str输出到的数组，size指定大小，防止越界，format格式化参数，ap可变参数列表函数用法

接着调用system函数  

```
jalr    $t9 ; system
move    $a0, $s0         # command
```

看一下参数的传递过程  
![645-8](https://i.imgur.com/GJkYz9r.png)

`$s0`本来是栈上的一个变量，`vsnprintf`将可变参数格式化输出到其中，之后又将其作为参数传递给`system`函数

相当于执行了  
`system("event %s > /dev/null")`

这样就可以想办法进行命令注入了

# 参考

[路由器漏洞挖掘之 DIR-815 栈溢出漏洞分析](https://www.zybuluo.com/H4l0/note/1461277)
