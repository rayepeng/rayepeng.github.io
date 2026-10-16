---
title: 'matlab对图像进行处理的函数'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
首先还是要对matlab的图像处理函数有一个大致的认识
按照matlab对于函数的命名，
* imread 读取图像
* imwrite 写入图像
* imfinfo 图像信息
* image 展示读取到的图像

直接来一张表格好了

## 显示图像
| [`imshow`](https://ww2.mathworks.cn/help/matlab/ref/imshow.html) | 显示图像                         |
| ------------------------------------------------------------ | -------------------------------- |
| [`image`](https://ww2.mathworks.cn/help/matlab/ref/image.html) | 从数组显示图像                   |
| [`imagesc`](https://ww2.mathworks.cn/help/matlab/ref/imagesc.html) | 显示使用经过标度映射的颜色的图像 |

## 读取写入修改图像
| [`imread`](https://ww2.mathworks.cn/help/matlab/ref/imread.html) | 从图形文件读取图像                 |
| ------------------------------------------------------------ | ---------------------------------- |
| [`imresize`](https://ww2.mathworks.cn/help/matlab/ref/imresize.html) | 调整图像大小                       |
| [`imtile`](https://ww2.mathworks.cn/help/matlab/ref/imtile.html) | 将多个图像帧合并为一个矩形图块图像 |
| [`imwrite`](https://ww2.mathworks.cn/help/matlab/ref/imwrite.html) | 将图像写入图形文件                 |
| [`imfinfo`](https://ww2.mathworks.cn/help/matlab/ref/imfinfo.html) | 有关图形文件的信息                 |
| [`imformats`](https://ww2.mathworks.cn/help/matlab/ref/imformats.html) | 管理图像文件格式注册表             |

## 转换图像类型
| [`frame2im`](https://ww2.mathworks.cn/help/matlab/ref/frame2im.html) | 返回与影片帧关联的图像数据      |
| ------------------------------------------------------------ | ------------------------------- |
| [`im2frame`](https://ww2.mathworks.cn/help/matlab/ref/im2frame.html) | 将图像转换为影片帧              |
| [`im2java`](https://ww2.mathworks.cn/help/matlab/ref/im2java.html) | 将图像转换 Java 图像            |
| [`im2double`](https://ww2.mathworks.cn/help/matlab/ref/im2double.html) | 将图像转换为双精度值            |
| [`ind2rgb`](https://ww2.mathworks.cn/help/matlab/ref/ind2rgb.html) | 将索引图像转换为 RGB 图像       |
| [`rgb2gray`](https://ww2.mathworks.cn/help/matlab/ref/rgb2gray.html) | 将 RGB 图像或颜色图转换为灰度图 |
| [`rgb2ind`](https://ww2.mathworks.cn/help/matlab/ref/rgb2ind.html) | 将 RGB 图像转换为索引图像       |
## 修改图像颜色
| [`imapprox`](https://ww2.mathworks.cn/help/matlab/ref/imapprox.html) | 通过减少颜色数量来近似处理索引图像                       |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| [`dither`](https://ww2.mathworks.cn/help/matlab/ref/dither.html) | 转换图像，通过抖动提高表观颜色分辨率                     |
| [`cmpermute`](https://ww2.mathworks.cn/help/matlab/ref/cmpermute.html) | 重新排列颜色图中的颜色                                   |
| [`cmunique`](https://ww2.mathworks.cn/help/matlab/ref/cmunique.html) | 消除颜色图中的重复颜色；将灰度或真彩色图像转换为索引图像 |

最近突然发现还需要一些对bit进行操作的函数
