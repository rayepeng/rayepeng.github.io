---
title: 'python文档阅读笔记1'
date: 2019-07-24
updated: 2019-08-11
category: 'note'
tags:
  - 'python'
lang: 'zh'
draft: false
---
# python 官方文档阅读

python可视化编程[网站](http://www.pythontutor.com/visualize.html#mode=edit)

## 循环

### 循环的问题

list类型是可变序列

```python
words = ['cat', 'window', 'defenestrate']
for w in words[:]:
    if len(w) > 6:
        words.insert(0, w)
print(words)
```

如果将上述代码的循环语句改为：  
`for w in words:`  
那么这个循环就变成了死循环  
原因是words这个`list`会被修改

同样的可以看这个：

```python
basket = ['apple', 'orange', 'pear', 'orange', 'banana']
for f in sorted(basket):
    print(f)

print(basket)
```

在经过`sorted`函数之后，basket已经被修改了

可以看这个：

<iframe width="800" height="500" frameborder="0" src="http://pythontutor.com/iframe-embed.html#code=basket%20%3D%20%5B'apple',%20'orange',%20'pear',%20'orange',%20'banana'%5D%0Afor%20f%20in%20sorted%28basket%29%3A%0A%20%20%20%20print%28f%29%0A&amp;codeDivHeight=400&amp;codeDivWidth=350&amp;cumulative=false&amp;curInstr=5&amp;heapPrimitives=nevernest&amp;origin=opt-frontend.js&amp;py=3&amp;rawInputLstJSON=%5B%5D&amp;textReferences=false"></iframe>

同样的list还有这样一个问题：

代码如下：  

```python
def f(a, L=[]):
    L.append(a)
    return L

print(f(1))
print(f(2))
print(f(3))
```

<iframe width="800" height="500" frameborder="0" src="http://pythontutor.com/iframe-embed.html#code=def%20f%28a,%20L%3D%5B%5D%29%3A%0A%20%20%20%20L.append%28a%29%0A%20%20%20%20return%20L%0A%0Aprint%28f%281%29%29%0Aprint%28f%282%29%29%0Aprint%28f%283%29%29&amp;codeDivHeight=400&amp;codeDivWidth=350&amp;cumulative=false&amp;curInstr=15&amp;heapPrimitives=nevernest&amp;origin=opt-frontend.js&amp;py=3&amp;rawInputLstJSON=%5B%5D&amp;textReferences=false"></iframe>

修改成这样就行：

```python
def f(a, L = None):
    if L is None:
        L = []
    L.append(a)
    return L
```

### 循环的tricks

dict循环

```python
knights = {'gallahad':'the pure', 'robin':'the brave'}
for key, value in knights.items():
    print(key, value)
```

list循环

```python
for index, value in enumerate(['tac', 'tic', 'toe']):
    print("index = {}, value = {}".format(index, value))
```

两个list循环

```python
questions = ['name', 'quest', 'favorite color']
answers = ['lancelot', 'the holy grail', 'blue']

for q,a in zip(questions, answers):
    print("what is your {}? It is {}".format(q, a))
```

逆向循环

```python
# 逆向循环序列时，先正向，再调用reverse()函数
for i in reversed(range(1, 10, 2)):
    print(i)
```

指定顺序循环，用`sorted`函数

### 参数的传递

之前还一直没明白python中`**param`这种传递形式的用法  
这个栗子就很棒啦

```python
def cheeseshop(kind, *arguments, **keywords):
    print("-- Do you have any", kind, "?")
    print("-- I'm sorry, we're all out of", kind)
    for arg in arguments:
        print(arg)
    print("-" * 40)
    for kw in keywords:
        print(kw, ":", keywords[kw])
cheeseshop("Limburger", "It's very runny, sir.",
           "It's really very, VERY runny, sir.",shopkeeper="Michael Palin",
           client="John Cleese",
           sketch="Cheese Shop Sketch")
```

结果如下：

```
-- Do you have any Limburger ?
-- I'm sorry, we're all out of Limburger
It's very runny, sir.
It's really very, VERY runny, sir.
----------------------------------------
shopkeeper : Michael Palin
sketch : Cheese Shop Sketch
client : John Cleese
```

第一个kind参数就是第一个字符串，之后`arguments`相当于一个接收了一个list，keywords接收了一个dict

#### 解包参数列表

比如这个栗子：

```python
args = [3,6]
list(range(*args))
```

输出的结果就是  
\[3,4,5\]

也就是说我们可以通过`*`运算符来对一个list进行解包并将其作为参数传递

#### 匿名函数lambda

```python
pairs = [(1, 'one'), (2, 'two'), (3, 'three'), (4, 'four')]
pairs.sort(key=lambda  pair:pair[1])
```

sort方法有两个参数，一个是指定待排序的关键字，一个是reversed，其中key用一个匿名函数进行指定，有一点函数式编程的味道
