---
title: 'metasploit-构造ROP链攻击'
date: 2019-01-01
category: 'kali&Linux'
tags: []
lang: 'zh'
draft: true
---
DEP
数据执行保护是一种将特定内存区域标记为不可知性的保护机制，这种机制会导致我们在渗透的过程中无法执行shellcode

绕过DEP的技术被称为返回导向编程技术，它不同于通过覆写覆盖EIP的内容，并跳转到shellcode栈溢出的普通方法，因为栈中的数据是不可执行的，因此我们不再跳转到shellcode，而是调用一个ROP指令片段，这些指令片段会共同构成一个链式结构，一个指令片段会返回下一条指令片段，而不执行栈中的代码。
