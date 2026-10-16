---
title: 'leetCode题目整理'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
之前在LeetCode上做了很多题目，一直没沉下心来整理。
这几天遇到的题目有点难了，要想深入的学习下去还需要好好回顾之前的知识

## java: Set&List

List接口是Collection的子接口，用于定义线性表结构，其中ArrayList可以理解为一个动态数组，而LinkedList可以理解为一个链表

java中常见的List，`ArrayList`,`LinkedList`,`Vector`,`Stack`

举例如下：
```java
public class javaList {
    public static void main(String[] args) {
        //new 一个ArrayList
        List<String> listOne = new ArrayList<>();

        //添加元素
        listOne.add("python");
        listOne.add("java");
        //获得元素
        String strFirst = listOne.get(0);
        //替换元素的同时，会返回当前位置原来的值
        String strTwo = listOne.set(1, "android");
        System.out.println("the Old strTwo is  "+strTwo);
        listOne.add("PHP");
        //移除指定位置的元素
        String sByRemove = listOne.remove(2);
        System.out.println("element by removed return :" + sByRemove);
        //获得List的大小
        System.out.println("listOne的大小是：" + listOne.size());
        //使用toArray()方法将其转化为数组
        String[] listOneToArray = listOne.toArray(new String[listOne.size()]);
        //迭代List
        for (String str : listOne) {
            System.out.println(str);
        }
        //数组转为List
        List<String> listOneToArrayToList = Arrays.asList(listOneToArray);
        for (String str : listOneToArrayToList) {
            System.out.println(str);
        }
        //直接打印List本身，应该是调用了toString方法
        System.out.println(listOneToArrayToList);
    }
}
```

最后输出的结果为：

```java
the Old strTwo is  java
element by removed return :PHP
listOne的大小是：2
python
android
python
android
[python, android]
```
可以看到List和python中的List是很相似的，但是java中的List是只能存放一种类型的元素

然后就是Java的Set类型

看我的实例代码：
```java
package javaStudyDemo;

import java.util.*;

/*
学习一下java中的set
 */
public class javaSet {
    public static void main(String[] args) {
        Set<String> setOne = new HashSet<>();
        setOne.add("java");
        setOne.add("python");
        setOne.add("php");
        //再添加一个重复的python
        setOne.add("python");
        setOne.remove("python");
        setOne.remove(1);

        Iterator iterator = setOne.iterator();
        while (iterator.hasNext()) {
            System.out.println(iterator.next());

        }

        for (String str : setOne) {
            System.out.println(str);
        }
        System.out.println(setOne);
        //转化为数组？
        String[] setToArray = setOne.toArray(new String[setOne.size()]);
        System.out.println(setToArray);

        //数组转List
        List setToArrayToList = Arrays.asList(setToArray);
        System.out.println(setToArrayToList);

        //List再转Set
        Set setToArrayToListToSet = new HashSet(setToArrayToList);
        System.out.println(setToArrayToListToSet);

    }
}
```
输出结果为：
```java
java
php
java
php
[java, php]
[Ljava.lang.String;@27ddd392
[java, php]
[java, php]
```

总结一下：
数组转List
`List setToArrayToList = Arrays.asList(setToArray);`
数组转Set, 先转换成List，再转换成Set
List转数组
`String[] listOneToArray = listOne.toArray(new String[listOne.size()]);`
Set转数组
`String[] setToArray = setOne.toArray(new String[setOne.size()]);`
所以List和Set转数组都是直接调用了toArray方法
而Array转另外两种则是调用了asList方法
那么List转Set的时候，如果有重复元素会出现什么情况呢？

暂且按下这个问题，因为我遇到了一个新问题，当我尝试使用数组转换后的List的add方法时，java报错了
**UnsupportedOperationException**

此ArrayList非我们常用的ArrayList，我们常用的ArrayList是java.util.ArrayList，而这里new的是java.util.Arrays.ArrayList，他是Arrays类下的一个内部类，

java.util.Arrays.ArrayList和java.util.ArrayList都继承至AbstractList抽象类，但是它并没有实现add方法和remove方法，当我们调用add方法的时候，它实际调用的是父类AbstractList的add方法

查找了相关资料，并结合java的报错信息：
报错信息如下：
```java
Exception in thread "main" java.lang.UnsupportedOperationException
	at java.util.AbstractList.add(AbstractList.java:148)
	at java.util.AbstractList.add(AbstractList.java:108)
	at javaStudyDemo.javaSet.main(javaSet.java:48)
```
由于java的异常信息是从后往前读的
我们先看`at java.util.AbstractList.add(AbstractList.java:108)`
```java
    public boolean add(E e) {
        add(size(), e);
        return true;
    }
```
这是`AbstractList`类中的add方法
但是其具体实现却是抛出异常
```java
    public void add(int index, E element) {
        throw new UnsupportedOperationException();
    }
```
当我们查看`AbstractList`类的子类时：
![](https://upload-images.jianshu.io/upload_images/10651191-17d0ebb61bbb6986.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

惊奇的发现这里有两个`ArrayList`！

一个是`Arrays`类中的一个静态类
[图片上传失败...(image-442f7d-1559719147122)]

还有一个就是我们熟知的`ArrayList`
