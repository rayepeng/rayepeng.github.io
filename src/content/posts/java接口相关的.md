---
title: 'java接口相关的'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
突然发现好久没有更新了

写一点关于java接口的东东吧

# 关于接口

java中是禁止多继承的

所以要想实现多继承就得用接口

# 作业

![](https://upload-images.jianshu.io/upload_images/10651191-e716f5453cd7535b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 我的解答(好丑)

```
package tttttt;

import javax.swing.text.html.HTMLDocument.HTMLReader.IsindexAction;

interface CompareObject{
	public int compareTo(Object o);  // 返回值是0代表相等， 为正数当前对象大， 为负数代表当前对象小
}

class Circle{
	protected int radius;
	
	public void setRadius(int radius) {
		this.radius = radius;
	}
	public int getRadius() {
		return this.radius;
	}

}

class ComparableCircle extends Circle implements CompareObject{
	
	
	public int compareTo(Object o){
		if(o instanceof ComparableCircle)
		{
			if(super.getRadius() == ((Circle) o).getRadius())
				return 0;
			else if(super.getRadius() > ((Circle) o).getRadius())
				return 1;
			else if(super.getRadius() < ((Circle) o).getRadius())
				return -1;
		}
		else
		{
			System.out.println("不是同一种对象无法比较");
			return 1;
		}
		return 1;
		
	}

}

public class TestInterface{
	public static void main(String[] args) {
		ComparableCircle c1 = new ComparableCircle();
		ComparableCircle c2 = new ComparableCircle();

		int comp = c1.compareTo(c2);

		System.out.println("比较的结果为：" + comp);
		
	}
}

```

写代码的时候遇到了以下问题

1. object 怎么向下转型

突然发现eclipse会在你写代码的时候就进行初步的编译
也就是说， 如果在if语句里面， o就是ComparableCircle类型的

2. 向上转型

既然o都是ComparableCircle类型的， 为啥还是用不了它的方法？？

编辑器提示我向上转型。。

好吧就向上。

3. java中的返回值规定很死。

必须确保每一条路径都有返回值。。

# java中向上转型与向下转型的好处？

```
package tttttt;

public class Human {
    public void sleep() {
        System.out.println("Human sleep..");
    }
       public static  void doSleep(Human h){
           h.sleep();
           
       }//此时传递的参数是父类对象，但是实际调用时传递子类对象，就是向上转型。
    public static void main(String[] args) {
        Human h = new Male();// 向上转型
//        doSleep(new Male());//此处匿名子类对象，当然实际应用时应该是用上面的向上转型公式，然后将子类对象传递进来，这样以后好在向下转型，此处没有向下转型，所以直接用了匿名类对象。
//        doSleep(new Female());
        doSleep(h);
    }
}

class Male extends Human {
    @Override
    public void sleep() {
        System.out.println("Male sleep..");
    }
}

class Female extends Human {
    @Override
    public void sleep() {
        System.out.println("Female sleep..");
    }

}

```

话不多说上代码

通过转型， 可以让我们少些很多代码(滑稽)
