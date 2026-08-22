---
title: 单向链表
icon: link
date: 2026-08-22
category: [数据结构]
tag: [链表]
---

<!-- more -->


## 术语（Glossary）

| 术语 | 含义 |
| --- | --- |
| **节点 Node** | 链表里的一节「车厢」，装着 `value`（数据）和 `next`（指向下一节的钩子）。 |
| **头指针 head** | 指向链表中第一个节点。链表只认识头，找谁都从头开始走。 |
| **next** | 节点里的指针，指向下一节车厢；最后一个节点的 `next = None`。 |
| **哨兵节点 dummy** | 不存真实数据、永远在最前面的假节点。让「空链表 / 头节点操作」不再需要特判，代码统一简单。 |
| **遍历** | 从 head 出发，顺着 next 一步一步走到尾。 |
| **插入 insert** | 在某个节点后面挂一节新车厢。口诀：**先接后断**。 |
| **删除 delete** | 让前一节的钩子跳过被删节点，直接指向后一节。口诀：**跳过**。 |

## 节点模板

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None      # 钩子默认空着
```

## 三个核心动作

### ① 遍历：从头走到尾

```python
cur = head
while cur:            # 只要还有车厢
    print(cur.value)
    cur = cur.next    # 走到下一节
```

### ② 插入：在 prev 后面挂 new —— 先接后断，顺序不能反！

```python
new.next = prev.next   # ① 先接：新钩子先挂住后面的车厢
prev.next = new        # ② 再断：再把 prev 的钩子指向 new
```

> **为什么顺序不能反**
> 如果先写 `prev.next = new`，prev 后面整列火车就丢了——没人再指向它们，再也找不回来。

### ③ 删除：跳过被删节点

```python
prev.next = prev.next.next   # prev 直接指向「下一个的下一个」
```

> **被删的节点呢？**
> 没有变量再引用它，Python 的垃圾回收会自动把它清理掉。不需要手动 free。

## 教科书完整版（哨兵节点）

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class MyLinkedList:
    def __init__(self):
        self.dummy = Node(0)   # 哨兵节点，不存真实数据
        self.size = 0

    def get(self, index: int) -> int:
        if index < 0 or index >= self.size:
            return -1
        cur = self.dummy.next
        for _ in range(index):
            cur = cur.next
        return cur.value

    def addAtHead(self, val: int) -> None:
        self.addAtIndex(0, val)

    def addAtTail(self, val: int) -> None:
        self.addAtIndex(self.size, val)

    def addAtIndex(self, index: int, val: int) -> None:
        if index < 0 or index > self.size:
            return
        prev = self.dummy           # 从哨兵出发，走 index 步
        for _ in range(index):
            prev = prev.next
        new = Node(val)
        new.next = prev.next        # 先接
        prev.next = new             # 再断
        self.size += 1

    def deleteAtIndex(self, index: int) -> None:
        if index < 0 or index >= self.size:
            return
        prev = self.dummy
        for _ in range(index):
            prev = prev.next
        prev.next = prev.next.next  # 跳过
        self.size -= 1
```

## 复杂度速记

| 操作 | 单向链表 | 数组 | 原因 |
| --- | --- | --- | --- |
| 按下标取值 | **O(n)** | O(1) | 链表只能从头一步一步走；数组能直接跳 |
| 头部插入 / 删除 | **O(1)** | O(n) | 链表改个头就行；数组要全员挪位置 |
| 尾部插入 | O(n) | O(1) | 链表没有尾指针时要走到尾；数组末尾直接放 |
| 任意位置插入 / 删除 | **O(1)*** | O(n) | *找到位置后只要改指针；数组要挪动元素 |

*一句话：**数组擅长安找（下标），链表擅长改（插入删除）**——但找位置本身都要 O(n)。*

## 易错点清单

- 插入时「先接后断」顺序写反 → 丢链。
- 删除时忘了让前一个节点接上「下一个的下一个」→ 链断了。
- 空链表 / 只有头节点时直接访问 `head.next` → 报错。
- 下标越界没检查 → 访问 None。
- 循环里让 `cur = cur.next` 在 `cur = None` 时还继续用 → 崩。
