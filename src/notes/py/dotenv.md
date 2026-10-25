---
title: dotenv库的使用
date: 2026-10-25
order: 3
category: [教程, python库]
tag: [python]
article: true
star: true
---

加载 .env 文件内容，通常用于密钥配置和API key

> [!tip]
>
> `load_dotenv`、`dotenv_values`、`find_dotenv` 默认从调用它们的 `.py` 文件向上找 `.env`，不看进程当前目录。写在应用入口脚本里可以直接调用。写在给别人导入的包里时，找的是包文件所在目录，看不到调用方项目的 `.env`。传入 `dotenv_path` 绝对路径后可以在包里用。`usecwd=True`、交互解释器、调试器才跟随当前目录。`get_key`、`set_key`、`unset_key` 只读写传入的文件。`get_cli_string` 只拼命令字符串。

<!-- more -->

本文按 python-dotenv 1.2.1 的源码核对过。包根导出 `load_dotenv`、`dotenv_values`、`find_dotenv`、`get_key`、`set_key`、`unset_key`、`get_cli_string`、`load_ipython_extension`。

后文共用这棵目录。`app/.env` 的内容如下。`main.py` 和 `nested/task.py` 在应用一侧。`lib/pkg/loader.py` 模拟被导入的包。

```text
demo/
├── app/
│   ├── .env
│   ├── main.py
│   └── nested/
│       └── task.py
└── lib/
    └── pkg/
        └── loader.py
```

```shell
pip install python-dotenv
```

```text
# .env 内容 
API_KEY=sk-demo
BASE_URL=https://api.example.com/v1
EMPTY=
TOKEN
GREETING=hello ${USER_NAME:-guest}
```

## 1. load_dotenv

`load_dotenv` 解析 `.env`，把键写入 `os.environ`。不传 `dotenv_path` 和 `stream` 时，用 `find_dotenv()` 找文件。文件里至少解析出一个键就返回 `True`。文件不存在或内容为空时返回 `False`。

工作目录在 `demo`，下面的代码写在 `app/main.py` 里运行。环境里还没有 `USER_NAME`。

```python
import os

from dotenv import load_dotenv

os.environ["API_KEY"] = "already"
load_dotenv()
# True
os.environ["API_KEY"]
# 'already'
os.environ["BASE_URL"]
# 'https://api.example.com/v1'
os.environ["EMPTY"]
# ''
os.environ.get("TOKEN")
# None
os.environ["GREETING"]
# 'hello guest'
```

> [!tip]
>
> `override` 默认是 `False`。环境里已经有的键保持原值，返回值仍是 `True`。没有等号的键解析成 `None`，不会写入环境变量。

`override=True` 会用文件里的值盖掉环境变量。下面仍写在 `app/main.py` 里。

```python
load_dotenv(override=True)
# True
os.environ["API_KEY"]
# 'sk-demo'
```

`verbose=True` 且文件不存在时，向日志记录器 `dotenv.main` 打一条 INFO：`python-dotenv could not find configuration file ...`。默认日志级别看不到这行。下面的工作目录是 `demo`。

```python
load_dotenv("app/no.env", verbose=True)
# False
```

> [!tip]
>
> 环境变量 `PYTHON_DOTENV_DISABLED` 为 `1`、`true`、`t`、`yes`、`y` 时，`load_dotenv` 直接返回 `False`，不读文件。

```python
os.environ["PYTHON_DOTENV_DISABLED"] = "1"
load_dotenv(override=True)
# False
```

## 2. dotenv_values

`dotenv_values` 只返回字典，不改 `os.environ`。没有等号的键对应 `None`。`${NAME:-default}` 在 `interpolate=True`（默认）时替换。环境里已有的同名变量会参与替换。

工作目录在 `demo`。先去掉上一节留下的 `USER_NAME` 和禁用开关。

```python
import os

from dotenv import dotenv_values

os.environ.pop("USER_NAME", None)
os.environ.pop("PYTHON_DOTENV_DISABLED", None)
dotenv_values("app/.env")
# OrderedDict([('API_KEY', 'sk-demo'), ('BASE_URL', 'https://api.example.com/v1'), ('EMPTY', ''), ('TOKEN', None), ('GREETING', 'hello guest')])
```

```python
os.environ["USER_NAME"] = "ada"
dotenv_values("app/.env")["GREETING"]
# 'hello ada'
dotenv_values("app/.env", interpolate=False)["GREETING"]
# 'hello ${USER_NAME:-guest}'
```

> [!tip]
>
> 单引号、双引号和裸值都会做 `${}` 插值。引号去掉之后才替换，单引号不能挡住变量。

