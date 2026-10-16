---
title: 'DataFrame对象'
date: 2019-01-01
category: 'python'
tags: []
lang: 'zh'
draft: true
---
#### 创建对象
##### list
```
df = pd.DataFrame([1, 2, 3, 4, 5], columns=['cols'], 
index=['a','b','c','d','e'])
print df
```
返回的结果：
  cols
a     1
b     2
c     3
d     4
e     5

##### 二维list
```
df2 = pd.DataFrame([[1, 2, 3],[4, 5, 6]],
 columns=['col1','col2','col3'], index=['a','b'])
print df2
```
返回结果
   col1  col2  col3
a     1     2     3
b     4     5     6

##### 用np类型的数组
```
df3 = pd.DataFrame(np.array([[1,2],[3,4]]), 
columns=['col1','col2'], index=['a','b'])
print df3
```
返回结果
  col1  col2
a     1     2
b     3     4

##### 用dict创建
```
df4 = pd.DataFrame({'col1':[1,3],'col2':[2,4]},index=['a','b'])
print df4
```
返回结果：
   col1  col2
a     1     2
b     3     4

> 创建DataFrame对象的数据可以为列表，数组和字典，列名和索引为列表对象

#### 基本操作
`df2.index`
返回结果：
> Index([u'a', u'b'], dtype='object')

`df2.columns`
> Index([u'col1', u'col2', u'col3'], dtype='object')

```python
#根据索引查看数据
df2.loc['a']   
# 索引为ａ这一行的数据
# df2.iloc[0] 跟上面的操作等价，一个是根据索引名，一个是根据数字索引访问数据
```
> col1    1
col2    2
col3    3
Name: a, dtype: int64

```python
print df2.loc[['a','b']]    # 访问多行数据，索引参数为一个列表对象
```
>    col1  col2  col3
a     1     2     3
b     4     5     6

`print df.loc[df.index[1:3]]`

>    cols
b     2
c     3
  
```python
# 访问列数据
print df2[['col1','col3']]
```

>    col1  col3
a     1     3
b     4     6

```python
# DataFrame元素求和
# 默认是对每列元素求和
print df2.sum()
```
> col1    5
col2    7
col3    9
dtype: int64
```python
# 行求和
print df2.sum(1)
```

> a     6
b    15
dtype: int64

```python
# 对每个元素乘以２
print df2.apply(lambda x:x*2)
```
>    col1  col2  col3
a     2     4     6
b     8    10    12

---
[DataFram详解](https://blog.csdn.net/u014281392/article/details/75331570)
