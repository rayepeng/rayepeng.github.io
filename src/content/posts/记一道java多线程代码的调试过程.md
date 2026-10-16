---
title: '记一道java多线程代码的调试过程'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
ppt上有一份java多线程代码， 功能： 实现两个线程交替做加法

最后debug成功的代码如下：
```
package MultiThread;

public class AddOnehundred implements Runnable{

	public static void main(String[] args) {
		AddOnehundred A1 = new AddOnehundred();
		//AddOnehundred A2 = new AddOnehundred();
		Thread t1 = new Thread(A1, "线程1");
		Thread t2 = new Thread(A1, "线程2");
		t1.start();
		t2.start();
	}
	private int i = 1;
	@Override
	public void run(){
		while(true) {
			synchronized(this){
				notify();//唤醒正在等待中的进程
				if(i <= 100){
					System.out.println(Thread.currentThread().getName() + ":"+i++);
				}
				else
					break;
				try{
					wait();
				}catch(InterruptedException e){
					e.printStackTrace();
				}
			}	
		}
	}
}
```

在debug这段代码的过程中， 我遇到了如下问题：

# 线程死锁

```
                AddOnehundred A1 = new AddOnehundred();
		//AddOnehundred A2 = new AddOnehundred();
		Thread t1 = new Thread(A1, "线程1");
		Thread t2 = new Thread(A1, "线程2");
		t1.start();
		t2.start();
```
注意到我注释了一行语句

这里涉及到 synchronized关键字的用法

synchronized 对应的锁是对象锁
如果我实例化了两个对象， 并且分别创建了线程， 那么就有两把锁

这也就是导致死锁原因， 因为线程A的锁是无法由线程B来释放的

所以将代码修改成实例化一个对象， 并且在这个对象的基础上创建两个线程， 这样就只有一把锁， 线程之间就可以互相通信

# run方法

```
while(true) {
			synchronized(this){
				notify();//唤醒正在等待中的进程
				if(i <= 100){
					System.out.println(Thread.currentThread().getName() + ":"+i++);
				}
				else
					break;
				
				try{
					wait();
				}catch(InterruptedException e){
					e.printStackTrace();
				}
			}
```
假设一个线程A进入了， A持有锁， 并且A去唤醒其他的线程(就算其他的线程被唤醒了也没事，它们还是处于阻塞状态)

之后A执行一次操作， 并且尝试调用wait方法， 释放自己持有的锁， 让其他的线程进来(这就很像管程了)

线程B已经在管程外面等待很久了， 进来之后先唤醒A， A出去了， 但是A进不来的

ok这样就能实现了

# 变量的问题
注意到`int i = 1`声明的位置

不同的位置会有不同的效果

尝试之后只有将`i`放在方法的外面才能达到效果

如果放在方法里面， while循环的外面， 会导致两个线程打印的值是一样的

放在while循环里面或者synchronized里面是不太可能的， 不然就无法实现加法了

最后的效果如下：
![](https://upload-images.jianshu.io/upload_images/10651191-8c64b58987772a1e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 参考
[https://www.cnblogs.com/wl0000-03/p/5973039.html](https://www.cnblogs.com/wl0000-03/p/5973039.html)
