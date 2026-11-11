---
title: 特殊方法和特殊属性
date: 2026-11-11
order: 4
category: [教程]
tag: [python]
article: true
star: true
---

解释器按固定名字读写的属性和方法。`__name__`、`__all__` 标明模块是谁、星号导入带出什么。`__len__`、`__str__`、`__enter__` 让对象接上 `len()`、打印和 `with`。

<!-- more -->

本文按 Python 3.11.4 的数据模型和模块文档核对过。属性记在模块、类、函数身上。方法写在类上，解释器遇到对应语法时调用。

后文的商品都是 `("苹果", "梨")`。模块示例的工作目录如下，每个文件后面都会用到。每个代码块都在这个目录下单独运行。

```text
./
├── plain.py
├── listed.py
├── missing.py
└── shop/
    ├── __init__.py
    ├── bag.py
    └── cli.py
```

文件 `plain.py`：

```text
goods = ("苹果", "梨")


def _hidden():
    return "内部"
```

文件 `listed.py`：

```text
__all__ = ["goods", "_hidden"]

goods = ("苹果", "梨")


def _hidden():
    return "内部"
```

文件 `missing.py`：

```text
__all__ = ["goods", "Missing"]

goods = ("苹果", "梨")
```

文件 `shop/__init__.py`：

```text
"""商店。"""

__all__ = ["Bag"]

from .bag import Bag
```

文件 `shop/bag.py`：

```text
"""装商品的袋子。"""

__all__ = ["Bag"]

goods = ("苹果", "梨")
count: int = 2


def _hidden():
    return "内部"


class Bag:
    """一只袋子。"""

    def __init__(self, items):
        self.goods = tuple(items)


if __name__ == "__main__":
    print(__name__)
    print(repr(__package__))
    try:
        from . import __doc__
    except ImportError as exc:
        print(type(exc).__name__)
        print(exc)
```

文件 `shop/cli.py`：

```text
if __name__ == "__main__":
    print(__name__)
    print(repr(__package__))
    from .bag import Bag
    print(Bag.__name__)
```

## 1. 模块是谁

同一个文件会有两种跑法。被别的文件导入时，`__name__` 是模块全名，用来区分入口代码。用路径直接运行时，`__name__` 变成 `__main__`，文件末尾的入口才执行。

`__package__` 给相对导入用。包自己的值是包名，包里的模块是父包名，顶层模块是空字符串。用路径把文件当脚本跑时，它是 `None`。

`__file__` 是这次加载用的路径。从文件加载的模块才有它。`__path__` 只有包有，里面是查找子模块的目录。`__doc__` 是文件开头的文档字符串，没有就是 `None`。

```python
from pathlib import Path

import plain
import shop
import shop.bag as bag

plain.__name__
# 'plain'
plain.__package__
# ''
plain.__doc__
# None
Path(plain.__file__).name
# 'plain.py'
shop.__name__
# 'shop'
shop.__package__
# 'shop'
shop.__doc__
# '商店。'
shop.__all__
# ['Bag']
Path(shop.__file__).name
# '__init__.py'
Path(shop.__path__[0]).name
# 'shop'
bag.__name__
# 'shop.bag'
bag.__package__
# 'shop'
bag.__doc__
# '装商品的袋子。'
bag.__annotations__
# {'count': <class 'int'>}
bag.count
# 2
bag.Bag.__name__
# 'Bag'
bag.Bag.__module__
# 'shop.bag'
bag.Bag.__doc__
# '一只袋子。'
bag.Bag(("苹果", "梨")).goods
# ('苹果', '梨')
```

下面这段是当前脚本自己的名字。它没有被导入，所以是 `__main__`。

```python
__name__
# '__main__'
```

用路径运行 `shop/bag.py` 时，入口会执行，相对导入失败。

