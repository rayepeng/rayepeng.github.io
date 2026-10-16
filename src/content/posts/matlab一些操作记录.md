---
title: 'matlab一些操作记录'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
## 如何快速注释

`ctrl+R`一次性注释多行

## find函数用法

`b = find(a)` 查找a中不为0的元素的索引
比如a是行向量的情况
```
>> a = [1,0,2]
a =
     1     0     2
>> find(a)
ans =
     1     3
```
再如
a是列向量的情况
```
>> a = [1;2;0;3]
a =
     1
     2
     0
     3
>> find(a)
ans =
     1
     2
     4
```

如果a是一个矩阵呢？
```
>> a = [1,0,2;3,2,0]
a =
     1     0     2
     3     2     0
>> find(a)
ans =
     1
     2
     4
     5
```

`find`函数中还可以设定条件
```
>> a
a =
     1     0     2
     3     2     0
>> find(a==3)
ans =
     2
>> find(a>2)
ans =
     2
```

注意查找矩阵的时候返回的是矩阵的线性索引
所以当你需要查找的是行下标和列下标的时候，需要用到`ind2sub`函数

```
>> [col,row] = ind2sub(a,2) %注意不要忘记加入矩阵a
col =
     1
row =
     2
```

当然没必要这么麻烦
直接接受col.和row即可(猜测是函数重载了
```
>> [col,row] = find(a==3)
col =
     2
row =
     1
```

还有find可以找出最先出现的不为0的多少个数
```
a =
     1     0     2
     3     2     0
>> find(a,4)
ans =
     1
     2
     4
     5
```
那么我们可以实现找出大于某个数的最先出现的前几个数字
```
a =
     1     0     2
     3     2     0
>> find(a>1,3)
ans =
     2
     4
     5
```

## matlab文件操作

移动文件`movefile(filename, dest_path)`

复制文件同样的操作`copyfile`

## 删除文件或文件夹
`delete(filename)`

删除文件夹及其所有的文件
`rmdir(dir_name, 's')`要加一个`s`参数

## 遍历文件夹下的所有文件

**注意不要覆盖dir**这个变量

`dir(path)`可以列出目录下的所有文件，注意有两个多余的文件

```
>> dir('.')

.                19.jpg           compare.m        
..               2416-1.jpg       draw_img.m       
1024.jpg         2416.jpg         hsv_hist.m       
1097.jpg         2417.jpg         img              
1145.jpg         calc_1to100.m    lena.bmp         
18.jpg           calc_all_hist.m  
```
这里的返回结果其实是一个结构体
```
>> a = dir('.');
>> a
a = 
17x1 struct array with fields:
    name
    date
    bytes
    isdir
    datenum
```

### 统计目录下的文件个数
`size(dir(path)) - 2`(因为有两个多余的文件

### 遍历目录下的所有文件
```
list  =  dir(path)
list.name %引用结构体的一个字段
```
