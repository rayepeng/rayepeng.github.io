---
title: 'python3字符串'
date: 2020-02-06
category: '编程'
tags:
  - '字符串'
  - 'bytes'
lang: 'zh'
draft: false
---
## 相关函数

### 性质判定

```
isalnum()、isalpha()、isdigit()、islower()、isupper()、isspace()、istitle()、startswith(prefix[,start[, end]])、endswith(suffix[,start[, end]])
```

### 查找和替换

```
count( sub[, start[, end]])、find( sub[, start[,end]])、index( sub[, start[, end]])、rfind( sub[, start[,end]])、rindex(sub[, start[, end]])
```

注意find()和index()方法的不同：find()函数族找不到时返回-1，index()函数族则抛出ValueError异常。

但是对于判定是否包含字串的判定推荐用 `in` 和 `not in`操作符

`replace(old, new[,count])`用以替换字符串的某些子串，如果指定count参数的话，就最多替换count次，如果不指定，就全部替换

### 分切和连接

`partition()` 和 `split`

split举例

```python
>>> ' hello     world'.split()
['hello', 'world']
>>> ' hello     world'.split(' ')  # 要注意第一种方式和第二种方式不一样
['', 'hello', '', '', '', '', 'world']
>>> ' hello     world'.split('')
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
ValueError: empty separator
    

>>> ''.split()
[]
>>> ''.split(' ')
['']
```

### 变形

```
lower()、upper()、capitalize()、swapcase()、title()
```

### 删减与填充

```
strip([chars])、lstrip([chars])、rstrip([chars])

center(width[, fillchar])、ljust(width[,fillchar])、rjust(width[, fillchar])、zfill(width)、expandtabs([tabsize])
```

这些方法中的fillchar参数是指用以填充的字符，默认是空格。而zfill()中的z是指zero，所以顾名思义，zfill()即是以字符0进行填充，在输出数值时比较常用。expandtabs()的tabsize参数默认为8，它的功能是把字符串中的制表符（tab）转换为适当数量的空格。

## f字符串

### 基本用法

```python
In [2]: name = "pxy"

In [3]: f'Hello, my name is {name}'
Out[3]: 'Hello, my name is pxy'
```

求值运算

```python
In [5]: >>> f'Complex number {(2 + 2j) / (2 - 3j)}'
Out[5]: 'Complex number (-0.15384615384615388+0.7692307692307692j)'
    
In [6]: import math

In [7]: f'The answer is {math.log(math.pi)}'
Out[7]: 'The answer is 1.1447298858494002
```

f-string大括号内也可填入lambda表达式，但lambda表达式的 `:` 会被f-string误认为是表达式与格式描述符之间的分隔符，为避免歧义，需要将lambda表达式置于括号 `()` 内：

```python
In [1]: f'result is {(lambda x: x ** 2 + 1) (2)}'
Out[1]: 'result is 5'
```

## bytes

### str转bytes

```python
In [23]: bytes(a, encoding="gbk")
Out[23]: b'\xb0\xd9\xb6\xc8'

In [24]: bytes(a, encoding="utf-8")
Out[24]: b'\xe7\x99\xbe\xe5\xba\xa6'
```

### 从十六进制转化为bytes

```python
In [39]: a = 'aabbccddeeff'

In [40]: a_bytes = bytes.fromhex(a)

In [41]: a_bytes
Out[41]: b'\xaa\xbb\xcc\xdd\xee\xff'
```

### 从bytes转化为十六进制

```python
In [42]: a_bytes
Out[42]: b'\xaa\xbb\xcc\xdd\xee\xff'

In [43]: a_bytes.hex()
Out[43]: 'aabbccddeeff'
```

### base64编码byets

python3的base64包的 `b64encode` 只能使用 bytes 类型

```python
# 比如我们要编码 \xac\xed
In [54]: a = "aced"

In [55]: a = bytes.fromhex(a)

In [56]: a
Out[56]: b'\xac\xed'

In [57]: base64.b64encode(a)
Out[57]: b'rO0='
```

### md5加密bytes

python3 只能用hashlib中的md5函数

```python
a = hashlib.md5()
a.update(b"pxy")
a.hexdigest()
```

封装一下

```python
# 生成MD5
def genearteMD5(str):
    # 创建md5对象
    hl = hashlib.md5()

    # Tips
    # 此处必须声明encode
    # 否则报错为：hl.update(str)    Unicode-objects must be encoded before hashing
    hl.update(str.encode(encoding='utf-8'))

    print('MD5加密前为 ：' + str)
    print('MD5加密后为 ：' + hl.hexdigest())
```

## 一些小技巧

### 判断字符串是否为空

用 `a == None` 是不行的

可以这样

```python
a = ""
if a.strip() == "":
	print("a is null")
```

### list和str转换

```python
In [17]: a = "aaaafasfasd"

In [18]: list(a)
Out[18]: ['a', 'a', 'a', 'a', 'f', 'a', 's', 'f', 'a', 's', 'd']
```

### 固定长度分割字符串

传统上一般是遍历

```python
def fix_width_split(string, width):
    return [string[x : x + width] for x in range(0, len(string), width)]

print fix_width_split('123456789', 3)
```

但是如果有了正则，可以这样

```python
import re

string = '123456789'
split = re.findall(r'.{7}', string)
```

结果

```python
In [76]: string = '123456789'

In [77]: split = re.findall(".{3}", string)

In [78]: split
Out[78]: ['123', '456', '789']
```

### bytes写入文件

以二进制方式打开即可

## 参考

[python格式化字符串f-string](https://blog.csdn.net/sunxb10/article/details/81036693)

[python字符串trick](https://www.40huo.cn/blog/python-string-tricks.html)