```python
import subprocess
import sys

done = subprocess.run(
    [sys.executable, "shop/bag.py"],
    capture_output=True,
    text=True,
    encoding="utf-8",
)
done.returncode
# 0
done.stderr
# ''
done.stdout.splitlines()
# ['__main__', 'None', 'ImportError', 'attempted relative import with no known parent package']
```

`python -m shop.cli` 也把 `__name__` 设成 `__main__`，同时把 `__package__` 设成 `shop`。相对导入因此找得到 `shop.bag`。

```python
import subprocess
import sys

done = subprocess.run(
    [sys.executable, "-m", "shop.cli"],
    capture_output=True,
    text=True,
    encoding="utf-8",
)
done.returncode
# 0
done.stderr
# ''
done.stdout.splitlines()
# ['__main__', "'shop'", 'Bag']
```

> [!tip]
>
> 要不要执行命令行入口，看 `__name__` 是不是 `__main__`。相对导入能不能用，看 `__package__`。用路径运行文件时，异常是 `ImportError: attempted relative import with no known parent package`。入口要做相对导入时，用 `python -m shop.cli` 这种模块方式运行。

## 2. 星号导入带出什么

`__all__` 只约束 `from 模块 import *`。它是一串字符串，字符串必须是模块里存在的名字。属性访问和 `dir()` 仍能看到列表外面的名字。

`shop/__init__.py` 的列表只有 `Bag`。调用方因此只得到类。包对象上仍有 `shop.bag`，那是 `__init__.py` 导入子模块时绑上的。

```python
import shop

shop.bag.__name__
# 'shop.bag'
```

```python
from shop import *

"Bag" in dir()
# True
"bag" in dir()
# False
```

`shop.bag` 的 `__all__` 也只有 `Bag`。`goods`、`count`、`_hidden` 都留在模块上，星号导入带不走。`_hidden()` 通过属性仍能调用。

```python
import shop.bag as bag

bag._hidden()
# '内部'
bag.goods
# ('苹果', '梨')
"_hidden" in dir(bag)
# True
```

```python
from shop.bag import *

"Bag" in dir()
# True
"goods" in dir()
# False
"count" in dir()
# False
"_hidden" in dir()
# False
```

没有 `__all__` 时，星号导入带出全部不以下划线开头的名字。`plain.py` 因此带出 `goods`，留下 `_hidden`。

```python
from plain import *

goods
# ('苹果', '梨')
"_hidden" in dir()
# False
```

名字写进 `__all__` 之后，即使以下划线开头也会被带出。`listed.py` 把 `_hidden` 放进了列表。

```python
from listed import *

goods
# ('苹果', '梨')
_hidden()
# '内部'
```

> [!tip]
>
> `__all__` 里的每一项都得是字符串，并且模块里真有这个名字。`missing.py` 先把 `goods` 绑进调用方，再到 `Missing` 时抛出 `AttributeError`。列表里混进整数时，抛出的是 `TypeError`。

```python
ns = {}
try:
    exec("from missing import *", ns)
except AttributeError as exc:
    err = f"{type(exc).__name__}: {exc}"
err
# "AttributeError: module 'missing' has no attribute 'Missing'"
"goods" in ns
# True
"Missing" in ns
# False
```

```python
import listed

listed.__all__ = ["goods", 1]
exec("from listed import *")
# TypeError: Item in listed.__all__ must be str, not int
```

## 3. 文档、注解和短名字

类、函数开头的字符串放进 `__doc__`。参数和返回值的注解放进 `__annotations__`，键 `'return'` 是返回值。带默认值的普通参数放进 `__defaults__`，仅限关键字的默认值放进 `__kwdefaults__`。

函数体内的局部注解不会留下。下面的 `label` 只在函数运行时存在。

```python
def price(count: int, rate: int = 2, *, tax: int = 0) -> int:
    """按件数计价。"""
    label: str = "苹果"
    return count * rate


price.__name__
# 'price'
price.__doc__
# '按件数计价。'
price.__annotations__
# {'count': <class 'int'>, 'rate': <class 'int'>, 'tax': <class 'int'>, 'return': <class 'int'>}
"label" in price.__annotations__
# False
price.__defaults__
# (2,)
price.__kwdefaults__
# {'tax': 0}
price(2)
# 4
```

