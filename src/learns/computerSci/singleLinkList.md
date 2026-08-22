---
title: 单向链表
icon: link
date: 2026-08-22
category: [数据结构]
tag: [链表]
---

<!-- more -->


## 基础：单向链表入门

*把链表想成一列火车 —— 看懂写法与逻辑，修好你自己的代码*

### 一、先建立画面：链表就是一列火车 🚂

你已经写过 `temp-shejilianbiao.py`，说明基础语法没问题。现在我们要把「链表」这个数据结构在脑子里画出来——**画对了，代码就顺了**。

想象一列火车：

- 每一节**车厢**装着一件货物（比如数字 5）；
- 每节车厢后面有一个**挂钩**，钩着下一节车厢；
- 列车长手里只拿着**车头**，想找第 3 节车厢，必须从车头一节一节往后走；
- 最后一节车厢的挂钩空着，什么也没钩——那就是 `None`。

```
车头      车厢1      车厢2      车厢3
 │         │         │         │
 ▼         ▼         ▼         ▼
[5|●] --> [9|●] --> [2|●] --> [7|∅]
 │         │         │         │
 value     value     value     value=None
 next      next      next      (没有下一节)
```

在代码里，「车厢」叫 **节点 Node**，两个属性：

```python
class Node:
    def __init__(self, value):
        self.value = value   # 货物：这个节点存的数据
        self.next = None     # 挂钩：指向下一节车厢（默认空着）
```

而 `head` 就是「车头」——链表本身不存任何数据，它只记住第一节课厢是谁：

```python
class MyLinkedList:
    def __init__(self):
        self.head = None     # 空链表：一辆车都没有
```

### 二、三个核心动作：所有链表操作都是它们的组合

链表的所有增删查，最后都归结为三件事：**走、接、跳**。

#### 动作 1：走（遍历）—— 从车头走到尾

```python
cur = head
while cur:            # 只要还有车厢
    print(cur.value)
    cur = cur.next    # 走到下一节
```

循环结束的条件是 `cur` 变成 `None`——也就是走过了最后一节车厢。这就是「遍历」。

#### 动作 2：接（插入）—— 口诀：先接后断！

想在节点 `prev` 后面挂一节新车厢 `new`，有两步：

```python
new.next = prev.next   # ① 先接：新钩子先钩住 prev 后面的车厢
prev.next = new        # ② 再断：把 prev 的钩子改挂到 new
```

> **顺序为什么不能反？**
> 如果先写 `prev.next = new`，prev 后面的整列火车就没人指向了——**丢了**。就像先解开挂钩再挂新的，后面的车厢全散架了。所以必须「新节点先接住后面，前面的钩子再断开来挂新节点」。

#### 动作 3：跳（删除）—— 让前一个直接跳过它

```python
prev.next = prev.next.next   # prev 的钩子直接指向「下一个的下一个」
```

```
删除前：  [..|●] --> [删|●] --> [..|●]
删除后：  [..|●] ------------> [..|●]
          （被删的车厢没人引用，Python 自动回收）
```

### 三、大招：哨兵节点（dummy head）

> 想想问题根源：所有特判都是因为「头节点是真实的第一个节点」。如果我们在最前面放一个**不存数据的假节点**，让它永远当车头：

```
哨兵      车厢1      车厢2
 │         │         │
 ▼         ▼         ▼
[0|●] --> [5|●] --> [9|∅]
 假节点     真数据     真数据
```

从此：

- 「在头部插入」= 在哨兵后面插入；
- 「删除头节点」= 删除哨兵后面的节点；
- 空链表 = 哨兵的 `next` 是 `None`，但哨兵本身永远存在。

所有操作统一成一个模式：**从哨兵出发走 index 步到 prev，然后在 prev 后面接 / 跳**：

```python
class Node:
    def __init__(self, value):
        self.value = value
        self.next = None

class MyLinkedList:
    def __init__(self):
        self.dummy = Node(0)   # 哨兵节点，不存真实数据
        self.size = 0          # O(1) 拿到长度

    def get(self, index: int) -> int:
        if index < 0 or index >= self.size:
            return -1
        cur = self.dummy.next
        for _ in range(index):     # 走 index 步
            cur = cur.next
        return cur.value

    def addAtHead(self, val: int) -> None:
        self.addAtIndex(0, val)    # 头 = 下标 0

    def addAtTail(self, val: int) -> None:
        self.addAtIndex(self.size, val)   # 尾 = 下标 size

    def addAtIndex(self, index: int, val: int) -> None:
        if index < 0 or index > self.size:
            return
        prev = self.dummy            # 从哨兵出发
        for _ in range(index):       # 走 index 步，到「目标位置的前一节」
            prev = prev.next
        new = Node(val)
        new.next = prev.next         # 先接
        prev.next = new              # 再断
        self.size += 1

    def deleteAtIndex(self, index: int) -> None:
        if index < 0 or index >= self.size:
            return
        prev = self.dummy
        for _ in range(index):
            prev = prev.next
        prev.next = prev.next.next   # 跳过
        self.size -= 1
```

