---
title: 'leetcode-22GenerateParentheses'
date: 2019-01-01
category: 'Openjudge'
tags: []
lang: 'zh'
draft: true
---
![](https://upload-images.jianshu.io/upload_images/10651191-9e97fbec45babc32.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意题目的要求是一定要well-formed的

借着这个题目好好地捋了一下回溯法的巧妙

画了一副很潦草的图

![](https://upload-images.jianshu.io/upload_images/10651191-7c8ce5db2b3ea1ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

当然自己没做出来，好好地研究了一下答案，之后自己用JavaScript写了一下

```java
public class GenerateParentheses {
    static public List<String> generateParenthesis(int n) {
        List<String> ans = new ArrayList();
        backtrack(ans, "", 0, 0, n);
        return ans;
    }

    static public void backtrack(List<String> ans, String cur, int open, int close, int max){
        if (cur.length() == max * 2) {
            ans.add(cur);
            return;
        }

        if (open < max)
            backtrack(ans, cur+"(", open+1, close, max);
        if (close < open)
            backtrack(ans, cur+")", open, close+1, max);
    }

    public static void main(String[] args) {
        System.out.println(generateParenthesis(3));
    }
}
```
大致说一下，第一个只选左括号，然后不断地选下去，直到左括号选完，有一个open变量记录左括号的已经使用的个数，达到上限之后开始加右括号，这样代码中close<open时连续三次调用的函数在退栈的时候就一次性解决了，然后这时候回退到只选了两个左括号的情况，就这样。

但是用JavaScript实现的时候，出问题了

```javascript

function solution(n, left, right, ans, ansArray) {

    //n组括号，n个左括号，n个右括号
    //最左边肯定是左括号
    // let max = n; //

    // let ans = null;

    // let cur = null; //记录当前的位置
    if (ans.length == n * 2) {
        ansArray.push(ans);
        return;
    }
    // let left = null;
    // let right = null;
    if (left < n) {
        // ans += '(';
        // left+=1;
        // cur+=1;
        //继续调用函数，改变当前指针的位置
        solution(n, left + 1, right, ans + '(', ansArray);

    }
    //如果left>=n
    if (right < n) {
        // ans += ')';
        // right+=1;
        // cur+=1;

        //这里之前一直遇到了一个问题，就是输出的答案有重复，但是后来发现，其实如果将其写入函数的参数中就不会出现这个问题
        //TODO 这里的代码输出还是有问题，为什么模仿java写的代码结果相差这么多？
        solution(n, left, right + 1, ans + ')', ansArray);
    }

}

//soluion(n, int cur, int left, int right)
ansArray = new Array();
ans = "";
solution(3, 0, 0, ans, ansArray);
console.log(ansArray);
```
初次接触JavaScript，还不是很熟悉
可以看到代码中注释的地方

这里面调试的艰辛就不说了，
不过最后的代码还是有问题
输出的结果：
```javascript
[ '((()))',
  '(()())',
  '(())()',
  '(()))(',
  '()(())',
  '()()()',
  '()())(',
  '())(()',
  '())()(',
  '()))((',
  ')((())',
  ')(()()',
  ')(())(',
  ')()(()',
  ')()()(',
  ')())((',
  '))((()',
  '))(()(',
  '))()((',
  ')))(((' ]
```

暂时记录一下
