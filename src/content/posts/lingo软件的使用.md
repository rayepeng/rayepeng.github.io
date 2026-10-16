---
title: 'lingo软件的使用'
date: 2019-01-01
category: '心路历程'
tags: []
lang: 'zh'
draft: true
---
lingo软件可以用来很方便地求解线性规划问题等

以model开始，以end结束

1. 集合部分
定义变量的部分
SETS：
ENDSETS

集合分为两类，一类是原始集合
另一类是导出集合
2. 目标与约束

3. 数据部分

4. 初始化部分

> 编写的注意要点，除了预定义之外，一切语句都要以分号结尾，即便是注释也需要
内部函数以@符号开头
集合函数
逻辑表达式需要 加#号
变量界定函数
lingo默认数值大于0

一个标准的整数线性规划问题求解程序如下
>xi为第i班报道人员
相当于求解最小值
```
MODEL:
min=x1+x2+x3+x4+x5+x6;
x1+x6>=60;
x1+x2>=70;
x2+x3>=60;
x3+x4>=50;
x4+x5>=20;
x5+x6>=30;
END
```

再来看一道业务员分配问题

做一个指派矩阵

代码如下
```
MODEL:
SETS:
person/1..4/;
task/1..4/;
assign(person, task):a,x;
ENDSETS

DATS:
a=1100,800,1000,700,
600,500,300,800,
400,800, 1000,900,
1100,1000,500,700;
ENDDATA

min=@sum(assign:a*x);
@for(task(j)): @sum(person(i) :

```
