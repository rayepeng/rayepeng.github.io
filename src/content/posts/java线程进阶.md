---
title: 'java线程进阶'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
```
package process;

import java.util.Scanner;

public class Process1{
	public Process1(){

		
	}

	static private String exit;
	static private String zan_ting;
	

	static class A implements Runnable{
		private int x;
		//创建一个线程实现加法
		public A(int x){
			//构造方法， 实例化A的对象的时候必须传入一个参数
			this.x = x;
		}
		public void lei_jia_qiu_he(int x){
			int sum = 0;
			for(int i = 1; i < x; i++){
				sum += i;
			}
			System.out.println("线程A计算出类累加求和的值:"+sum);
		}
		
		@Override
		public void run(){
				try {
					Thread.sleep(400);
					lei_jia_qiu_he(x);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}

			}
		
	}
	static class B implements Runnable{
		private String next;
		public B(String next) {
			
			this.next = next;
		}
		public  void monitor(String next) {
			/*
			monitor函数的功能: 如果用户输入的是字母p， 则暂停线程A的执行， 如果用户输入的是字母e， 则退出
			 */
			if(next.equals("e")){
				//退出
				exit = "e";
			}
			else if(next.equals("p")){
				//暂停线程A的执行
				zan_ting = "p";
			}
			
		}
		@Override
		public void run() {
			monitor(next);
		}
	}
	
	

	public static void main(String[] args) {
		Scanner sc = new Scanner(System.in);
		String next = sc.next();
		if(exit.equals("e")) {
			System.out.println("检测到用户输入e， 退出！");
		}
		else if(zan_ting.equals("p")) {
			System.out.println("检测到用户输入了p， 暂停！");
			
		}
		A a1 = new A(Integer.valueOf(next));
		B b1 = new B(next);
		Thread threa2 = new Thread(b1);
		Thread threa1 = new Thread(a1);
		threa1.start();
		threa2.start();
	}
}
```
明明是一个线程就能解决问题的， 但是非要拆开来做。

这个就很神奇了
