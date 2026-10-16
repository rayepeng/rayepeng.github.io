---
title: 'java对大作业的分析'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
# 零基础教你入门java

直接分析程序源代码

`client`类

```java
public class Client   //client类 
/*    */ {
/*    */   public static void main(String[] args)  //main方法，相当于C语言中的main
/*    */     throws Exception, IOException  //异常处理，先不管
/*    */   {
/* 32 */     Socket socket = new Socket("10.133.233.167", 1234);  //new 一个Socket的对象，Socket是内置的类，同时给这个socket对象传入初始化值IP地址和端口号，这个socket对象有很多方法，比如可以得到输入给socket的数据，也可以得到输出给socket的数据
/* 33 */     DataInputStream dataIn = new DataInputStream(socket.getInputStream()); //new 一个数据输入流对象
/* 34 */     ObjectOutputStream objectOut = new ObjectOutputStream(socket.getOutputStream()); //new 一个对象输出流
/* 35 */     ClientWindow client = new ClientWindow(objectOut);   //new 一个客户端窗口类
/*    */     for (;;)
/*    */     {
/* 38 */       byte[] image = new byte[dataIn.readInt()];  //不断地读取图像数据？
/* 39 */       dataIn.readFully(image);
/* 40 */       client.repaintImage(image);
/*    */     }
/*    */   }
/*    */ }

```

`clientWindow`类
