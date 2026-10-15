---
title: 'python文档阅读笔记2'
date: 2019-07-30
category: 'note'
tags:
  - 'python'
  - 'python字节码'
  - 'tricks'
lang: 'zh'
draft: false
---
# fluent python reading notes

## 列表推导式

最常见的一种写法

```python
symboles = 'ABC%^&*#@$'
beyond_ascii = [ord(s) for s in symboles if ord(s) > 40]
print(beyond_ascii)
```

但是也可以同时用`filter`和`map`函数来实现

```python
beyond_ascii = list(filter(lambda x: x > 40, map(ord, symboles)))
print(beyond_ascii)
```

map函数将一个函数作用于list中的每一个值上，filter也是对数组中的每一个值作用一个函数，但是只返回为真的数值，python3中最后返回的是一个filter对象

比如过滤列表中的所有奇数

```python
# 过滤出列表中的所有奇数
a = [1,242,45,23,536,1,325,63635,56335]
a_is_odd = list(filter(lambda x: x % 2 != 0, a))
print(a_is_odd)
```

再比如过滤出1~100中平方根是整数的数字  
所谓整数就是能整除1的数字

```python
#过滤出1~100中平方根是整数的数
import math
g_is = list(filter(lambda x: math.sqrt(x) % 1 == 0, range(1, 101)))
print(g_is)
```

## 解包

如下是一个比较神奇的栗子，  

```python
# python解包
colors = ['black', 'white']
sizes = ['S', 'M', 'L']
for tshirt in ('%s %s' % (c, s) for c in colors
                                for s in sizes):
    print(tshirt)
```

这里用一个`%`将元组进行了拆包  
如何很好地理解列表推导式呢？

你可以将其想象为一个函数，`for c in colors for s in sizes` 返回值是`(c, s)` 用一个`%`成功地对其进行了拆包转化为字符串形式

下面这幅图应该比较好理解  
![python](/2019/07/30/python-wen-dang-yue-du-bi-ji-2/python_dvmmoijlo.png)

然后就有了返回值  
![python0](/2019/07/30/python-wen-dang-yue-du-bi-ji-2/python0_9np9b5bvn.png)

当然还有这种写法：

```python
a, b, *rst = range(5)
```

## 陷阱

```python
t = (1,2, [30, 40])
t[2] += [50, 60]
print(t)
```

在一个不可变对象中插入了可变对象！

虽然报错但是t的值确实被修改了

对其进行反汇编或者是反编译：  
得到：

```python
3           0 LOAD_CONST               1 (1)
              3 LOAD_CONST               2 (2)
              6 LOAD_CONST               3 (30)
              9 LOAD_CONST               4 (40)
             12 BUILD_LIST               2
             15 BUILD_TUPLE              3
             18 STORE_FAST               0 (t)

  4          21 LOAD_FAST                0 (t)
             24 LOAD_CONST               2 (2)
             27 DUP_TOP_TWO
             28 BINARY_SUBSCR
             29 LOAD_CONST               5 (50)
             32 LOAD_CONST               6 (60)
             35 BUILD_LIST               2
             38 INPLACE_ADD
             39 ROT_THREE
             40 STORE_SUBSCR
```

作者提出的三个教训：

1.  不要把可变对象放在元组里面
2.  增量赋值不是一个原子操作
3.  查看python的字节码并不难，而且了解代码背后的运行机制很有帮助

然后我们就来研究python的字节码

## python字节码

### 变量

> LOAD\_FAST一般加载局部变量的值，也就是读取值，用于计算或者函数调用传参等。  
> STORE\_FAST一般用于保存值到局部变量。

比如：

```python
61          77 LOAD_FAST                0 (n)
             80 LOAD_FAST                3 (p)
             83 INPLACE_DIVIDE
             84 STORE_FAST               0 (n)
```

`INPLACE_DIVIDE`就是原地除法，先加载n，然后加载p，然后除法，然后保存结果

对应的就是

`n = n/p`

> 如何区分函数形参和其他的局部变量？
> 
> 形参没有初始化，也就是从函数开始到LOAD\_FAST该变量的位置，如果没有看到STORE\_FAST，那么该变量就是函数形参。

```python
4           0 LOAD_CONST               1 (0)
            3 STORE_FAST               1 (local1)

5           6 LOAD_FAST                1 (local1)
            9 PRINT_ITEM
           10 LOAD_FAST                0 (arg1)
           13 PRINT_ITEM
           14 PRINT_NEWLINE
           15 LOAD_CONST               0 (None)
           18 RETURN_VALUE
```

这里`arg1`就没有`STORE_FAST`  
所以对应的源代码为：

```python
def test(arg1):
    local1 = 0
    print local1, arg1
```

### 全局变量

> LOAD\_GLOBAL用来加载全局变量，包括指定函数名，类名，模块名等全局符号。

```python
8           6 LOAD_CONST               2 (101)
            9 STORE_GLOBAL             0 (global1)
            20 LOAD_GLOBAL              0 (global1)
            23 PRINT_ITEM
```

对应的python代码：

```python
def test():
    global global1
    global1 = 101
    print global1
```

### 常用数据类型

> BUILD\_LIST用于创建一个list结构。

如果是用列表推导式呢？

> BUILD\_MAP用于创建一个空的dict。STORE\_MAP用于初始化dict的内容。

```python
3           0 LOAD_CONST               1 ('a')
              3 LOAD_CONST               2 ('1')
              6 BUILD_MAP                1
              9 STORE_FAST               0 (k)
             12 LOAD_CONST               0 (None)
             15 RETURN_VALUE
```

# 参考

[死磕python字节码-手工还原python源码](https://zhuanlan.zhihu.com/p/45101508)
