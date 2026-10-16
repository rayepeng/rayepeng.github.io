---
title: 'VBA脚本（WORD）'
date: 2019-01-01
category: '软件安全'
tags: []
lang: 'zh'
draft: true
---
我们先从一个最简单的宏脚本开始

```
Sub hidden()
'
' hidden 宏
'
'
    With Selection.Font
        .NameFarEast = "+中文正文"
        .NameAscii = "+西文正文"
        .NameOther = "+西文正文"
        .Name = "+中文正文"
        .Size = 10.5
        .Bold = False
        .Italic = False
        .Underline = wdUnderlineNone
        .UnderlineColor = wdColorAutomatic
        .StrikeThrough = False
        .DoubleStrikeThrough = False
        .Outline = False
        .Emboss = False
        .Shadow = False
        .hidden = True
        .SmallCaps = False
        .AllCaps = False
        .Color = wdColorAutomatic
        .Engrave = False
        .Superscript = False
        .Subscript = False
        .Spacing = 0
        .Scaling = 100
        .Position = 0
        .Kerning = 1
        .Animation = wdAnimationNone
        .DisableCharacterSpaceGrid = False
        .EmphasisMark = wdEmphasisMarkNone
        .Ligatures = wdLigaturesNone
        .NumberSpacing = wdNumberSpacingDefault
        .NumberForm = wdNumberFormDefault
        .StylisticSet = wdStylisticSetDefault
        .ContextualAlternates = 0
    End With
End Sub

```

我们分析一下这段代码的特征
1. Sub 应该是一个结构的开始， End Sub表示一个结构结束了, With和 End With同理

2. 各种属性名：xxxxx

似乎一段宏就到这里了？

# 实现弹窗功能

其实这才是最简单的VBA脚本
```
Sub HelloWorld()

    MsgBox ("hello world !")

End Sub

```
实现了一个弹窗功能

![](https://upload-images.jianshu.io/upload_images/10651191-9a810ff00813cf5f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
 
# 实现用户交互功能
```
Sub Hello()

    Dim X

    X = InputBox("您的姓名是：")

    MsgBox (" 欢迎" & X & "来到宏编程世界！")

End Sub

```

![](https://upload-images.jianshu.io/upload_images/10651191-452cf87a75706f43.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-8128714a13823b47.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

不得不说还是挺神奇的

由此， 最基础的两个函数 inputBox() 和 MsgBox()

# 扩展一下

```
Sub Hello()

Dim X

Dim Y

X = InputBox("您的姓名是：", " 姓名输入框(这是title)", " 您的姓名请输入到这儿.（这是占位字符串）")

Y = MsgBox(" 欢迎您" & X & "朋友！", 0, "这里是欢迎对话框.（这是title）")

End Sub
```

也就是对窗口进行一些额外的装饰

# 流程与结构

```
Sub Hello()

Dim X

Dim Y

X = InputBox("您的姓名是：", " 姓名输入框", " 您的姓名请输入到这儿。")

If X <> "" Then                             '如果X的值不为“空”，那么

Y = MsgBox(" 欢迎您" & X & "朋友！", 0, " 这里是欢迎对话框.")

Else                                         '否则（即，Ｘ的值为“空”）

End If                                       '结束

End Sub

```

这里有一个神奇的特性， 函数的名字其实是不用区分大小写的， 即便是写错了， 也会自动将其转换

# 宏病毒
![](https://upload-images.jianshu.io/upload_images/10651191-076136a2db2c48d9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# Dir函数

返回一个 String，它表示与指定模式或文件属性或驱动器的卷标匹配的文件、目录或文件夹的名称。

![](https://upload-images.jianshu.io/upload_images/10651191-53cfc5fe2c3af193.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个函数的用法好迷啊

![](https://upload-images.jianshu.io/upload_images/10651191-eab3ce3212bf6dbd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

ok我知道这个函数的用法了。
![](https://upload-images.jianshu.io/upload_images/10651191-6eb6b8db4b0a0b19.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-ab37925e0e15dc7a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

是一个类似于正则表达式匹配的函数

老师的宏病毒

![](https://upload-images.jianshu.io/upload_images/10651191-38490e1bd2170d56.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-8f83533252a6b110.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