`__name__` 是短名字。嵌套函数要看位置时用 `__qualname__`，局部函数的限定名里有 `<locals>`。

```python
def outer():
    def inner():
        return ("苹果", "梨")

    return inner


outer.__name__
# 'outer'
outer().__name__
# 'inner'
outer().__qualname__
# 'outer.<locals>.inner'
```

方法从实例上取出来时，`__self__` 是那个实例，`__func__` 是类里的原函数。调用时解释器把实例塞进第一个参数。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def total(self, unit):
        """按单价合计。"""
        return len(self.goods) * unit


bag = Bag(("苹果", "梨"))
bag.total.__name__
# 'total'
bag.total.__qualname__
# 'Bag.total'
bag.total.__self__ is bag
# True
bag.total.__func__ is Bag.total
# True
bag.total.__doc__
# '按单价合计。'
bag.total(3)
# 6
```

类体里的注解在类的 `__annotations__`。只有写出值的名字才会同时进类字典。

```python
class Bag:
    """一只袋子。"""

    goods: tuple
    rate: int = 2


Bag.__doc__
# '一只袋子。'
Bag.__annotations__
# {'goods': <class 'tuple'>, 'rate': <class 'int'>}
"goods" in Bag.__dict__
# False
Bag.rate
# 2
```

## 4. 类和实例的记录

实例的 `__class__` 指向它的类。类的 `__module__` 是定义它的模块名，这段代码按脚本运行，所以是 `__main__`。`shop.bag.Bag` 的 `__module__` 则是 `shop.bag`。

`__bases__` 是直接父类。`__mro__` 是属性查找的完整顺序，含自己和 `object`。实例的 `__dict__` 是它自己的属性字典，类属性不在里面。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)


class Tote(Bag):
    pass


bag = Bag(("苹果", "梨"))
bag.__class__ is Bag
# True
bag.__dict__
# {'goods': ('苹果', '梨')}
Bag.__name__
# 'Bag'
Bag.__qualname__
# 'Bag'
Bag.__module__
# '__main__'
Bag.__bases__
# (<class 'object'>,)
Tote.__bases__
# (<class '__main__.Bag'>,)
Tote.__mro__
# (<class '__main__.Tote'>, <class '__main__.Bag'>, <class 'object'>)
Tote.__name__
# 'Tote'
Tote.__qualname__
# 'Tote'
```

嵌套类的限定名带上外层类。

```python
class Outer:
    class Bag:
        def __init__(self, items):
            self.goods = tuple(items)


Outer.Bag.__name__
# 'Bag'
Outer.Bag.__qualname__
# 'Outer.Bag'
Outer.Bag(("苹果", "梨")).goods
# ('苹果', '梨')
```

## 5. **slots**

实例很多、属性集合固定时，用 `__slots__` 列出允许的属性名。这样的实例没有 `__dict__`。给名单以外的名字赋值，抛出 `AttributeError`。

```python
class Slotted:
    __slots__ = ("goods",)

    def __init__(self, items):
        self.goods = tuple(items)


bag = Slotted(("苹果", "梨"))
bag.goods
# ('苹果', '梨')
```

```python
class Slotted:
    __slots__ = ("goods",)

    def __init__(self, items):
        self.goods = tuple(items)


bag = Slotted(("苹果", "梨"))
bag.__dict__
# AttributeError: 'Slotted' object has no attribute '__dict__'. Did you mean: '__dir__'?
```

```python
class Slotted:
    __slots__ = ("goods",)

    def __init__(self, items):
        self.goods = tuple(items)


bag = Slotted(("苹果", "梨"))
bag.note = "新鲜"
# AttributeError: 'Slotted' object has no attribute 'note'
```

