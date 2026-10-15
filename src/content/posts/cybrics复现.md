---
title: 'cybrics复现'
date: 2019-07-31
updated: 2019-08-19
category: 'ctf'
tags:
  - 'wp'
  - 'cybrics'
lang: 'zh'
draft: false
---
目前太菜了，没做出几道cybrics的题目，趁着题目还在复现一波

## Zakukozh

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/cybrics0.png)  
[下载地址](https://dystopia.sg/files/zakukozh.bin)

下载了一个文件，于是想查看文件类型：

`zakukozh.bin: data`

题目中有提示说是`affine cipher`

`affine cipher`中文翻译过来就是放射密码，可以理解成简单的替换加密，比如wikipedia上举出的[栗子](https://en.wikipedia.org/wiki/Affine_cipher#Examples)

> 一个大小为m的字母表，通过变换 $E(x) = (ax+b) mod \\, m$ 得到密文

查看文件的十六进制形式，学习一些`hexdump`命令

```
pxy@LAPTOP-UBIEP4K5  /mnt/f/1.ctf/cybrics/crypto  hexdump -C zakukozh.bin| head
00000000  60 09 eb 82 1c ef df ef  59 59 59 1c a0 91 55 27  |`.......YYY...U'|
00000010  59 59 77 bc 59 59 59 2e  d1 77 59 59 59 a9 44 38  |YYw.YYY..wYYY.D8|
00000020  31 59 59 59 68 16 27 82  37 59 8b 6b fd 00 59 59  |1YYYh.'.7Y.k..YY|
00000030  59 95 62 28 dc 28 59 59  b8 ba fe 1d 08 a4 59 59  |Y.b(.(YY......YY|
00000040  59 e0 e9 91 90 16 59 59  2b c6 59 59 2b c6 68 02  |Y.....YY+.YY+.h.|
00000050  da 31 35 59 59 fe 7e a0  55 28 45 61 db 3c 3d 10  |.15YY.~.U(Ea.<=.|
00000060  08 a6 a1 a3 a4 89 ab 3e  68 b0 1b 82 a6 35 fd cd  |.......>h....5..|
00000070  1c e0 d9 de 59 67 7f e3  45 70 b0 e2 e6 22 55 17  |....Yg..Ep..."U.|
00000080  32 d9 de 3e 87 1d d2 c2  59 51 e7 e6 59 49 a2 82  |2..>....YQ..YI..|
00000090  68 39 eb ab 77 19 7d fd  a4 d9 a1 b0 ef 59 f8 07  |h9..w.}......Y..|
```

查看十六进制数据如上，根据题目的提示，这就是仿射加密之后的结果，那么如何确定a,b,m这三个参数

由于是二进制数据，那么m就是256  
a和b就通过爆破来解决

脚本如下：

```python
def reffine(a, b, c):
    return chr((a * (ord(c) - b)) % 256)

with open('zakukozh.bin') as f:
	encrypted = f.read()

for i in range(256):
    for j in range(256):
        decrypted = ''.join([reffine(i, j, c) for c in encrypted])

        with open('output/dec_{}_{}.out'.format(i, j), 'wb') as f:
            f.write(decrypted)
```

就是跑的太慢了 :joy:
