---
title: 'leetcode14——-Longest-Common-Prefix'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
题目难度简单？
就是找到最长的公共前缀

那就是任取一个单词，然后去找呗。。
![](https://upload-images.jianshu.io/upload_images/10651191-41821a630212b214.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
虽然很简单，但是我运行了两次都是报错。。
应该是超时了，要优化一下，然后发现我连简单的二分搜索都不是很会。

奉上我的垃圾代码仅供参考
```java
package Leetcode;

public class LongestCommonPrefix {
    static public String longestCommonPrefix(String[] strs) {
        if (strs == null) {
            return "";
        }
        String ans = strs[0];
        boolean isMatch = true;
//        int i = 0;
        //求出最小长度不就行了吗
        int minLength = Integer.MAX_VALUE;

        for (String strTemp : strs) {
            if (strTemp.length() < minLength) {
                minLength = strTemp.length();
            }
        }
        int ansOfLength = 0;
        for (int i = 0; i < minLength; i++) {
            char charTemp = ans.charAt(i);
            ansOfLength = i;
            if (isMatch) {
                for (String strTemp : strs) {
                    if (strTemp.charAt(i) == charTemp) {
                        continue;
                    } else {
                        isMatch = false;
                        break;
                    }
                }
            } else {
                break;
            }
        }
        if (ansOfLength - 1 > 0) {
            return ans.substring(0, ansOfLength-1);
        }else {
            return "";
        }

    }

    public static void main(String[] args) {
        String[] input = {"dog","racecar","car"};
        System.out.println(longestCommonPrefix(input));

    }
}
```

这题目还有其他的思路吗?
于是翻开了解答

其实，我们可以两个两个去比较，每次找出公共的就行了

于是修改了一下代码：
```java
    static public String longestCommonPrefixBy1(String[] strs) {
        if (strs == null) {
            return "";
        }
        String ans = strs[0];
        for (int i = 1; i < strs.length; i++) {
            ans = longestCommonPrefixOfTwoString(ans, strs[i]);
        }
        return ans;

    }

    static public String longestCommonPrefixOfTwoString(String str1, String str2) {
        String ans = str1;

        int maxLength = 0;
        while (str1.substring(0, ++maxLength).equals(str2.substring(0, ++maxLength))) ;

        return ans.substring(0, maxLength);
    }
```
测试了一下之后觉得很完美，奈何leetcode就是不让我过啊。。

来看看这种思路的标答
```java
 public String longestCommonPrefix(String[] strs) {
    if (strs.length == 0) return "";
    String prefix = strs[0];
    for (int i = 1; i < strs.length; i++)
        while (strs[i].indexOf(prefix) != 0) {
            prefix = prefix.substring(0, prefix.length() - 1);
            if (prefix.isEmpty()) return "";
        }        
    return prefix;
}
```
这段代码中使用了`indexOf`这样一个方法
![](https://upload-images.jianshu.io/upload_images/10651191-a0a058695b7f08a2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看不很懂这里的解释，直接查看java源码

```java
    public int indexOf(String str) {
        return indexOf(str, 0);
    }
```
实际上是调用了另一个`indexOf`方法
```java
    /**
     * Code shared by String and StringBuffer to do searches. The
     * source is the character array being searched, and the target
     * is the string being searched for.
     *
     * @param   source       the characters being searched.
     * @param   sourceOffset offset of the source string.
     * @param   sourceCount  count of the source string.
     * @param   target       the characters being searched for.
     * @param   targetOffset offset of the target string.
     * @param   targetCount  count of the target string.
     * @param   fromIndex    the index to begin searching from.
     */
    static int indexOf(char[] source, int sourceOffset, int sourceCount,
            char[] target, int targetOffset, int targetCount,
            int fromIndex) {
        if (fromIndex >= sourceCount) {
            return (targetCount == 0 ? sourceCount : -1);
        }
        if (fromIndex < 0) {
            fromIndex = 0;
        }
        if (targetCount == 0) {
            return fromIndex;
        }

        char first = target[targetOffset];
        int max = sourceOffset + (sourceCount - targetCount);

        for (int i = sourceOffset + fromIndex; i <= max; i++) {
            /* Look for first character. */
            if (source[i] != first) {
                while (++i <= max && source[i] != first);
            }

            /* Found first character, now look at the rest of v2 */
            if (i <= max) {
                int j = i + 1;
                int end = j + targetCount - 1;
                for (int k = targetOffset + 1; j < end && source[j]
                        == target[k]; j++, k++);

                if (j == end) {
                    /* Found whole string. */
                    return i - sourceOffset;
                }
            }
        }
        return -1;
    }
```

看到代码中用到了几个比较特殊的语句:
```java
 /* Look for first character. */
            if (source[i] != first) {
                while (++i <= max && source[i] != first);
            }

```

找第一个字符串，while中的条件是 `++i<=max`,并且还判断了 `source[i]!=firest`
在while中同时实现了判断和自增

接下来：
```java
            if (i <= max) {
                int j = i + 1;
                int end = j + targetCount - 1;
                for (int k = targetOffset + 1; j < end && source[j]
                        == target[k]; j++, k++);

                if (j == end) {
                    /* Found whole string. */
                    return i - sourceOffset;
                }
            }
```
也是用了一个类似的循环
故`indexOf`方法就是在字符串中搜寻字串

```java
        String s = "abcdefg";
        System.out.println(s.indexOf("bcd"));
//输出是1
```