> [!tip]
>
> 父类没有 `__slots__` 时，子类即使声明了槽，实例仍有 `__dict__`。槽里的 `note` 不在这个字典里。类体里再给槽同名的属性赋值，定义类时就抛出 `ValueError`。默认值写在 `__init__` 里。

```python
class Parent:
    def __init__(self, items):
        self.goods = tuple(items)


class Child(Parent):
    __slots__ = ("note",)

    def __init__(self, items):
        super().__init__(items)
        self.note = "新鲜"


child = Child(("苹果", "梨"))
child.__dict__
# {'goods': ('苹果', '梨')}
"note" in child.__dict__
# False
child.note
# '新鲜'
```

```python
class Slotted:
    __slots__ = ("goods",)
    goods = ()
# ValueError: 'goods' in __slots__ conflicts with class variable
```

## 6. 创建实例

普通类只写 `__init__`。它在实例创建之后调用，负责把参数写进实例，并且不能返回值。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)


Bag(("苹果", "梨")).goods
# ('苹果', '梨')
```

```python
class Bag:
    def __init__(self, items):
        return 1


Bag(("苹果", "梨"))
# TypeError: __init__() should return None, not 'int'
```

继承 `tuple` 这种不可变类型时，内容要在 `__new__` 里定下来。`__new__` 的第一个参数是类，返回的是新实例。

```python
class Pair(tuple):
    def __new__(cls, items):
        return super().__new__(cls, tuple(items))


pair = Pair(("苹果", "梨"))
pair
# ('苹果', '梨')
type(pair).__name__
# 'Pair'
isinstance(pair, tuple)
# True
```

`__new__` 返回的对象如果不是这个类的实例，解释器就不再调用 `__init__`。

```python
class Skip:
    def __new__(cls, items):
        return tuple(items)

    def __init__(self, items):
        raise AssertionError("不应调用")


Skip(("苹果", "梨"))
# ('苹果', '梨')
```

> [!tip]
>
> `del 名字` 只减少引用，不会调用 `__del__`。引用到 0 时才调用，解释器退出时不保证执行。这个方法里抛出的异常会被忽略。

## 7. 打印和格式化

`__repr__` 给调试看，尽量写成能重建对象的形式。`__str__` 给人读。`str()`、`print()` 和空格式说明走 `__str__`；没有 `__str__` 时退回 `__repr__`。列表、字典这些容器打印元素时走 `__repr__`。

带格式说明的 `format()` 和 f-string 走 `__format__`。没定义这个方法时，空说明仍可用，非空说明由 `object.__format__` 抛出 `TypeError`。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __repr__(self):
        return f"Bag({self.goods!r})"

    def __str__(self):
        return "、".join(self.goods)

    def __format__(self, spec):
        if spec == "":
            return str(self)
        if spec == "count":
            return str(len(self.goods))
        raise ValueError(f"未知格式 {spec}")


bag = Bag(("苹果", "梨"))
repr(bag)
# "Bag(('苹果', '梨'))"
str(bag)
# '苹果、梨'
f"{bag}"
# '苹果、梨'
f"{bag!r}"
# "Bag(('苹果', '梨'))"
f"{bag:count}"
# '2'
[bag]
# [Bag(('苹果', '梨'))]
```

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __format__(self, spec):
        if spec == "count":
            return str(len(self.goods))
        raise ValueError(f"未知格式 {spec}")


format(Bag(("苹果", "梨")), "x")
# ValueError: 未知格式 x
```

```python
class Plain:
    def __init__(self, items):
        self.goods = tuple(items)

    def __repr__(self):
        return f"Plain({self.goods!r})"

    def __str__(self):
        return "、".join(self.goods)


plain = Plain(("苹果", "梨"))
f"{plain}"
# '苹果、梨'
```

```python
class Plain:
    def __str__(self):
        return "苹果、梨"


