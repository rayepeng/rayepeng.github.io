---
title: 'java多线程'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
先看一段代码

```
public class JavaThreadAnywhere{
	public static void main(String[] args) {
		
		System.out.println("THe main method was executed by thread: " + 
		 Thread.currentThread().getName());
		Helper helper = new Helper("Java Thread Anywhere");
		helper.run();
	}
	static class Helper implements Runnable{
		private final String message;
		public Helper(String message);
		this.message = message;
	}
	private void doSomething(String message){
		System.out.println("The doSomething method was executed by thread :" + 
			Thread.currentThread().getName());
		System.out.println("Do something with " + message);
	}
	@Override
	public void run(){
		doSomething(message);
	}
}
```

犯了一些奇怪的错误， 括号没有匹配！！
![运行结果](https://upload-images.jianshu.io/upload_images/10651191-a58fa7b7bc16a07e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 线程来啦

Java中的线程可以分为守护线程和用户线程

### 线程的创建与运行

在java中， 一个线程就是一个 `java.lang.Thread`类的实例。

因此在java语言中创建一个线程就是创建一个Thread类的实例

再来看一段代码

```
public class JavaThreadCreationAndRun{
	public static void main(String[] args) {
		System.out.println("The main method was executed by thread: " +
		 Thread.currentThread().getName());
		Helper helper = new Helper("Java Thread Anywhere");

		//创建一个线程
		Thread thread = new Thread(helper);

		//设置线程名
		thread.setName("A-Worker-Thread");
		//启动线程
		thread.start();

	}

	static class Helper implements Runnable{
		private final String message;
		public Help(String message){
			this.message = message;
		}
		private void doSomething(String message){
			System.out.println("The doSomething method was executed by thread: " +
			 Thread.currentThread().getName());
			System.out.println("Do something with " + message);
		}

		@Override
		public void run(){
			doSomething(message);
		}
	}
}
```
