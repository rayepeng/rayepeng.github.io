---
title: 'Android-进一步分析'
date: 2019-01-01
category: 'Android开发'
tags: []
lang: 'zh'
draft: true
---
> AndroidManifest.xml是Android应用程序中最重要的文件之一。它是Android程序的全局配置文件，是每个 android程序中必须的文件。它位于我们开发的应用程序的根目录下，描述了package中的全局数据，包括package中暴露的组件 （activities, services, 等等），以及他们各自的实现类，各种能被处理的数据和启动位置等重要信息。 

一个典型的Android 应用

![](https://upload-images.jianshu.io/upload_images/10651191-9980b0e4c86584d1.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

该文件的主要功能：
* 它指定了该应用程序的Java包：该包名作为应用程序的一个独特标识。 
* 它描述了应用程序组件：该应用程序由哪些activity，service，broadcast receiver和content provider组成。它指定了实现每个组件的类以及公开发布它们的能力(例如，它们能持有哪个Intent信息)。这些声明使Android系统知道这 儿有什么组件以及在什么条件下它们可以被载入。 

# Android 活动(Activity)
活动代表了一个具有用户界面的单一屏幕
Android 的活动是 ContextThemeWrapper 类的子类。

Android 系统初始化它的程序是通过活动中的 onCreate() 回调的调用开始的。存在有一序列的回调方法来启动一个活动，同时有一序列的方法来关闭活动。

![](https://upload-images.jianshu.io/upload_images/10651191-6d522c3daaeb63c3.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

回调的函数有：
onCreate()	这是第一个回调，在活动第一次创建时调用
onStart()         这个回调在活动为用户可见时被调用

从res/layout/activity_main.xml文件中加载UI组件：
> setContentView(R.layout.activity_main);

> 一个应用程序可以有1个或多个活动，而没有任何限制。每个为应用程序所定义的活动都需要在AndroidManifest.xml中声明。应用的主要活动需要在清单中声明，且意图过滤器标签中需要包含 MAIN 动作和 LAUNCHER 类别。