f"{Plain():count}"
# TypeError: unsupported format string passed to Plain.__format__
```

## 8. 长度、下标、迭代和真值

要让对象用上 `len()`、下标、`for` 和 `in`，就实现容器方法。`__len__` 返回非负整数。`__getitem__` 接受下标或切片，越界抛出 `IndexError`。下面把切片原样交给元组，所以切片结果是元组。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __len__(self):
        return len(self.goods)

    def __getitem__(self, key):
        return self.goods[key]


bag = Bag(("苹果", "梨"))
len(bag)
# 2
bag[0]
# '苹果'
bag[-1]
# '梨'
bag[1:]
# ('梨',)
```

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __getitem__(self, key):
        return self.goods[key]


Bag(("苹果", "梨"))[5]
# IndexError: tuple index out of range
```

`__iter__` 每次返回一个新迭代器时，对象可以重复遍历。它返回 `self` 且不重置进度时，第二次是空的。只有 `__getitem__` 时，`for` 会从 0 开始取下标，直到 `IndexError`。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __iter__(self):
        return iter(self.goods)


bag = Bag(("苹果", "梨"))
list(bag)
# ['苹果', '梨']
list(bag)
# ['苹果', '梨']
```

```python
class Once:
    def __init__(self, items):
        self.goods = tuple(items)
        self.n = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.n >= len(self.goods):
            raise StopIteration
        item = self.goods[self.n]
        self.n += 1
        return item


once = Once(("苹果", "梨"))
list(once)
# ['苹果', '梨']
list(once)
# []
```

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __getitem__(self, key):
        return self.goods[key]


list(Bag(("苹果", "梨")))
# ['苹果', '梨']
"苹果" in Bag(("苹果", "梨"))
# True
```

定义了 `__contains__` 之后，`in` 只问这个方法，不再逐项迭代。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __iter__(self):
        return iter(self.goods)

    def __contains__(self, item):
        return False


bag = Bag(("苹果", "梨"))
"苹果" in bag
# False
list(bag)
# ['苹果', '梨']
```

可修改的袋子实现 `__setitem__` 和 `__delitem__`。

```python
class Bag:
    def __init__(self, items):
        self.goods = list(items)

    def __getitem__(self, key):
        return self.goods[key]

    def __setitem__(self, key, value):
        self.goods[key] = value

    def __delitem__(self, key):
        del self.goods[key]

    def __iter__(self):
        return iter(self.goods)


bag = Bag(("苹果", "梨"))
bag[0] = "桃"
del bag[1]
list(bag)
# ['桃']
```

真值先看 `__bool__`，它必须返回 `True` 或 `False`。没有 `__bool__` 时看 `__len__`，长度 0 为假。两个都没有时，实例为真。`__bool__` 存在时不再看长度，所以只装「梨」的袋子也可以是假。

```python
class Bag:
    pass


bool(Bag())
# True
```

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __len__(self):
        return len(self.goods)


bool(Bag(()))
# False
bool(Bag(("梨",)))
# True
```

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __len__(self):
        return len(self.goods)

    def __bool__(self):
        return "苹果" in self.goods


bool(Bag(("梨",)))
# False
bool(Bag(("苹果",)))
# True
```

```python
class Bag:
    def __bool__(self):
        return 1


bool(Bag())
# TypeError: __bool__ should return bool, returned int
```

```python
class Bag:
    def __len__(self):
        return -1


len(Bag())
# ValueError: __len__() should return >= 0
```

`__missing__` 只给字典子类的下标用。键不存在时由它提供返回值。`in` 仍只看键在不在字典里。

```python
class Count(dict):
    def __missing__(self, key):
        return 0


Count()["苹果"]
# 0
"苹果" in Count()
# False
```

> [!tip]
>
> `len()`、`for`、`in`、运算符这些语法只在类上找特殊方法。把 `__len__` 赋给实例后，`len()` 仍抛出 `TypeError`，直接调用实例上的函数才会执行。把 `__iter__` 设成 `None` 表示这个类不能迭代，解释器不再退回 `__getitem__`。

