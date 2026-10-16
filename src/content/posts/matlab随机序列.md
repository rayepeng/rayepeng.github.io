---
title: 'matlab随机序列'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
伪随机序列发生器有多种，先看一种吧

```matlab
function [row, col] = randinterval(matrix, count, key)
    %计算间隔的位数
    [m,n] = size(matrix);
    interval1 = floor(m*n/count)+1;
    interval2 = interval1 - 2;
    if interval2 == 0
        errot('载体太小不能将信息隐藏进去');
    end
    %生成随机序列
    rand('seed', key);
    a = rand(1, count);
    %初始化
    row = zeros([1 count]);
    col = zeros([1 count]);
    %计算row和col
    r = 1;
    c = 1;
    row(1,1) = r;
    col(1,1) = c;
    for i =2:count
        if a(i) >= 0.5
            c = c + interval1;
        else
            c = c+interval2;
        end
        if c>n
            r = r+1;
            if r>m
                error('载体太小不能将密码信息隐藏进去');
            end
            c = mod(c, n);
            if c==0
                c = 1;
            end
        end
        row(1,i) = r;
        col(1,i) = c;
    end
```

基本思想：
先通过`rand('seed', key);`设置一个种子，控制随机序列产生

产生好随机序列`a = rand(1, count);`之后

循环遍历随机序列`a`中的值，如果大于0.5， `c = c + interval1;`

小于则` c = c+interval2;`

这样控制了列的随机，行随机是显然没有的。。

具体原理emmm
![](https://upload-images.jianshu.io/upload_images/10651191-9604061cc37aa2f2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
