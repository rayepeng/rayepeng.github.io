---
title: 'matlab函数'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
fplot(@(x) sin(x)) 用匿名的变量x绘制默认区间在[-5, 5]之间的函数图像

fplot('[x^2, 2-x^2]', [-2 2 -0.5 2.5])
这种形式的书写代码会导致warning
>以后的版本中将会删除 fplot 的字符输入。
请改用 fplot(@(x)[x.^2,2-x.^2])。 

绘制参数曲线x=cos(3t)和y=sin(2t)
xt = @(t) cos(3*t)
yt = @(t) sin(2*t)
fplot(xt,yt)

绘制分段函数
fplot(@(x) exp(x),[-3 0],'b')
hold on
fplot(@(x) cos(x),[0 3],'b')
hold off
grid on

制定线条属性并显示标记
fplot(@(x) sin(x+pi/5),'Linewidth',2);
hold on
fplot(@(x) sin(x-pi/5),'--or');
fplot(@(x) sin(x),'-.*c')
hold off

还可以创建线条之后再修改属性
fp = fplot(@(x) sin(x))

fp = 
  FunctionLine with properties:

     Function: @(x)sin(x)
        Color: [0 0.4470 0.7410]
    LineStyle: '-'
    LineWidth: 0.5000

  Show all properties

通过以下代码可以修改属性
fp.LineStyle = ':';
fp.Color = 'r';
fp.Marker = 'x';
fp.MarkerEdgeColor = 'b';
