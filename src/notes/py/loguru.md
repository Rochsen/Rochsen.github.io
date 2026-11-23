## title: loguru库的使用
date: 2026-11-23
order: 5
category: [教程, python库]
tag: [python]
article: true
star: true

给 Python 打日志。导入就能用，不用先配 Handler。



```shell
pip install loguru
```

Windows 上会自动装 `colorama` 和 `win32-setctime`。前者给控制台颜色，后者给轮转日志写创建时间。

本文按 loguru 0.8.0 的源码核对过。包根只导出 `logger`。下文用到它的 `add`、`remove`、`trace`、`debug`、`info`、`success`、`warning`、`error`、`critical`、`exception`、`log`、`catch`、`bind`、`contextualize`、`patch`、`opt`、`level`、`disable`、`enable`、`configure`、`complete`、`parse`。

---

下面两个值贯穿全文。为了结果稳定，先去掉默认的 stderr，把日志收到列表里。

```python
from loguru import logger

user = "alice"
order_id = 42

logger.remove()
sink = []
logger.add(sink.append, format="{level} | {message}")
```

## 1. 默认 logger 与级别

`from loguru import logger` 之后就可以打日志。导入时若 `LOGURU_AUTOINIT` 为真（默认就是），会往 `sys.stderr` 加一个 handler，编号是 `0`，最低级别 `DEBUG`。

默认格式是：

```text
<green>{time:YYYY-MM-DD HH:mm:ss.SSS Z}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>
```

时间、级别、调用位置、正文都会有。终端支持时带颜色。后文改成 `{level} | {message}`，只看级别和正文。

标准级别和对应方法：

| 级别     | 数值 | 方法              |
| -------- | ---- | ----------------- |
| TRACE    | 5    | `logger.trace`    |
| DEBUG    | 10   | `logger.debug`    |
| INFO     | 20   | `logger.info`     |
| SUCCESS  | 25   | `logger.success`  |
| WARNING  | 30   | `logger.warning`  |
| ERROR    | 40   | `logger.error`    |
| CRITICAL | 50   | `logger.critical` |

`SUCCESS` 是 loguru 多出来的。`TRACE` 比默认阈值 `DEBUG` 低，所以默认看不到。

```python
logger.debug("调试")
logger.info("普通")
logger.success("成功")
logger.warning("警告")
logger.error("出错")
logger.trace("跟踪")
sink
# ['DEBUG | 调试\n', 'INFO | 普通\n', 'SUCCESS | 成功\n', 'WARNING | 警告\n', 'ERROR | 出错\n']
```

查级别信息用 `logger.level`。只传名字是查询，不能改已有级别的数值。

```python
logger.level("INFO")
# Level(name='INFO', no=20, color='<bold>', icon='...')
logger.level("NOPE")
# ValueError: Level 'NOPE' does not exist
```

## 2. 消息怎么填

消息按 `str.format` 展开。位置参数和关键字都能用。关键字会同时写进 `record["extra"]`。

```python
sink.clear()
logger.info("用户 {user} 创建订单 {order_id}", user=user, order_id=order_id)
logger.info("用户 {} 创建订单 {}", user, order_id)
sink
# ['INFO | 用户 alice 创建订单 42\n', 'INFO | 用户 alice 创建订单 42\n']
```

没有传入任何格式化参数时，花括号原样留下，不会报错。

```python
sink.clear()
logger.info("用户 {user}")
sink[-1]
# 'INFO | 用户 {user}\n'
```

传了一部分、却漏了占位符时，会包装成 `ValueError`。

```python
logger.info("用户 {user} 订单 {order_id}", user=user)
# ValueError: The logging message could not be formatted with the provided arguments.
```

> [!tip]
>
> 不要对还含 `{name}` 的字符串再用 f-string。f-string 会先把花括号填掉，loguru 再 format 一次就会出错。字面量花括号写成 `{{` `}}`。

