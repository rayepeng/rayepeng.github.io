---
title: 'Android-开发app入门'
date: 2019-01-01
category: 'Android开发'
tags: []
lang: 'zh'
draft: true
---
这几天正在折腾Android， 好多东西不是很理解， 写下来记着吧

# 新建工程
![](https://upload-images.jianshu.io/upload_images/10651191-a55d948e0fbf3790.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到很多的文件
主要关注以下几个文件

## AndroidManifest.xml

![](https://upload-images.jianshu.io/upload_images/10651191-7027637a218a9462.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个是应用程序的清单文件，描述了应用程序的基础特性，定义它的各种组件。

无论你开发什么组件用作应用程序中的一部分，都需要在应用程序项目根目录下的manifest.xml文件中声明所有的组件。这个文件是Android操作系统与你的应用程序之间的接口，因此，如果没有在这个文件中声明你的组件，将无法被操作系统所识别。

## strings.xml文件

![](https://upload-images.jianshu.io/upload_images/10651191-9f8e54a1627c3020.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

strings.xml文件在res/value文件夹下，它包含应用程序使用到的所有文本。例如，按钮、标签的名称，默认文本，以及其他相似的strings。这个文件为他们的文本内容负责。

## R文件
这个文件是自动生成的
活动的Java文件，如MainActivity.java的和资源如strings.xml之间的胶水

## activity_main文件 

![](https://upload-images.jianshu.io/upload_images/10651191-f38234fe159a07fb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

是一个在res/layout目录下的layout文件。当应用程序构建它的界面时被引用。你将非常频繁的修改这个文件来改变应用程序的布局。

# ActivityManifest.xml文件
四大组件需要在AndroidManifest文件中配置否则无法使用，类似Activity无法启动，

一般情况下：
在新建一个activity后，为了使intent可以调用此活动，我们要在androidManifest.xml文件中添加一个<activity>标签，<activity>标签的一般格式如下：

```
<activity
            android:name="my.test.intents.MainActivity"
            android:label="@string/app_name" >
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
```

* "android:name"是活动对应的类名称
* "android:label"是活动标题栏显示的内容
* <intent-filter>是意图筛选器
* <action>是动作名称，是指intent要执行的动作
* <category>是类别名称
一般情况下，每个<intent-filter> 中都要显示指定一个默认的类别名称，即`<category android:name="android.intent.category.DEFAULT" />`

但是上面的代码中没有指定默认类别名称，这是一个例外情况，因为其<intent-filter> 中的<action>是"android.intent.action.MAIN"，意思是这项活动是应用程序的入口点，这种情况下可以不加默认类别名称。

当我修改这个的时候， 提示是失败的

![](https://upload-images.jianshu.io/upload_images/10651191-172b2ad0d8b583f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果我修改成这个样子呢？
![](https://upload-images.jianshu.io/upload_images/10651191-ef16be8f41651b65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
