---
title: 'Leetcode 2'
date: 2019-07-15
updated: 2019-08-20
category: 'leetcode'
tags:
  - 'leetcode'
  - 'java'
lang: 'zh'
draft: false
---
# 错解

怎么快速地将链表倒置

:confused:

![wrong](https://i.imgur.com/phNwhfi.png)

最后还是因为溢出的问题

思路：

```java

​        int k = 0;

        ListNode temp1 = l1;

        ListNode temp2 = l2;

        double resultl1 = 0;

        double resultl2 = 0;

        while (temp1 != null) {

            int tempvalue = temp1.val;

            resultl1 = resultl1 + tempvalue * Math.pow(10, k);

            k++;

            temp1 = temp1.next;

        }
```

就是将其转化为整数，因为链表的第一个元素是最低位，之后是十位，百位等

将得到的结果在转化为链表

```java

int result = (int) (resultl1 + resultl2);

ListNode ans = new ListNode(0); //先取一个头节点

ListNode head = ans;

int length = Integer.toString(result).length();

for (int i = 0; i < length; i++) {

    ListNode temp = new ListNode(result % 10);

    head.next = temp;

    head = head.next;

    result = result / 10;

}
```

记录一下将整数转为string的操作

> Integer.toString(result)

Math.pow函数的返回值必须是double类型的

但是这样会面临一个问题，也就是最开图片的那个，溢出！

# 正解

看了眼答案，才明白自己从开始就想错了

```

public ListNode addTwoNumbers(ListNode l1, ListNode l2) {

    ListNode dummyHead = new ListNode(0);

    ListNode p = l1, q = l2, curr = dummyHead;

    int carry = 0;

    while (p != null || q != null) {

        int x = (p != null) ? p.val : 0;

        int y = (q != null) ? q.val : 0;

        int sum = carry + x + y;

        carry = sum / 10;

        curr.next = new ListNode(sum % 10);

        curr = curr.next;

        if (p != null) p = p.next;

        if (q != null) q = q.next;

    }

    if (carry > 0) {

        curr.next = new ListNode(carry);

    }

    return dummyHead.next;

}
```

最关键的就是

\==int x = (p != null) ? p.val : 0;

int y = (q != null) ? q.val : 0;

int sum = carry + x + y;

carry = sum / 10;

curr.next = new ListNode(sum % 10);==

其实只需要从低位开始一位位的加上去就好了。

然后再把它们给链起来
