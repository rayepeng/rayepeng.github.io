---
title: 'python数据结构'
date: 2020-03-17
category: '编程'
tags:
  - 'python'
lang: 'zh'
draft: false
---
补充一个小知识

python 输入重定向为文件

```
import sys

sys.stdin = open("test.txt")
```

之后就可以直接从文件读入，不需要手动输入了

## 链表

```
实现链表
输入
1 3 5 4 1 9 4 
将其存储为链表格式
```

链表数据结构：

```python
class ListNode:
    def __init__(self, x=-1):
        self.val = x
        self.next = None
```

### 创建链表，返回头节点 (尾插法)

```python
def creat_list(line:list) -> ListNode:
    root = ListNode()
    tail = root
    for i in line:
        temp = ListNode(i)
        tail.next = temp
        tail = tail.next  
    return root.next
```

### 遍历链表

```python
def traverse_list(root:ListNode):
    '''
    遍历链表，没有头节点
    '''
    temp = root
    while temp:
        print(temp.val+" ",end="")
        temp = temp.next
    print()
```

### 删除倒数第n个节点，一次遍历

用两个指针指向，第一个指针先走 `n+1` 步，中间空出n个节点，然后删除即可

```python
def removeNthFromEnd(head:ListNode, n:int)->ListNode:
    '''
    一次遍历算法
    '''
    new_head = ListNode(-1)
    new_head.next = head
    first = new_head
    second = new_head
    for i in range(n+1):
        first = first.next    
    while first != None:
        first = first.next
        second = second.next
    second.next = second.next.next
    return new_head.next
```

### 向右旋转链表

就是把单链表组成一个循环链表

```python
def rotateRight(head:ListNode, k:int)->ListNode:
    '''
    针对链表进行旋转
    '''
    if k == 0:
        return head
    if head == None:
        return head
    temp = head
    length = 0
    while temp.next != None:
        length += 1
        temp = temp.next
    length += 1
    temp.next = head
    temp = head
    for i in range((length - k%length -1)):
        temp = temp.next
    new_head = temp.next
    temp.next = None
    return new_head
```

## 图

### 创建图

采用邻接表进行存储， `ArcNode` 代表邻接点， `VNode` 代表边节点

```python
class ArcNode:
    def __init__(self,adjvex, weight):
        self.adjvex = adjvex
        self.weight = weight
        self.next = None
class VNode:
    def __init__(self):
        self.next = None
```

输入数据

```
输入格式：
4 4
0 1 1 0
1 0 1 0
1 1 0 1
1 1 1 1
```

读入数据，创建邻接矩阵

```python
def create_table()->list:
    m,n = [int(i) for i in input().split()] # 自动解包
    A = [0 for i in range(m)]
    for i in range(m):
        A[i] = [int(j) for j in input().split()]
    return A
```

邻接矩阵转换为邻接表

```python
def create_Adj(A)->list:
    '''
    邻接矩阵转换为邻接表
    '''
    G = [VNode() for i in range(len(A))]
    for i,vex in enumerate(A):
        # 第i个节点，及其所有的边
        for node,j in enumerate(vex):
            if j != 0:
                p = ArcNode(node, j)
                p.next = G[i].next
                G[i].next = p
    return G
```

打印邻接表

```python
def disp_adj(G):
    for index,i in enumerate(G):
        p = i.next
        print(index, end="")
        while p != None:
            print(" {}->".format(p.adjvex), end="")
            p = p.next
        print()
```

### 深度优先搜索

```python
visited = [0 for i in range(4)]
def DFS(G, v):
    '''
    深度优先搜索
    '''
    visited[v] = 1
    print(v, end="")
    p = G[v].next
    while p != None:
        w = p.adjvex
        if visited[w] == 0:
            DFS(G,w)
        p = p.next
    print()
```

### 广度优先搜索

```python
def BFS(G, v):
    '''
    广度优先搜索
    '''
    q = Queue()
    visited = [0 for i in range(len(G))]
    print(v,end="")
    visited[v] = 1
    q.put(v)
    while not q.empty():
        w = q.get()
        p = G[w].next
        while p!=None:
            if visited[p.adjvex] == 0:
                print(p.adjvex, end="")
                visited[p.adjvex] = 1
                q.put(p.adjvex)
            p = p.next
    print()
```

### Dijkstar 算法

```python
def Dijkstra(A, v):
    '''
    Dijkstar 算法
    '''
    for i in A:
        for index,value in enumerate(i):
            if value == -1:
                i[index] = sys.maxsize
    
    dist = A[v] # 原始v到各个顶点的距离

    path = [0 for i in range(len(A))] 
    for i in range(len(A)):
        if A[v][i] != -1:
            path[i] = v
        else:
            path[i] = -1

    s = [0 for i in range(len(A))]
    s[v] = 1

    for i in range(len(A)):
        mindis = sys.maxsize
        # 寻找最小路径长度顶点u
        for j in range(len(A)):
            if s[j] == 0  and dist[j] < mindis:
                u = j
                mindis = dist[j]
        
        s[u] = 1
        for j in range(len(A)):
            if s[j] == 0:
                if A[u][j] < sys.maxsize and dist[j] > 0 and dist[u]+A[u][j] < dist[j]:
                    dist[j] = dist[u] + A[u][j]
                    path[j] = u
    return path, dist
```