```python
class C:
    pass


item = C()
item.__len__ = lambda: 5
item.__len__()
# 5
```

```python
class C:
    pass


item = C()
item.__len__ = lambda: 5
len(item)
# TypeError: object of type 'C' has no len()
```

```python
class Bag:
    __iter__ = None

    def __getitem__(self, key):
        return ("苹果", "梨")[key]


list(Bag())
# TypeError: 'Bag' object is not iterable
```

## 9. 相等、排序和哈希

`==` 调用 `__eq__`。类型不对时返回 `NotImplemented`，解释器再去问另一边；另一边也不支持，结果就是 `False`。`!=` 默认对 `__eq__` 的结果取反。

只写了 `__eq__` 的类，`__hash__` 会被设成 `None`，实例不能做字典键，也不能放进集合。内容和哈希都稳定时，再写 `__hash__`，并且让相等的对象哈希相同。哈希的具体整数每次启动解释器都会变，下面只比较它们是否相同。

`<` 调用 `__lt__`。`sorted` 用它排序。和整数比时两边都没有合适的方法，抛出 `TypeError`。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __repr__(self):
        return f"Bag({self.goods!r})"

    def __eq__(self, other):
        if not isinstance(other, Bag):
            return NotImplemented
        return self.goods == other.goods

    def __hash__(self):
        return hash(self.goods)

    def __lt__(self, other):
        if not isinstance(other, Bag):
            return NotImplemented
        return len(self.goods) < len(other.goods)


full = Bag(("苹果", "梨"))
same = Bag(("苹果", "梨"))
small = Bag(("苹果",))
full == same
# True
full == ("苹果", "梨")
# False
full != small
# True
hash(full) == hash(same)
# True
len({full, same, small})
# 2
sorted([full, small])
# [Bag(('苹果',)), Bag(('苹果', '梨'))]
```

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __lt__(self, other):
        if not isinstance(other, Bag):
            return NotImplemented
        return len(self.goods) < len(other.goods)


Bag(("苹果", "梨")) < 1
# TypeError: '<' not supported between instances of 'Bag' and 'int'
```

```python
class Loose:
    def __init__(self, items):
        self.goods = tuple(items)

    def __eq__(self, other):
        if not isinstance(other, Loose):
            return NotImplemented
        return self.goods == other.goods


Loose.__hash__
# None
```

```python
class Loose:
    def __eq__(self, other):
        return NotImplemented


hash(Loose())
# TypeError: unhashable type: 'Loose'
```

## 10. 当函数调用，以及 with

实例要像函数一样调用时，写 `__call__`。`Pricer(3)` 再传入商品元组，就会按件数乘单价。

```python
class Pricer:
    def __init__(self, unit):
        self.unit = unit

    def __call__(self, goods):
        return self.unit * len(goods)


Pricer(3)(("苹果", "梨"))
# 6
```

`with` 进入时调用 `__enter__`，它的返回值绑到 `as` 后面的名字。离开时调用 `__exit__`。三个参数是异常类型、异常值和回溯；正常离开时都是 `None`。`__exit__` 返回真值会吞掉这个异常，返回假值则继续向外抛。

```python
class Door:
    def __enter__(self):
        self.opened = True
        return self

    def __exit__(self, exc_type, exc, tb):
        self.opened = False
        return exc_type is ValueError


door = Door()
with door:
    opened = door.opened
opened
# True
door.opened
# False
```

```python
class Door:
    def __enter__(self):
        self.opened = True
        return self

    def __exit__(self, exc_type, exc, tb):
        self.opened = False
        return exc_type is ValueError


with Door():
    raise ValueError("缺货")
reached = True
reached
# True
```

```python
class Door:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return exc_type is ValueError


with Door():
    raise TypeError("类型不对")
# TypeError: 类型不对
```

## 11. 属性不存在时

`__getattr__` 只在普通查找失败后调用。已经存在的 `goods` 不会进这个方法。未知名字在这里抛出 `AttributeError`。