> **对比一下**
> 你的版本：5 个方法，每个都有特判，共约 50 行，藏着一个潜伏 bug。
> 哨兵版：5 个方法，0 个特判，40 行，思路统一——「走 index 步 + 接/跳」。**更短、更不容易错、更好背。**

### 四、复杂度一句话

| 操作 | 链表 | 数组 |
| --- | --- | --- |
| 按下标取值 | O(n)（只能从头走） | O(1)（直接跳） |
| 头部插入/删除 | **O(1)**（改个头） | O(n)（全员挪位） |
| 任意位置插入/删除 | **O(1)***（改指针） | O(n)（挪元素） |

*找到位置本身要 O(n)，但「改」只要 O(1)。一句话：**数组擅长安找，链表擅长改。***


## 进阶：反转链表

*让整列火车掉头：用上一课的「火车比喻」彻底看懂三指针*


### 一、题目在说什么

给你一列火车，让它**掉头**：

```
反转前：  [1|●] --> [2|●] --> [3|●] --> [4|∅]
反转后：  [4|●] --> [3|●] --> [2|●] --> [1|∅]
```

也就是：每个节点的 `next` 都从「指向后面」变成「指向前面」，**一个节点都不新建**，只改钩子的方向。最后返回新链表的头（原来是 4，现在是 4）。

### 二、一个朴素想法，和它的致命问题

最直接的想法：遍历每一个节点，把它的 `next` 掰到前面去。

```python
cur.next = ???  # 指向前一个节点
```

> **致命问题：掰钩子 = 丢链**
> 当你把 `cur.next` 改成指向前面的那一刻，**原来 cur 后面整列火车就没人引用了**——你再也走不过去，链丢了。
> 这和第 1 课里「插入必须先接后断」是同一个道理：**改挂钩之前，必须先有人把后面的车厢抓住。**

### 三、三指针：一辆车怎么做到「不掉链地掉头」

我们准备三个变量，各司其职：

| 变量 | 它是什么 | 比喻 |
| --- | --- | --- |
| `prev` | 已经反转好的那一串的最前面 | 已经掉头完毕的「新车队」 |
| `curr` | 当前正在处理的车厢 | 正在掰挂钩的那节车厢 |
| `next_temp` | 暂存 curr 后面那一节 | 掰钩子之前先伸出去抓住的一只手 |

循环体固定四步，顺序不能变：

```python
while curr:                # 还有车厢要处理
    next_temp = curr.next  # ① 先伸手抓住后面（防止丢链）
    curr.next = prev       # ② 掰钩子：指向前面
    prev = curr            # ③ 新车队向前挪一节
    curr = next_temp       # ④ 走到刚才抓住的那一节
```

### 四、一步一步看：1 → 2 → 3

初始：`prev = None`，`curr = 1`

```
第 1 轮：
  prev=None   curr=1      2         3
              [1|●] --> [2|●] --> [3|∅]
  ① next_temp = 2（先抓住 2）
  ② 1.next = prev = None（1 变成新尾巴）
  ③ prev = 1
  ④ curr = 2

  现在：       [1|∅]    prev=1, curr=2
```

```
第 2 轮：
  prev=1      curr=2      3
  [1|∅]      [2|●] --> [3|∅]
  ① next_temp = 3
  ② 2.next = prev = 1
  ③ prev = 2
  ④ curr = 3

  现在：  [1|∅] <-- [2|●]    prev=2, curr=3
```

```
第 3 轮：
  prev=2      curr=3
  [1|∅] <-- [2|●]    [3|∅]
  ① next_temp = None
  ② 3.next = prev = 2
  ③ prev = 3
  ④ curr = None（循环结束）

  结果：  [1|∅] <-- [2|●] <-- [3|●]    prev=3 ← 新头！
```

> **为什么返回 prev？**
> 循环结束时 `curr = None`，而 `prev` 正好停在**最后一节（新链表的头）**上。返回它，就得到反转后的整条链表。

### 五、边界情况（一网打尽）

- **空链表**：`head = None` → 循环一次都不进 → 返回 `prev = None` ✅
- **只有一个节点**：循环走一轮 → `1.next = None` → 返回 1 ✅
- **再长的链表**：每轮只处理一个节点，永远不丢链 ✅

### 六、反转链表代码

```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next


class Solution:
    def reverseList(self, head: ListNode | None) -> ListNode | None:
        prev = None
        curr = head
        
        while curr:
            next_temp = curr.next  # 保存下一个节点
            curr.next = prev       # 反转指针
            prev = curr            # 移动 prev
            curr = next_temp       # 移动 curr
        
        return prev 
```
