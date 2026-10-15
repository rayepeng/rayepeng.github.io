---
title: '每天一道leetcode-560和为k的子数组'
date: 2020-04-21
category: '编程'
tags:
  - 'leetcode'
lang: 'zh'
draft: false
---
给定一个整数数组和一个整数 k，你需要找到该数组中和为 k 的连续的子数组的个数。

示例 1 :

```
输入:nums = [1,1,1], k = 2
输出: 2 , [1,1] 与 [1,1] 为两种不同的情况。
```

## 法一——暴力

两重循环，对每一个数字，从它开始往后，不断地累加，然后和k进行对比，这应该是最简单的想法了，但是我做这种题还是有点晕

```python
def subarraySum(nums, k):
    length = len(nums)
    count = 0
    for i in range(length):
        sum = 0
        for j in range(i, length):
            sum += nums[j]
            if sum == k:
                count += 1
            
    return count
```

## 法二——hashtables

思路就是不断地求和，然后判断 `cur_sum - k` 是否已经计算过了

> 将前缀和放入哈希表，哈希表的设计为：key是前缀和，value是前缀和出现的次数。  
> 如果当前要存入的前缀和sum，使得(sum - k)也在哈希表中时，则使用count累加哈希表中(sum - k)出现的次数，然后再将该sum放入哈希表中。这里的count与sum的添加次序不能调换，主要是为了处理k为0的情况。

```python
def subarraySum(self, nums, k):
    result, cur_sum = 0, 0
    sum_dict = {0:1}
    for num in nums:
        cur_sum += num
        if cur_sum - k in sum_dict:
            result += sum_dict[cur_sum - k]
        sum_dict[cur_sum] = sum_dict.get(cur_sum, 0) + 1
    return result
```

go实现的代码

```go
func subarraySum(nums []int, k int) int {
    count := 0
    sumMap := map[int]int{0:1,}
    sum := 0
    for _, num := range nums {
        sum += num
        if sumMap[sum - k] > 0 {
            count += sumMap[sum - k]
        }
        sumMap[sum]++
    }

    return count
}
```