`logger.exception` 固定打 `ERROR`，并带上当前正在处理的异常。只在 `except` 里用。

```python
sink.clear()
try:
    1 / 0
except ZeroDivisionError:
    logger.exception("结算失败")
"ZeroDivisionError" in sink[-1]
# True
sink[-1].splitlines()[0]
# 'ERROR | 结算失败'
```

## 3. add 和 remove

`add` 返回 handler 编号。`remove(编号)` 去掉一个。`remove()` 去掉全部，包括默认的 stderr。

```python
from io import StringIO

buf = StringIO()
hid = logger.add(buf, format="{level} | {message}", colorize=False)
logger.info("第二路")
logger.remove(hid)
buf.getvalue()
# 'INFO | 第二路\n'
logger.remove(999)
# ValueError: There is no existing handler with id 999
```

`sink` 可以是：

- 文件路径（`str` 或 `Path`），相对路径按**当前工作目录**解析
- 带 `write` 的对象，例如 `sys.stderr`、`StringIO`
- 可调用对象，例如上面的 `sink.append`
- 标准库 `logging.Handler`
- `async def` 协程函数，结束前要 `await logger.complete()`

常用参数：

| 参数        | 作用                                                            |
| ----------- | --------------------------------------------------------------- |
| `level`     | 这个 sink 的最低级别，默认 `DEBUG`                              |
| `format`    | 模板字符串，或接收 `record`、返回模板的函数                     |
| `filter`    | 函数 / 模块名 / `{模块: 级别}` 字典                             |
| `serialize` | `True` 时写出一行 JSON                                          |
| `enqueue`   | `True` 时先入队，多进程写文件时用，调用后要 `logger.complete()` |
| `diagnose`  | 异常里是否打印局部变量，默认 `True`                             |
| `backtrace` | 异常是否向上扩展栈，默认 `True`                                 |
| `catch`     | sink 自己出错时是否吞掉，默认 `True`                            |
| `colorize`  | 是否着色；`None` 时按是不是 tty 自动决定                        |

`filter` 用函数时，返回 `True` 才写入。字符串表示只收这个模块及其子模块。

```python
sink.clear()
logger.remove()
logger.add(sink.append, format="{level} | {message}", filter=lambda r: r["level"].no >= 30)
logger.info("忽略")
logger.warning("保留")
sink
# ['WARNING | 保留\n']
```

> [!tip]
>
> 不要在 sink、轮转、压缩函数里再调用 `logger`。logging 函数不可重入，可能死锁。

## 4. 写文件

工作目录为 `demo/`。`add` 收到路径时会 `os.makedirs` 建父目录，再用 `os.path.abspath` 打开文件，默认 UTF-8、追加、按行缓冲。

```python
from pathlib import Path

logger.remove()
hid = logger.add("logs/app.log", format="{level} | {message}", encoding="utf8")
logger.info("用户 {user} 创建订单 {order_id}", user=user, order_id=order_id)
logger.remove(hid)
Path("logs/app.log").read_text(encoding="utf8")
# 'INFO | 用户 alice 创建订单 42\n'
```

路径里可以写 `{time}`，按创建时的时间展开，也能用来分目录：

```python
logger.remove()
logger.add("logs/{time:YYYY-MM-DD}/app.log", format="{message}", encoding="utf8")
logger.info("按日分目录")
logger.remove()
# 写入 logs/<当天日期>/app.log
```

`rotation` 在每条日志写入前检查。超出后关掉当前文件，把旧文件改名为 `文件名.创建时间.后缀`，再开新文件。

```python
logger.remove()
logger.add("rotate.log", format="{message}", rotation=40, encoding="utf8")
for i in range(3):
    logger.info("xxxxxxxxxxxxxxxxxxxx {i}", i=i)
logger.remove()
# 当前文件 rotate.log
# 旧文件改名为 rotate.<创建时间>.log
```

