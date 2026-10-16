---
title: 'Gephi分析红楼梦'
date: 2019-01-01
category: '心路历程'
tags: []
lang: 'zh'
draft: true
---
#前言
上一周赶了好久的社会网络计算，貌似是第四周还是第五周的时候，那时候我们就把题目定下来了吧，然后一直拖着没有做。其中的原因多种多样 ，其实也可以说没有什么原因，就是不想做而已，然后就假装忘记23333.
不过，因为我的机智，最后还是把红楼梦的人物关系网络图给画出来了。其中的好多东西害怕忘记了，所以写一下记录一下。

基本上，我也就是参考了别人的博客，这里放一个链接。
(用python加gephi分析人民的名义的人物关系网络）
<https://blog.csdn.net/qq_38253732/article/details/80021381>

```
# -*- conding: utf-8 -*-
import codecs
import jieba.posseg as pseg
import jieba
 
# names        :   保存人物，键为人物名称，值为该人物在全文中出现的次数
# relationship :   保存人物关系的有向边，键为有向边的起点，值为一个字典 edge ，edge 的键为有向边的终点，值是有向边的权值，
#                  代表两个人物之间联系的紧密程度
# lineNames    :   缓存变量，保存对每一段分词得到当前段中出现的人物名称
 
names = {}
relationships = {}
lineNames = []
 
jieba.load_userdict("RoleTable.txt")
with codecs.open("人民的名义.txt", 'rb', 'utf8') as f:
    for line in f.readlines():    # 注意是 readlines 要加s 不加s 只读取一行
        poss = pseg.cut(line)    # 分词，返回词性
        lineNames.append([])    # 为本段增加一个人物列表
        for w in poss:
            if w.flag != 'nr' or len(w.word) < 2:
                continue    # 当分词长度小于2或该词词性不为nr（人名）时认为该词不为人名
            lineNames[-1].append(w.word)    # 为当前段的环境增加一个人物
            if names.get(w.word) is None:    # 如果某人物（w.word）不在人物字典中
                names[w.word] = 0
                relationships[w.word] = {}
            names[w.word] += 1
 
# # 输出人物出现次数统计结果
for name, times in names.items():
   print(name, times)

# print(lineNames[-1]);
 
# 对于 lineNames 中每一行，我们为该行中出现的所有人物两两相连。如果两个人物之间尚未有边建立，则将新建的边权值设为 1，
# 否则将已存在的边的权值加 1。这种方法将产生很多的冗余边，这些冗余边将在最后处理。
for line in lineNames:
    for name1 in line:
        for name2 in line:
            if name1 == name2:
                continue
            if relationships[name1].get(name2) is None:
                relationships[name1][name2] = 1
            else:
                relationships[name1][name2] = relationships[name1][name2] + 1

# # 由于分词的不准确会出现很多不是人名的“人名”，从而导致出现很多冗余边，为此可设置阈值为10，即当边出现10次以上则认为不是冗余
with codecs.open("People_node.txt", "w", "utf8") as f:
    f.write("ID Label Weight\r\n")
    for name, times in names.items():
        if times > 10:
            f.write(name + " " + name + " " + str(times) + "\r\n")
#
with codecs.open("People_edge.txt", "w", "utf8") as f:
    f.write("Source Target Weight\r\n")
    for name, edges in relationships.items():
        for v, w in edges.items():
            if w > 10:
                f.write(name + " " + v + " " + str(w) + "\r\n")
#
#
```
以上就是原来博客的代码了。(虽然我还有好多东西都没看懂）

这个时候会生成两个txt文件，一个是人物权重的，一个是人物边之间的关系的。
用excel加载数据，然后另存为csv文件格式（**这里要注意的是，csv文件生成之后，不能在里面修改，不然就....会导致一个很意外的bug**）

效果其实还是很不错的（**所以我特意打开gephi重新画了一下**）
(![人物关系.png](https://upload-images.jianshu.io/upload_images/10651191-3c362e6c5897c357.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

----
分割线，上次写完之后没有及时更新，接着写

>其实我既然可以画出人民的名义的社会网络图，那么，红楼梦的网络图也就会比较简单了。

原理依然是jieba分词，不过这次打开的是红楼梦的文本文件，然后人物字典是我从网上找的。
这里在写代码的时候遇到了很多问题，虽然大部分代码可以复用(其实大部分代码我都没看懂）为此还特意了解了一下jieba这个包是如何用的

```
# -*- conding: utf-8 -*-
import codecs
import jieba.posseg as pseg
import jieba
 
# names        :   保存人物，键为人物名称，值为该人物在全文中出现的次数
# relationship :   保存人物关系的有向边，键为有向边的起点，值为一个字典 edge ，edge 的键为有向边的终点，值是有向边的权值，
#                  代表两个人物之间联系的紧密程度
# lineNames    :   缓存变量，保存对每一段分词得到当前段中出现的人物名称
 
names = {}
relationships = {}
lineNames = []

dict = {}
with codecs.open("RoleTable.txt", "rb", "utf8") as f:
    #怎么把f的内容加入到一个字典中
    #dict[] =
    for line in f.readlines():
        #print(line)

        Word = ""
        for word in line:
            if word == ",":
                break
            else:
                Word = Word+word
        Word = Word[:]
        dict[Word] = "nr"
# jieba.load_userdict("RoleTable.txt")
# with codecs.open("11.txt", 'rb', 'utf8') as f:
#     for line in f.readlines():    # 注意是 readlines 要加s 不加s 只读取一行
#         poss = pseg.cut(line)    # 分词，返回词性
#
#         for word, flag in poss:
#             print((word, flag))
jieba.load_userdict("RoleTable.txt")
jieba.suggest_freq("宝钗", True)
with codecs.open("StoneStory.txt", 'rb', 'utf8') as f:
    for line in f.readlines():    # 注意是 readlines 要加s 不加s 只读取一行
        poss = pseg.cut(line)    # 分词，返回词性

        lineNames.append([])    # 为本段增加一个人物列表
        for w in poss:
            if w.flag != 'nr' or len(w.word) < 2:
                continue    # 当分词长度小于2或该词词性不为nr（人名）时认为该词不为人名
            lineNames[-1].append(w.word)    # 为当前段的环境增加一个人物
            if names.get(w.word) is None:    # 如果某人物（w.word）不在人物字典中
                names[w.word] = 0
                relationships[w.word] = {}
            names[w.word] += 1

# # # 输出人物出现次数统计结果
# for name, times in names.items():
#    print(name, times)

# print(lineNames[-1])
#if  dict.has_key(key)为假，就可以直接在列表中删除这个元素
# for word, flag in poss:
#     print(word, flag)

temp = []

#下面这段代码经过了数次的修改，主要问题集中在如果你修改了line这个列表，它是会实时更新的
#所以你下一次循环就会出问题，这个问题在C语言里面还是很难碰到的
#但是在python这种弱类型的语言里面，要像C语言那样写
i = 0
for line in lineNames:
    temp = []
    for name in line:
        if name in dict.keys():
            temp.append(name)
    line = temp
    print(line)
    lineNames[i] = line
    i = i+1

for line in lineNames:
    print(line)

#要想办法过滤掉一些词语

# 对于 lineNames 中每一行，我们为该行中出现的所有人物两两相连。如果两个人物之间尚未有边建立，则将新建的边权值设为 1，
# 否则将已存在的边的权值加 1。这种方法将产生很多的冗余边，这些冗余边将在最后处理。
for line in lineNames:
    for name1 in line:
        for name2 in line:
            if name1 == name2:
                continue
            if relationships[name1].get(name2) is None:
                relationships[name1][name2] = 1
            else:
                relationships[name1][name2] = relationships[name1][name2] + 1

# # 由于分词的不准确会出现很多不是人名的“人名”，从而导致出现很多冗余边，为此可设置阈值为10，即当边出现10次以上则认为不是冗余
with codecs.open("My_People_node.txt", "w", "utf8") as f:
    f.write("ID Label Weight\r\n")
    for name, times in names.items():
        if times > 10:
            f.write(name + " " + name + " " + str(times) + "\r\n")
#
with codecs.open("My_People_edge.txt", "w", "utf8") as f:
    f.write("Source Target Weight\r\n")
    for name, edges in relationships.items():
        for v, w in edges.items():
            if w > 10:
                f.write(name + " " + v + " " + str(w) + "\r\n")

#
```
老规矩还是放一波代码
其中有一部分过滤的代码是我自己加上去的

```
dict = {}
with codecs.open("RoleTable.txt", "rb", "utf8") as f:
    #怎么把f的内容加入到一个字典中
    #dict[] =
    for line in f.readlines():
        #print(line)

        Word = ""
        for word in line:
            if word == ",":
                break
            else:
                Word = Word+word
        Word = Word[:]
        dict[Word] = "nr"
```
写完这段代码，给我最大的启示就是，python很强大，但是写起来好痛苦。

>代码详解：
我基本的思路就是想把人物角色那个文件打开之后，用dict数据结构把它给存起来。
首先是打开文件，调用f对象的readlines方法，对于读到的每一行，再做一次循环，对于行中的每一个字符，拼接起来（这个字符串的处理好麻烦，不过好像我只想到了这个办法）

` Word = Word[:] `
妈耶，这段代码我现在自己看不懂了23333

还有一段过滤的代码
```
temp = []

#下面这段代码经过了数次的修改，主要问题集中在如果你修改了line这个列表，它是会实时更新的
#所以你下一次循环就会出问题，这个问题在C语言里面还是很难碰到的
#但是在python这种弱类型的语言里面，要像C语言那样写
i = 0
for line in lineNames:
    temp = []
    for name in line:
        if name in dict.keys():
            temp.append(name)
    line = temp
    print(line)
    lineNames[i] = line
    i = i+1

for line in lineNames:
    print(line)
```
写完这段代码我都快自闭了，注释我已经写上去了

之后的步骤其实差不多，但是由于jieba分词在某些地方不是特别准确，加上古文里面，一个人有多个称呼，所以最后经过了漫长的excel筛选和剔除重复的，合并相同的过程，才得到了红楼梦的人物关系网络

#这里有一个问题强调一下
csv格式的文件最好不要乱动，尤其是不要用excel打开之后进行操作，因为这样操作之后，你再打开就会发现，原来不在同一个单元格里面的文字，全部挤到一起去了。
所以最好用xlsx后缀打开，之后再另存为csv文件格式

>来放一张图

![红楼梦人物关系网.png](https://upload-images.jianshu.io/upload_images/10651191-f0cbc6ef6c2f9e38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