```python
class BagView:
    def __init__(self, items):
        self.goods = tuple(items)

    def __getattr__(self, name):
        if name == "count":
            return len(self.goods)
        raise AttributeError(name)


view = BagView(("苹果", "梨"))
view.goods
# ('苹果', '梨')
view.count
# 2
```

```python
class BagView:
    def __getattr__(self, name):
        raise AttributeError(name)


BagView().note
# AttributeError: note
```

> [!tip]
>
> `__getattribute__` 每次取属性都会进来，包括方法内部再次写 `self.goods`。这样会陷入自己，抛出 `RecursionError`。要读实例数据时改调用 `object.__getattribute__(self, name)`。

```python
class Recurse:
    def __getattribute__(self, name):
        return self.__dict__[name]


Recurse().goods
# RecursionError: maximum recursion depth exceeded
```

## 12. 加法

`+` 先调用左边的 `__add__`。该方法返回 `NotImplemented` 时，再调用右边的 `__radd__`。两边都不支持，抛出 `TypeError`。减法、乘法、真除、整除、取余对应 `__sub__`、`__mul__`、`__truediv__`、`__floordiv__`、`__mod__`。矩阵乘法是 `__matmul__`，幂是 `__pow__`，移位是 `__lshift__` 和 `__rshift__`，按位与、异或、或是 `__and__`、`__xor__`、`__or__`。反向运算的名字前面加 `r`，原地运算的名字前面加 `i`。

`+=` 有 `__iadd__` 时调用它。返回原来的实例，名字就还是这个对象。没有 `__iadd__` 时退回 `+`，左边的名字改绑到新对象。

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __repr__(self):
        return f"Bag({self.goods!r})"

    def __add__(self, other):
        if isinstance(other, Bag):
            return Bag(self.goods + other.goods)
        if isinstance(other, tuple):
            return Bag(self.goods + other)
        return NotImplemented

    def __radd__(self, other):
        if isinstance(other, tuple):
            return Bag(other + self.goods)
        return NotImplemented


Bag(("苹果",)) + Bag(("梨",))
# Bag(('苹果', '梨'))
Bag(("苹果",)) + ("梨",)
# Bag(('苹果', '梨'))
("苹果",) + Bag(("梨",))
# Bag(('苹果', '梨'))
```

```python
class Bag:
    def __add__(self, other):
        return NotImplemented


Bag() + 1
# TypeError: unsupported operand type(s) for +: 'Bag' and 'int'
```

```python
class Bag:
    def __init__(self, items):
        self.goods = list(items)

    def __iadd__(self, other):
        self.goods.extend(other)
        return self


bag = Bag(["苹果"])
same = bag
bag += ["梨"]
bag.goods
# ['苹果', '梨']
bag is same
# True
```

```python
class Bag:
    def __init__(self, items):
        self.goods = tuple(items)

    def __add__(self, other):
        return Bag(self.goods + tuple(other))


bag = Bag(("苹果",))
same = bag
bag += ("梨",)
bag.goods
# ('苹果', '梨')
bag is same
# False
```

## 13. 模式匹配里的位置参数

`match` 的类模式默认不接受位置参数。类上设置 `__match_args__` 后，位置参数按这个元组里的属性名对应过去。`Bag((first, second))` 因此等价于按 `goods` 匹配。

```python
class Bag:
    __match_args__ = ("goods",)

    def __init__(self, goods):
        self.goods = tuple(goods)


def head(bag):
    match bag:
        case Bag((first, second)):
            return first, second


head(Bag(("苹果", "梨")))
# ('苹果', '梨')
```

没有这个属性时，位置参数直接被拒绝。

```python
class NoMatch:
    def __init__(self, goods):
        self.goods = tuple(goods)


def head(bag):
    match bag:
        case NoMatch(first):
            return first


head(NoMatch(("苹果", "梨")))
# TypeError: NoMatch() accepts 0 positional sub-patterns (1 given)
```
