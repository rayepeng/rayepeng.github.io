---
title: 'java并发编程——note1'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
这是举例的代码块
```java
package multiThread.javaBingfa;

public class notifyAllTest {

    private static volatile Object resourceA = new Object();
    private static volatile Object resourceB = new Object();
    public static void main(String[] args) throws InterruptedException {
        Thread threadA = new Thread(new Runnable() {
            @Override
            public void run() {
                synchronized (resourceA) {
                    System.out.println("threadA get resourceA lock");
                    try {
                        System.out.println("threadA begin wait");
                        resourceA.wait();
                        System.out.println("threadA end wait");

                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        });

        Thread threadB = new Thread(new Runnable() {
            @Override
            public void run() {
                synchronized (resourceA) {
                    System.out.println("threadB get resourceA lock");
                    try {
                        System.out.println("threadB begin wait");
                        resourceA.wait();
                        System.out.println("threadB end wait");
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                }
            }
        });

        Thread threadC = new Thread(new Runnable() {
            @Override
            public void run() {
                synchronized (resourceA) {
                    System.out.println("threadC begin notify");
                    resourceA.notify();
                }

            }
        });
        threadA.start();
        threadB.start();

        Thread.sleep(1000);
        threadC.start();

        threadA.join();
        threadB.join();
        threadC.join();
        System.out.println("main over");

    }
}
```

**notify()**方法
一个线程调用共享对象的notify方法后，会唤醒一个在该共享变量上调用wait系列方法后被挂起的线程，一个共享变量上可能会有多个线程在等待，具体唤醒哪个等待的线程是随机的。

此外，被唤醒的线程不能马上从wait方法返回并继续执行，它必须在获取了共享对象的监视器锁后才可以返回，也就是唤醒它的线程释放了共享变量上的监视器锁后，被唤醒的线程也不一定会获取到共享对象的监视器锁，这是因为该线程竞争到了共享变量的监视器锁后才可以继续执行。