`retention` 在轮转时、或没有轮转而 sink 停止时清理旧文件。整数表示保留几个文件。`compression="zip"` 会在关闭时把日志打成 `zipme.log.zip`。

> [!tip]
>
> 两个 handler 不要写同一个路径。`{time}` 单独用也防不住冲突。子进程、Gunicorn worker 里重复 `add` 同一文件，轮转时会互相改名或删除。
>
> 相对路径跟着进程当前目录走，不看脚本所在目录。包里要传绝对路径，例如 `Path(__file__).resolve().parent / "app.log"`。

`serialize=True` 每条日志变成一行 JSON，含 `text` 和 `record`。`record["extra"]` 里能看到关键字参数。

```python
import json

logger.remove()
logger.add("ser.log", serialize=True, encoding="utf8")
logger.info("用户 {user} 创建订单 {order_id}", user=user, order_id=order_id)
logger.remove()
obj = json.loads(Path("ser.log").read_text(encoding="utf8"))
obj["record"]["message"], obj["record"]["extra"]
# ('用户 alice 创建订单 42', {'user': 'alice', 'order_id': 42})
```

多进程写同一个文件时加 `enqueue=True`。子进程结束前调用 `logger.complete()`，把队列里的消息刷完。

## 5. catch

`catch` 可当装饰器，也可当上下文管理器。捕获后默认打 `ERROR`，函数返回 `None`（或你给的 `default`），异常不再往外抛。

```python
logger.remove()
sink = []
logger.add(sink.append, format="{level} | {message}", diagnose=False, backtrace=False)

@logger.catch
def checkout(n):
    return 100 / n

def main():
    return checkout(0)

main()
# None
sink[-1].splitlines()[0]
# "ERROR | An error has been caught in function 'main', process 'MainProcess' (...), thread 'MainThread' (...):"
"ZeroDivisionError: division by zero" in sink[-1]
# True
```

默认 message 里的 `function` 是**调用点**，不是被装饰的函数名。堆栈里两者都会出现。

需要让调用方自己处理时，设 `reraise=True`。不想记录某种异常，用 `exclude`。

```python
@logger.catch(reraise=True)
def checkout(n):
    return 100 / n

checkout(0)
# 仍会写一条 ERROR，随后再抛出 ZeroDivisionError
```

```python
with logger.catch(message="结算失败"):
    1 / 0
# ERROR | 结算失败
# ZeroDivisionError: division by zero
```

```python
with logger.catch(exclude=ZeroDivisionError):
    1 / 0
# 不写日志，异常原样出去
```

`diagnose=True`（sink 默认值）会在堆栈里画出局部变量。生产环境应关掉，避免把密钥、用户数据写进日志。

```python
logger.remove()
sink = []
logger.add(sink.append, format="{level} | {message}", diagnose=True, backtrace=True)

def pay(amount):
    fee = 0
    return amount / fee

try:
    pay(99)
except ZeroDivisionError:
    logger.exception("结算失败")
# ERROR | 结算失败
# 堆栈里会标出 amount 为 99、fee 为 0
```

## 6. bind、contextualize、patch

`bind` 返回一个带了 `extra` 的新 logger，适合按请求、按用户固定上下文。

```python
logger.remove()
sink = []
logger.add(sink.append, format="{extra[user]} | {message}")
log = logger.bind(user=user)
log.info("登录")
log.bind(user="bob").info("切换用户")
sink
# ['alice | 登录\n', 'bob | 切换用户\n']
```

`format` 写了 `{extra[user]}`，却既没有 `bind` 也没有关键字参数时：

```python
logger.remove()
logger.add(sink.append, format="{extra[user]} | {message}", catch=False)
logger.info("没有 bind")
# ValueError: Failed to format log record: key 'user' not found.
```

> [!tip]
>
> `catch=True`（默认）时，这条错误打到 stderr，调用方看不到异常，日志也丢了。绑定了 extra 的 format，开发阶段把 `catch=False` 打开。

