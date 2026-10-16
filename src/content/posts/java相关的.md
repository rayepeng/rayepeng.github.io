---
title: 'java相关的'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
[一文让你明白Java字节码](http://www.importnew.com/24088.html)

![helloworld](https://upload-images.jianshu.io/upload_images/10651191-396844ed67501138.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[java命令调试程序](https://blog.csdn.net/future234/article/details/80856038)

[java jdb 命令行调试程序](https://blog.csdn.net/arkblue/article/details/39718947)

[Java编写时钟 Applet 程序](https://www.cnblogs.com/jdemarryme/p/7047751.html)

## 编译器——javac
javac 的作用是 将源程序 后缀名为.java的文件编译成字节码， 后缀名为 .class 的文件， java一次可以编译一个或者多个源文件， 对于源文件中定义的每个类， 都会生成一个单独的类文件。

## 解释器——java

java命令解释器执行java字节码
不需要带上.class的后缀。 可选 参数表

## java Applet观察器——appletviewer
appletviewer 可以使用户不通过web浏览器也可以观察到applet的运行情况

> appletviewer -debug HTML文件

## java应用程序分为两种

java application

java applet

## jdb 调试工具

```
public class HelloWorld{
	public static void main(String[] args) {
		System.out.println("HelloWorld");
	}
}
```

```
public class HelloWorld{
	public static void main(String[] args) {
		System.out.println("HelloWorld");
	}
}
```

```
import java.io.*;

public class Say_Hello_to_You{
	public static void main(String[] args) throws IOException{
		InputStreamReader reader = new InputStreamReader(System.in);
		BufferedReader input = new BufferedReader(reader);
		System.out.print("Enter your name:");
		String name = input.readLine();
		System.out.println("Hello," +name +"!");
	}
}
```
