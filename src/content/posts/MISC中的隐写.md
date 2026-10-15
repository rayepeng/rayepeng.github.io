---
title: 'MISC中的隐写'
date: 2019-08-19
updated: 2019-08-20
category: 'ctf'
tags:
  - 'MISC'
  - '隐写'
  - 'LSB'
lang: 'zh'
draft: false
---
## bugkuctf——猫片

![](https://i.loli.net/2019/08/19/wZLp2fXUACgbSBn.png)

一张猫的图片，题目有三个提示LSB BGR NTFS

于是用StegSolver去提取数据

看到了PNG的文件头

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/cat0.png)

保存下来在Winhex中打开

修复好图片，然后用微信扫描，（虽然这张图片是颜色反转的，但是新版的微信也能扫出来）

得到一个rar[压缩文件](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/flag.rar)，用winrar解压报错，于是机智的我用7z解压，然而。。。

只好去找师傅们的wp，说是NTFS隐写，给了个[工具](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/ntfsstreamseditor.7z)

这时候就有点坑爹了，用7z解压缩的找不到，必须得用winrar解压缩的才行

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/cat1.png)

得到pyc文件之后需要去这个[网站](https://tool.lu/pyc/)反编译成python代码

得到python代码：

```python
import base64

def encode():
    flag = '*************'
    ciphertext = []
    for i in range(len(flag)):
        s = chr(i ^ ord(flag[i]))
        if i % 2 == 0:
            s = ord(s) + 10
        else:
            s = ord(s) - 10
        ciphertext.append(str(s))
    
    return ciphertext[::-1]

ciphertext = [
    '96',
    '65',
    '93',
    '123',
    '91',
    '97',
    '22',
    '93',
    '70',
    '102',
    '94',
    '132',
    '46',
    '112',
    '64',
    '97',
    '88',
    '80',
    '82',
    '137',
    '90',
    '109',
    '99',
    '112']
```

我的解密脚本

```python
# 解码
def decode():
    res = []
    ciphertextTemp = ciphertext[::-1]
    for i in range(len(ciphertext)):
        s = ciphertextTemp[i]
        if i % 2 == 0:
            s = chr(int(s)-10)
        else:
            s = chr(int(s)+10)
        res.append(chr(int(str(ord(s)^i))))
    return ''.join(x for x in res)

print(decode())
```

## whuctf—taxi.png

这个题目当时使用matlab提取出来的，不过后来才知道用stegsolver也行

只需要打开之后浏览不同的通道即可

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/cat2.png)

[解密网站](https://tool.lami.fun/jiami/aes)  
此时我们简要分析一下StegSolver是如何提取数据的

给出代码：

```python
from PIL import Image

im = Image.open("LSB.bmp")

pix = im.load()

width, height = im.size

extract_bits = []

for y in range(height):
    for x in range(width):
        # 每次取出一个像素点
        r,g,b = pix[(x, y)]
        extract_bits.append(r & 1)
        extract_bits.append(g & 1)
        extract_bits.append(b & 1)

# 然后每8位一组

extract_byte_bits = [extract_bits[i:i+8] for i in range(0, len(extract_bits), 8)]

with open("extracted2.bmp", "wb") as f:
    for per_byte in extract_byte_bits: 
        byte_str = ''.join(str(x) for x in per_byte)  # 将list中的元素拼接起来
        byteStr = chr(int(byte_str, 2))
        f.write(bytes(byteStr, encoding='utf-8'))
```

这个是参考[先知某位师傅](https://xz.aliyun.com/t/1844#toc-0)后修改的，适用于python3

可以帮助理解如何提取，从代码中可以看出，此处是先确定某一处高度，然后依次将宽度上的像素点提取出来，也就是StegSolver中的`Extracted by Row`,并且此处是按照该rgb的顺序来的

大概思考了一下如果要把信息隐藏到图片中，这样应该可以:

```python
from PIL import Image

im = Image.open("LSB.bmp")

pix = im.load()

width,height = im.size

flag = "flag{Ilovyou}"

# 取出flag中的每一位，编码成2进制的8位，3位3位的选出来
# 依次与r,g,b去与
# 

insert_bits = []

for i in range(len(flag)):
	byte = bin(ord(flag[i]))[2:].zfill(8)
	insert_bits.append(byte[x] for x in range(len(byte)))

# 化成3位一组
# 
insert_bits_per_3 = [insert_bits[i:i+3] for i in range(0, len(insert_bits), 3)]

for y in range(height):
	for x in range(width):
		r,g,b = pix[(x,y)]

        ...
```

但是我不知道怎么把数据写回图片。。。未完待续好了

## 实验吧一道题

这样一张bmp格式的图片

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/01.bmp)

解法就是通过Windows的画图工具另存为png格式的，然后用StrgSolver浏览就行

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/shiyanba9.png)

## 问鼎杯保密技能大赛

得到这样一张图片，  
!\[\][https://raw.githubusercontent.com/xinyongpeng/gitpic/master/misc4.png](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/misc4.png)

首先需要修复png格式，其次需要修改宽度，但是需要考虑到crc32校验码

```python
import os
import binascii
import struct

misc = open("misc4.png","rb").read()

# i = 0
# a = struct.pack('>i', i)

for i in range(1024):
	data = misc[12:16] + struct.pack('>i',i)+ misc[20:29]
	crc32 = binascii.crc32(data) & 0xffffffff
	if crc32 == 0x932f8a6b:
		print(i)
```

第一个数据块总共就是13位长，`struct.pack('>i',i)`依次尝试每一个宽度

不过为啥要与`0xffffffff`进行与运算就很神奇

[参考PNG](https://ctf-wiki.github.io/ctf-wiki/misc/picture/png-zh/#chunk)

## 参考

[Lsb图片隐写](https://segmentfault.com/a/1190000016223897)

[github上一个LSB项目](https://github.com/RobinDavid/LSB-Steganography/blob/8c41e05e76cfa94ecc67d25a769aa81fbb3854ac/LSBSteg.py#L4)
