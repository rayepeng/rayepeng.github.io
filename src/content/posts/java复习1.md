---
title: 'java复习1'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
## 与C语言不同的关键字

### interface

以下内容摘自java 编程思想

例子： 要拍照的时候， 我们只关心要拍照的这个能力，并不关心是用什么去拍照。 同样， 要计算一组数字， 只需要有计算这种能力， 而不去关心到底是用什么计算的。

```

public interface MyComparable{
	int compareTo(Object other);
}

```
 如上代码， 我们只需要一个比较的能力， 而不去关心这种能力是由什么来实现的。

** 所以 **
1.  接口是不能实例化的， 就如同你无法实例化计算这种能力， 而只能是去实现这种能力， 至于你如何实现这种能力， 我才懒得管呢。
2. 接口中的方法是没有方法体的， 如果有了方法体，也就有了实现， 这在现实中显然是不可能的， 计算这种能力是肯定不能脱离一个物体而单独存在的。 所以接口的实现比如固定到某个类上面。
3. 接口中的变量不管你怎么说， 都是 public static final
4. 一个类只能继承一个抽象类， 但是一个类却可以实现多个接口。 这是显然的了， 计算机本
就是实现了多种功能的集合体。

#### 实现interface

```
public class Point implements MyComparable{
	private int x;
	private int y;
	public Point(int x, int y){
		this.x = x;
		this.y = y;
	}
	/*计算到原点的距离*/
	public double distance(){
		return Math.sqrt(x*x + y*y);
	}

	@Override
	/*重写接口中的函数*/
	public int compareTo(Object other){
		if(! (other instanceof Point)){
			throw new IllegalArgumentException;
		}
		//强制类型转换
		Point otherPoint = (Point)other;
		double delta = distance() - otherPoint.distance();
		if(delta < 0){
			return -1;
		}
		else if(delta > 0){
			return 1;
		}
		else{
			return 0;
		}
	}

	@Override
	public String toString(){
		return "("+x+", "+y+")";
	}
}
```
