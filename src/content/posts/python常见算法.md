---
title: 'python常见算法'
date: 2019-01-01
category: 'python'
tags: []
lang: 'zh'
draft: true
---
冒泡排序算法
果然是自称高效的冒泡排序算法

```python
def bubble_sort(origin_items, comp=lambda x,y:x>y):
    '''高质量的冒泡排序'''
    items = origin_items[:] 
# 由于python中传递的都是引用，为了避免修改origin_items的元素
    for i in range(len(items)-1):
        swapped = False
        # 先从前往后，再从后往前比，绝了！！
        for j in range(i, len(items)-1-i):
            if comp(items[j], items[j+1]):
                items[j], items[j+1] = items[j+1], items[j]
                swapped = True
        if swapped:
            swapped = False
            for j in range(len(items)-2-i, i, -1):
                if comp(items[j-1], items[j]):
                    items[j], items[j-1] = items[j-1], items[j]
                    swapped = True
            if not swapped:
                break
    return items
```

开始的时候缩进弄错了，后来调试了很久才知道这个算法的大致原理：

首先是正常的冒泡，一路比较过去，如果有交互的，就是swapped = True

重点是为Ture之后它还要再做一次操作：就是从后往前扫描，

在j=5，也就是从前往后扫描结束之后，结果如下：
![](https://upload-images.jianshu.io/upload_images/10651191-0f8259cb80d30c9c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

接着开始从后往前扫描
![](https://upload-images.jianshu.io/upload_images/10651191-03418710b3b28910.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后经过5次循环
这时候其实已经排序的差不多了
![](https://upload-images.jianshu.io/upload_images/10651191-befe9fc0c4c59054.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个想法很巧妙，有很大启发，还可以反向的做！