```python
from io import StringIO

os.environ.pop("USER_NAME", None)
dotenv_values(stream=StringIO("GREETING='${USER_NAME:-guest}'\n"))["GREETING"]
# 'guest'
```

## 3. find_dotenv

`find_dotenv` 从起点目录向上找指定文件名，默认是 `.env`。找到就返回路径，找不到返回空字符串。

普通 `.py` 脚本里，起点是调用 `find_dotenv` 的那个文件所在目录。工作目录在 `demo` 时，`app/main.py` 里：

```python
from dotenv import find_dotenv

find_dotenv()
# demo/app/.env
find_dotenv(usecwd=True)
# ''
```

`app/nested/task.py` 再往上一级，仍然找到 `app/.env`。

```python
find_dotenv()
# demo/app/.env
```

> [!tip]
>
> `usecwd=True`、交互解释器、调试器里，起点改成当前工作目录。上面第二次调用的当前目录是 `demo`，这里没有 `.env`，所以是空字符串。把同一段代码贴进解释器，也会按当前目录找，而不是按 `main.py` 找。

包文件 `lib/pkg/loader.py` 调用 `load_dotenv()` 时，即使当前目录已经是 `app`，查找仍从 `loader.py` 往上走，不会进入旁边的 `app/.env`。

```python
from dotenv import find_dotenv, load_dotenv

find_dotenv()
# ''
load_dotenv()
# False
```

> [!tip]
>
> 调用方自己的代码里没有 `load_dotenv`。包内部空找一轮后返回 `False`，调用方的密钥不会被装进环境变量，看起来像配置没生效。包要读调用方指定的文件时，让调用方传入绝对路径。

```python
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / "app" / ".env")
# 在 loader.py 中：True
```

`parents[2]` 从 `lib/pkg/loader.py` 数到 `demo`。这只说明绝对路径能指定文件。包自己的安装位置通常不在调用方项目里面，不要靠相对层级去猜。

> [!tip]
>
> `raise_error_if_not_found=True` 且向上都没有目标文件时，抛出 `OSError`，消息是 `File not found`。默认不抛，返回 `''`。

```python
find_dotenv(raise_error_if_not_found=True, usecwd=True)
# 工作目录在 demo 时：OSError: File not found
```

## 4. get_key、set_key、unset_key

这三个函数只动传入的路径。工作目录在 `demo`。

```python
from dotenv import get_key

get_key("app/.env", "API_KEY")
# 'sk-demo'
get_key("app/.env", "NO_SUCH")
# None
```

> [!tip]
>
> 键不存在时，`get_key` 打出警告 `Key NO_SUCH not found in ...`，返回 `None`，不抛异常。

`set_key` 默认 `quote_mode="always"`，值用单引号包起来。`auto` 只给含有非字母数字的值加引号。`never` 不加引号。`export=True` 时行首加上 `export `。文件不存在时会把这个路径创建出来。

```python
from pathlib import Path

from dotenv import set_key, unset_key

set_key("extra.env", "TOKEN", "abc")
# (True, 'TOKEN', 'abc')
set_key("extra.env", "PLAIN", "abc", quote_mode="auto")
# (True, 'PLAIN', 'abc')
set_key("extra.env", "EXP", "z", export=True, quote_mode="never")
# (True, 'EXP', 'z')
Path("extra.env").read_text(encoding="utf-8")
# "TOKEN='abc'\nPLAIN=abc\nexport EXP=z\n"
```

```python
set_key("extra.env", "X", "y", quote_mode="bad")
# ValueError: Unknown quote_mode: bad
```

```python
unset_key("extra.env", "PLAIN")
# (True, 'PLAIN')
unset_key("extra.env", "NOPE")
# (None, 'NOPE')
unset_key("missing.env", "A")
# (None, 'A')
```

> [!tip]
>
> 文件不存在，或文件里没有这个键时，`unset_key` 返回 `(None, 键名)`，并写日志。它不抛异常。

## 5. get_cli_string

`get_cli_string` 把参数拼成一条 `dotenv` 命令，不读文件，也不改环境变量。

```python
from dotenv import get_cli_string

get_cli_string()
# 'dotenv'
get_cli_string(path=".env", action="set", key="API_KEY", value="a b", quote="never")
# 'dotenv -q never -f .env set API_KEY "a b"'
```

## 6. load_ipython_extension

`load_ipython_extension` 在 IPython 里注册行魔法 `%dotenv`。先执行 `%load_ext dotenv`。`%dotenv` 用 `find_dotenv(usecwd=True)` 从当前目录向上找。

工作目录在 `app` 时，`%dotenv` 会装入 `app/.env`。工作目录在 `demo` 时，终端打印：

```text
cannot find .env file
```