`contextualize` 用 `contextvars`，只在 `with` 块里有效，线程和异步任务互不影响。退出后 `extra` 恢复。

```python
logger.remove()
sink = []
logger.add(sink.append, format="{message} | {extra}")
with logger.contextualize(order_id=order_id):
    logger.info("处理中")
logger.info("结束")
sink
# ["处理中 | {'order_id': 42}\n", "结束 | {}\n"]
```

`patch` 在每条记录送去 handler 之前改 `record`。改 `record["extra"]`，不要改内部字段。

```python
logger.remove()
sink = []
logger.add(sink.append, format="{extra[tag]} | {message}")
log = logger.patch(lambda r: r["extra"].update(tag="pay"))
log.info("付款")
sink[-1]
# 'pay | 付款\n'
```

## 7. opt

`opt` 只影响这一次调用。不能链式叠加，后一次会把选项重置回默认。

```python
logger.remove()
sink = []
logger.add(sink.append, format="{level} | {message}")

logger.opt(record=True).info("行号 {record[line]}")
logger.opt(raw=True).info("原始消息\n")
sink
# ['INFO | 行号 ...\n', '原始消息\n']
```

`lazy=True` 时，位置参数和关键字都要传**无参可调用对象**。级别不够就不会调用，用来跳过昂贵计算。

```python
called = []

def heavy():
    called.append(1)
    return "heavy"

logger.remove()
sink = []
logger.add(sink.append, format="{message}", level="INFO")
logger.opt(lazy=True).debug("x={x}", x=heavy)
called, sink
# ([], [])
logger.opt(lazy=True).info("x={x}", x=heavy)
called, sink
# ([1], ['x=heavy\n'])
```

已经抓住的异常，用 `opt(exception=True)` 打到任意级别，不必再用 `exception` 方法。

```python
try:
    1 / 0
except ZeroDivisionError:
    logger.opt(exception=True).debug("调试时看堆栈")
```

`capture=False` 时，关键字仍用于 format，但不会写进 `extra`。包一层日志函数时，用 `depth` 把调用位置指到真正的业务代码。

## 8. 自定义级别、开关、configure

增加级别必须同时给 `name` 和 `no`。已有级别不能改 `no`。`logger.log` 用级别名；传入未登记的整数时，显示成 `Level 13` 这种匿名级别。

```python
logger.remove()
sink = []
logger.add(sink.append, format="{level.name} {level.no} | {message}")
logger.level("AUDIT", no=15, color="<blue>", icon="@")
logger.log("AUDIT", "审计")
logger.log(13, "匿名")
sink
# ['AUDIT 15 | 审计\n', 'Level 13 13 | 匿名\n']
```

```python
logger.level("AUDIT", no=16)
# ValueError: Level 'AUDIT' already exists, you can't update its severity no
```

```python
logger.log("NOPE", "x")
# ValueError: Level 'NOPE' does not exist
```

`disable(模块名)` 关掉该模块及其子模块。库作者应当在包里关掉自己的名字，避免打扰用户。用户要用时再 `enable`。空字符串 `""` 表示所有模块。

```python
logger.remove()
sink = []
logger.add(sink.append, format="{message}")
logger.disable("__main__")
logger.info("关掉")
logger.enable("__main__")
logger.info("打开")
sink
# ['打开\n']
```

`configure(handlers=...)` 会先 `remove()` 再按列表 `add`。`extra` 是全局默认上下文，所有模块都能看到。`activation` 按列表顺序调用 `enable` / `disable`。

```python
ids = logger.configure(
    handlers=[dict(sink=sink.append, format="{extra[app]} | {message}")],
    extra={"app": "shop"},
)
logger.info("启动")
len(ids), sink[-1]
# (1, 'shop | 启动\n')
```

## 9. parse

按正则把日志文件拆成字典。命名分组会成为键。路径按 UTF-8 读；其他编码先自己打开文件再传进去。

