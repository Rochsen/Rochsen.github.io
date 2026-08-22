---
title: 链表
icon: link
date: 2026-08-22
category: [数据结构]
tag: [链表]
---

<!-- more -->

```python
class Node:
    """
    链表节点
    """

    def __init__(self, val=None):
        # 节点值
        self.val = val
        # 指向下一个节点
        self.next = None


class MyLinkedList:
    """
    链表
    """

    def __init__(self, value=None):
        # 头节点
        self.head = Node(value)

    def get(self, index: int) -> int:
        """
        获取链表中第 index 个节点的值。如果索引无效，则返回-1。
        """
        head_node = self.head
        for i in range(index):
            curr_node = head_node.next
            if not curr_node:
                return -1

        return curr_node.val

    def addAtHead(self, val: int) -> None:
        """
        在链表的第一个元素之前添加一个值为 val 的节点。插入后，新节点将成为链表的第一个节点。
        """
        # 链表为空
        if self.head is None:
            self.head = Node(val)
            return

        # 新节点
        new_node = Node(val)
        # 新节点指向头节点, 实现 新节点 -> 头节点
        head_node = self.head
        new_node.next = head_node
        # 定义 头节点 为 新节点，确保 新节点为头节点
        self.head = new_node

    def addAtTail(self, val: int) -> None:
        """
        将值为 val 的节点追加到链表的最后一个元素。
        """
        # 链表为空
        if self.head is None:
            self.head = Node(val)
            return

        # 获取头节点
        curr_node = self.head

        # 找到链表末尾
        while curr_node.next:
            curr_node = curr_node.next

        # 末尾节点指向 原本的末尾节点，实现 原链表末尾 -> 新节点
        curr_node.next = Node(val)

    def addAtIndex(self, index: int, val: int) -> None:
        """
        目标：将一个值为 val 的节点插入到链表中下标为 index 的节点之前。
        如果 index 等于链表的长度，那么该节点会被追加到链表的末尾。
        如果 index 比长度更大，该节点将 不会插入 到链表中。
        """
        # 链表为空，头节点就是新节点
        if index == 0:
            self.addAtHead(val)
            return

        # 链表长度 == index
        if index == self.size:
            self.addAtTail(val)
            return
        
        # 链表长度小于 index
        if index > self.size or index < 0:
            return -1

        # 新节点
        new_node = Node(val)
        # 头节点
        prev_node = None
        curr_node = self.head

        # 找到 index - 1 节点
        for i in range(index):
            prev_node = curr_node
            curr_node = curr_node.next

        # 新节点指向 index 节点, 实现 新节点 -> index 节点
        new_node.next = curr_node
        # index 节点指向 新节点, 实现 index 节点 -> 新节点
        prev_node.next = new_node
        
        return

    def deleteAtIndex(self, index: int) -> None:
        if index == 0:
            self.val = self.next.val
            self.next = self.next.next
        else:
            node = self
            for i in range(index - 1):
                node = node.next
            node.next = node.next.next

    @property
    def size(self):
        """
        获取链表的长度
        """
        if self.head is None:
            return 0
        
        node = self.head
        length = 1

        while node.next:
            length += 1
            node = node.next
        
        return length


if __name__ == "__main__":
    # Your MyLinkedList object will be instantiated and called as such:
    obj = MyLinkedList()
    obj.addAtHead(1)
    obj.addAtTail(3)
    obj.addAtIndex(1, 2)
    param_1 = obj.get(1)
    print(f"param_1 = {param_1}")
    obj.deleteAtIndex(1)
    print(f"obj.get(1) = {obj.get(1)}")

```