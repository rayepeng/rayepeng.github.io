---
title: 'ZigZag-Conversion'
date: 2019-01-01
category: 'Openjudge'
tags: []
lang: 'zh'
draft: true
---
看到这个题目的第一眼是很懵的

```
Input: s = "PAYPALISHIRING", numRows = 4
Output: "PINALSIGYAHRPI"
Explanation:

P     I    N
A   L S  I G
Y A   H R
P     I
```
这是什么例子
我感觉自己都不是很理解是怎么做到的

```java
    public static String convert(String s, int numRows){
        if(numRows == 1) return s;
        List<StringBuilder> rows = new ArrayList<>();
        for(int i = 0; i < Math.min(numRows, s.length()); i++){
            rows.add(new StringBuilder());
        }
        int curRow = 0;
        boolean goingDown = false;
        for(char c:s.toCharArray()){
            rows.get(curRow).append(c);
            if(curRow == 0 || curRow == numRows - 1){
                goingDown = !goingDown;
            }
            curRow += goingDown ? 1:-1;
        }

        StringBuilder ret = new StringBuilder();
        for(StringBuilder row:rows) {
            ret.append(row);
        }
        return ret.toString();
    }
```
最后的算法
其实可以这样理解：
P I N
A L S I G
Y A H R
P I

也就是说先往下走，走到4个，再往回走，这样来回就行了