```python
logger.remove()
logger.add("parse.log", format="{level} | {message}", encoding="utf8")
logger.info("用户 alice 创建订单 42")
logger.warning("库存不足")
logger.remove()

list(logger.parse("parse.log", r"(?P<level>\w+) \| (?P<message>.*)"))
# [{'level': 'INFO', 'message': '用户 alice 创建订单 42'}, {'level': 'WARNING', 'message': '库存不足'}]
```

## 10. 和标准库 logging 的区别

标准库要自己搭 Logger、Handler、Formatter。loguru 只有一个预创建的 `logger`，输出目标用 `add` 堆上去。

默认行为就不一样。标准库根 logger 有效级别是 `WARNING`，没配 Handler 时 `info` 直接丢掉；`warning` 才走 `lastResort` 打到 stderr。loguru 导入后 `DEBUG` 就能在 stderr 看到。

```python
import logging

lg = logging.getLogger("shop")
lg.info("看不到")
# 无输出
lg.warning("能看到")
# 能看到
```

拼消息的方式也不同。标准库默认 `%` 格式化；loguru 用 `{}`。标准库要把字段放进 `extra`，还得在 format 里写 `%(user)s`，漏配会在 handler 里报错。loguru 的关键字既格式化正文，又进 `extra`。

```python
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s", force=True)
logging.getLogger("shop").info("用户 %s 创建订单 %s", user, order_id)
# INFO | 用户 alice 创建订单 42
```

文件轮转、按时间切分、压缩、保留份数，标准库要 `RotatingFileHandler` / `TimedRotatingFileHandler` 再自己写清理。loguru 在 `add` 的 `rotation`、`retention`、`compression` 里一次配完。

异常方面，标准库是 `logger.exception` 或 `exc_info=True`，堆栈是普通 traceback。loguru 额外提供 `catch`，以及 `diagnose` 把局部变量画出来。这是查 bug 时最明显的差别，也是生产环境要把 `diagnose=False` 的原因。

上下文方面，标准库用 `LoggerAdapter` 或每次传 `extra=`。loguru 用 `bind` 得到带上下文的 logger，用 `contextualize` 做线程/协程局部上下文。

级别上，loguru 多了 `TRACE` 和 `SUCCESS`。标准库的 logger 按模块名层层传播；loguru 是同一个 `logger`，用 `record["name"]` 加 `filter` / `disable` 做划分。

第三方库几乎都打到标准库。loguru 可以当这些 Handler 的后端，反过来也行。把标准库接到 loguru，用文档里的 `InterceptHandler`：它把级别对齐，并用 `opt(depth=...)` 把调用位置指回业务代码。

```python
import inspect
import logging

from loguru import logger

logger.remove()
sink = []
logger.add(sink.append, format="{name}:{function} | {level} | {message}")


class InterceptHandler(logging.Handler):
    def emit(self, record):
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno
        frame, depth = inspect.currentframe(), 0
        while frame:
            filename = frame.f_code.co_filename
            is_logging = filename == logging.__file__
            is_frozen = "importlib" in filename and "_bootstrap" in filename
            if depth > 0 and not (is_logging or is_frozen):
                break
            frame = frame.f_back
            depth += 1
        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())


logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)


def place_order():
    logging.getLogger("shop").info("从标准库转过来")


place_order()
sink[-1]
# '__main__:place_order | INFO | 从标准库转过来\n'
```

反过来，把 loguru 接到已经配好的标准库 Handler，直接 `logger.add(某个Handler)`。loguru 会把记录转成 `logging.LogRecord` 再交给它。

选用上可以记这几条：

- 自己的应用、想少写配置、需要轮转和异常诊断：用 loguru
- 给别人用的库：继续打标准库，或在包里 `logger.disable("你的包名")`，让用户决定听不听
- 两边都要：用 `InterceptHandler` 把标准库汇进 loguru，只维护一套 sink
