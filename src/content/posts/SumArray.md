---
title: 'SumArray'
date: 2019-01-01
category: 'Openjudge'
tags: []
lang: 'zh'
draft: true
---
第一次接触到的模板类
![](https://upload-images.jianshu.io/upload_images/10651191-0e1fa7861ad92f4d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

题目应该写错了，就是改写SumArray函数

# 新特性
C++中对string重载了+运算符

```
T SumArray(T* s, T*e){

	 //根据main函数中， 如果传入的是数组， 那么就会将其拼接起来。如果是数字就会求和
	int gap = e - s;
	T sum = *s;

	for (int i = 1; i < gap; i++)
	{
		sum += *(s + i);
	}
	return sum;
}

```
其实就是一个指针的传递过程
可以用引用吗？
然而我并没有写过引用做加减法的。。

```
#include <iostream>
#include <cstdio>

using namespace std;
template <class T>

T SumArray(T& s, T& e) {

	
	int gap = e - s;
	T sum = *s;

	for (int i = 1; i < gap; i++)
	{
		sum += *(s + i);
	}
	return sum;
}
//#ifndef debug
int main()
{
	/*string s[4] = { "1", "2" };

	string sum;
	for (int i = 0; i < 2; i++)
	{
		sum += s[i];
	}

	cout << sum << endl;*/
	int a[4] = { 1,2,3,4 };
	SumArray(*a, *(a + 4));
}

//#endif

```
测试代码出问题了， 溜了溜了

# 参考
[模板作业](http://www.cnblogs.com/yalphait/p/8681297.html)
