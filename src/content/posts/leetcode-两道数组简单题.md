---
title: 'leetcode-两道数组简单题'
date: 2019-01-01
category: 'leetcode'
tags: []
lang: 'zh'
draft: true
---
## moveZeroes

将一个数组中的所有零元素都移动到数组的最后，并且保持其他元素的相对顺序

这题一开始想偏了，也没有想出很好的算法，其实还是双指针不熟练

我们可以用两个指针，i和j
j做一次遍历，然后将不为零的元素全部移动到数组的首部，每移动一次i++

最后在数组的尾部添加0

一开始确实没这么想，思路就卡住了，代码写了半天还在报错，最后看了解答忍不住一句woc原来这么简单的思路

用go写的代码

```go
package main

func moveZeroes(nums []int)  {
	length := len(nums)
	j := 0
	for i:=0;i<length;i++{
		if nums[i] != 0 {
			nums[j] = nums[i]
			j++
		}
	}
	for i:=j;i<length;i++{
		nums[i] = 0
	}
}
```

类似这种双指针的用法其实很多，不得不说双指针是一种很巧妙的方法

## 判断是否为 moutain 数组

所谓的 moutain 数组就是中间有一个元素满足在它之前的递增，在它之后的递减这种要求

那么思路也就很简单了，就是首先找到这个moutain值，然后判断一下之后的元素是不是递减(因为之前如果一直递增的话就直接返回true)

但是还有一些特殊情况要考虑的呀，其中如果前两个数不递增，或者后两个数不递减的情况都是要排除的

```go
package main
func validMountainArray(A []int) bool {
	length := len(A)
	if length < 3{
		return false
	}
	if A[0] >= A[1] || A[length - 1] >= A[length-2]{
		return false
	}
	i := 1
	for ;i<length;i++{
		if A[i-1] >= A[i]{
			break
		}
	}

	// //A[i-1] 就是山峰
	// if i == length{
	// 	return false
	// }
	for j:=i;j<length;j++{
		if A[j] >= A[j-1]{
			return false
		}
	}
	return true
}
```

总结： 虽然是两道简单题，但是也花了我不少时间，对于这些基本的思路还是要不断地总结为好
