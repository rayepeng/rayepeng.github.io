---
title: 'leetcode周末题目'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
只做了第一到题
![](https://upload-images.jianshu.io/upload_images/10651191-ec3f286577cfe492.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

写了一点垃圾的代码，测试了半天过了
```java
class Solution {
    public String gcdOfStrings(String str1, String str2) {
         String ans = null;

        //先确保str1的长度大于str2
        int lengthOfStr1 = str1.length();
        int lengthOfStr2 = str2.length();
        if (lengthOfStr1 < lengthOfStr2) {
            String temp;
            temp = str1;
            str1 = str2;
            str2 = temp;
        }
        lengthOfStr1 = str1.length();
        lengthOfStr2 = str2.length();
        StringBuilder s1 = new StringBuilder();
        int maxLength = 0;
        for(int i = 0; i < lengthOfStr2; i++){
            s1.append(str2.charAt(i));
            if(isDivided(str1, s1.toString()) && isDivided(str2, s1.toString())){
                maxLength = i;
            }
        }
        if (maxLength == 0) {
            return "";
        }
        return str2.substring(0, maxLength+1);

    }
    
    static public boolean isDivided(String str1, String str2) {
        int len1 = str1.length();
        int len2 = str2.length();

        if (len1 % len2 == 0 || len2 % len1 == 0) {
            if (len1 <= len2) {
                String temp;
                temp = str1;
                str1 = str2;
                str2 = temp;
            }
            int times = len1 / len2;
            String s = String.join("", Collections.nCopies(times, str2));
            if (s.equals(str1)) {
                return true;
            }else{
                return false;
            }

        }
        return false;
    }

}
```
`String s = String.join("", Collections.nCopies(times, str2));`是将一个字符串乘以对应的次数的

## 看下大牛的答案
递归太难了
简要的意思就是每次截取字符串，用str1-str2，得到剩下的长度，然后再去和str2去求公因子
这个算法不是秦九韶算法？
不明觉厉觉得很有道理
```java
    static public String gcdOfStringsBy1(String str1, String str2) {
        if (str1.length() < str2.length()) {
            return gcdOfStringsBy1(str2, str1);
        } else if (!str1.startsWith(str2)) {
            return "";
        } else if (str2.isEmpty()) {
            return str1;
        } else {
            return gcdOfStringsBy1(str1.substring(str2.length()), str2);
        }
    }
```
开始还被subString()这个函数给绕进去了，只有一个参数的时候是截取从当前位置开始往后的字符串的
tql继续学习
