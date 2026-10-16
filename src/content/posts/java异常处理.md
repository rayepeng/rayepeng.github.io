---
title: 'java异常处理'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
java异常的例子
```
import java.io.*;
public class ExcepTest{
 
   public static void main(String args[]){
      try{
         int a[] = new int[2];
         System.out.println("Access element three :" + a[3]);
      }catch(ArrayIndexOutOfBoundsException e){
         System.out.println("Exception thrown  :" + e);
      }
      System.out.println("Out of the block");
   }
}
```
基本的语句块就是 try catch
当然还有一个finally， 就是无论如何这个finally都会被执行

```
	public static void main(String[] args) {
		try {
			
		}catch (ArrayIndexOutOfBoundsException e) {
			// TODO: handle exception
		}
	}

```
这样写是没有问题的

但是这样写就有问题了

![](https://upload-images.jianshu.io/upload_images/10651191-b1d739f5c05788ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

需要修改成这种形式
如果一个方法没有捕获到一个检查性异常，那么该方法必须使用 throws 关键字来声明。throws 关键字放在方法签名的尾部。

也可以使用 throw 关键字抛出一个异常，无论它是新实例化的还是刚捕获到的。

```
	public static void main(String[] args) throws IOException {
		
	}

```

原来这才是原因

 [Java](http://lib.csdn.net/base/javaee "Java EE知识库")里面异常分为两大类:checkedexception(检查异常)和unchecked exception(未检查异常)，对于未检查异常也叫RuntimeException(运行时异常),对于运行时异常，java编译器不要求你一定要把它捕获或者一定要继续抛出，但是对checkedexception(检查异常)要求你必须要在方法里面或者捕获或者继续抛出。

> IOException extends Exception 是属于checked exception，必须进行处理，或者必须捕获或者必须抛出。

[Java检查异常和非检查异常区别](https://blog.csdn.net/tanga842428/article/details/52751303)

比如这个题目

![](https://upload-images.jianshu.io/upload_images/10651191-71f63a593b67a35b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

必须要修改成如下形式

```
	public static void method() throws IOException {
		
	}
	public static void main(String[] args) {
		try {
			method();
		} catch (IOException e) {
			// TODO: handle exception
		}
	}

```

来我们继续看这一份代码
```
public class ExceptionTest {
    public static void main(String args[]) {
        try {
            int a = args.length;
            System.out.println(a);
            int b = 10 / a;	//除零错
            int m[] = {1, 2, 3};
            m[3] = 12;	//越界错
        }catch (Exception e) {
            System.out.println("Exception");
        }catch (ArithmeticException e) {
            System.out.println(e.toString());
        }catch (ArrayIndexOutOfBoundException e) {
            System.out.println(e.toString());
        }
    }
}

```
需要我们理清楚一下异常类的继承关系

![](https://upload-images.jianshu.io/upload_images/10651191-567f90f4a7f01274.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们看到`Throwable`这个类被 `Error`和 `Exception`这两个类所继承
所以。。
其实 `ArithmeticException` 和 `ArrayIndexOutOfBoundsException` 这两个类已经是继承了`Exception`的

也就是说 `Exception`会捕获所有的异常， 其他的`catch`语句是捕获不到的

可以选择将 `Exception`放到最后来捕捉
也可以
```
public class ExceptionTest {
    public static void main(String args[]) throws ArithmeticException, ArrayIndexOutOfBoundsException {
        try {
            int a = args.length;
            System.out.println(a);
            int b = 10 / a;	//除零错
            int m[] = {1, 2, 3};
            m[3] = 12;	//越界错
        }catch (Exception e) {
            System.out.println("Exception");
        }
    }
}

```
