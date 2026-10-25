---
title: pyprojroot库的使用
date: 2026-10-25
order: 2
category: [教程, python库]
tag: [python]
article: true
star: true
---

用于获取项目的根目录，避免复杂的相对路径引用

> [!tip]
>
> `here`、`get_here` 按当前工作目录找根，不适合放进给别人导入的包。`find_root`、`find_root_with_reason` 省略 `start` 或传入相对路径时也一样；`start` 用 `Path(__file__).resolve()` 时可以在包里用。`has_file`、`has_dir`、`matches_glob`、`as_root_criterion` 只判断给定目录，不负责找根。

<!-- more -->

本文按 pyprojroot 0.3.0 的源码核对过。包根导出 `here`、`find_root`、`find_root_with_reason`、`has_file`、`has_dir`、`as_root_criterion`。`matches_glob`、`get_here`、`as_start_path` 从子模块调用。

后文共用这棵目录。`proj` 是项目根。`notes.txt` 的内容是 `root`。`nested` 里另有编辑器目录和依赖文件。

```text
proj/
├── .git/
├── pyproject.toml
├── notes.txt
├── src/pkg/data.csv
└── nested/
    ├── .vscode/
    ├── requirements.txt
    └── inner/
```


## 安装命令

```shell
pip install pyprojrooot
```


## 1. here

`here` 适合当前工作目录已经在目标项目里的时候使用，例如在项目目录中打开的终端或笔记本。它用 `Path.cwd()` 读取这个目录，再向上查找，命中下表任一标记即停，返回 `pathlib.Path`。脚本放在哪个盘不影响结果。表里只列示例目录中有的标记。

| 标记 | 认成 |
| --- | --- |
| `.git` | 目录 |
| `requirements.txt` | 文件 |
| `pyproject.toml` | 文件 |
| `.vscode` | 目录 |

工作目录在 `proj/src/pkg` 时，根是 `proj`：

```python
from pyprojroot import here

here()
# proj
here("src/pkg/data.csv")
# proj/src/pkg/data.csv
here("notes.txt").read_text(encoding="utf-8")
# 'root\n'
```

> [!tip]
>
> 脚本会被另一个目录启动，或被另一个项目调用时，用下一节的 `find_root`，起点传 `Path(__file__).resolve()`。

### 找错根

> [!tip]
>
> 查找从当前工作目录逐层向上，某一层有标记就停。`proj/nested/inner` 没有标记，上一层 `proj/nested` 有 `.vscode` 和 `requirements.txt`，结果停在 `proj/nested`。外层 `proj` 的 `.git` 这一轮不会再看。

```python
here()
# 工作目录在 proj/nested/inner 时：proj/nested
```

两个项目互相调用时也是同一条规则。A、B 各自有 `.git` 和 `data/info.txt`。终端当前目录是 A，运行的是 B 的脚本：

```text
A/
├── .git/
└── data/info.txt    # 内容 from-A
B/
├── .git/
├── script.py        # 里面调用 here("data/info.txt")
└── data/info.txt    # 内容 from-B
```

```python
# B/script.py，进程当前目录是 A
here("data/info.txt")
# A/data/info.txt
here("data/info.txt").read_text(encoding="utf-8")
# 'from-A\n'
```

> [!tip]
>
> A 里也有这条相对路径时，`here()` 不报错，读到的是 A 的文件。这条路径只存在于 B 时，`here()` 仍返回拼出来的路径，接着读取才抛出 `FileNotFoundError`。

### 包里不要用 here

> [!tip]
>
> 给别人导入的包不要用 `here` 定位包内文件。调用方执行 `import` 时，进程的当前目录是调用方项目，包里的 `here()` 会拼出调用方的路径。

```python
# 包内 pkg/loader.py
from pyprojroot import here

def load():
    return here("data/info.txt").read_text(encoding="utf-8")
```

```python
# 调用方在自己的项目目录里
from pkg.loader import load

load()
# 调用方项目里也有 data/info.txt 时，读到的是调用方的文件
# 调用方项目里没有这个文件时：FileNotFoundError
```

> [!tip]
>
> 调用方自己的代码里没有 `here()`。异常栈落在包内部，路径却是调用方的当前目录拼出来的，看起来像调用方把路径写错了。

包要定位自己项目里的文件时，用 `find_root`，起点传包内文件的绝对路径：

```python
from pathlib import Path

from pyprojroot import find_root, has_dir

ROOT = find_root(has_dir(".git"), start=Path(__file__).resolve())
```

> [!tip]
>
> 终端停在用户目录、并且该目录下有 `.vscode` 时，D 盘脚本里的 `here()` 会把用户目录当成根，同样不会去看脚本所在的项目。

### 两种报错

> [!tip]
>
> 根已经找到、相对路径不存在时，`here()` 默认直接返回这个路径。`warn_missing=True` 再额外发出 `UserWarning`。真正的 `FileNotFoundError` 出现在读取文件时。

```python
here("no/such.txt", warn_missing=True)
# UserWarning: Path doesn't exist: proj/no/such.txt
# proj/no/such.txt
here("no/such.txt").read_text(encoding="utf-8")
# FileNotFoundError
```

> [!tip]
>
> 从当前工作目录一直向上都对不上项目标记时，`here()` 自己抛出 `RuntimeError`，消息是 `Project root not found.` 用户目录里如果已经有 `.vscode`，从它的子目录调用会先停在用户目录，不会走到这个异常。

```python
here()
# RuntimeError: Project root not found.
```

`get_here` 只找根，并返回原因。找到时原因是 `"Pass"`。

> [!tip]
>
> 它和 `here` 一样只看当前工作目录，包里不要用。

```python
from pyprojroot.here import get_here

root, reason = get_here()
# 工作目录在 proj/src/pkg 时：root 为 proj，reason 为 'Pass'
```

## 2. find_root

起点用 `__file__` 的绝对路径。起点是文件时，从它所在目录向上找。

```python
from pathlib import Path

from pyprojroot import find_root, has_dir, has_file

ROOT = find_root(has_dir(".git"), start=Path(__file__).resolve())
# proj
data = ROOT / "src" / "pkg" / "data.csv"
# proj/src/pkg/data.csv
```

> [!tip]
>
> `start` 省略或传入相对路径时，按当前工作目录找，和 `here` 一样会跟着调用方的目录走。包里要传 `Path(__file__).resolve()`。

条件只认 `.git` 时，结果停在 `proj`。下面的工作目录是 `proj/nested/inner`。

```python
find_root(has_dir(".git"))
# proj
find_root(has_file("pyproject.toml"))
# proj
```

标记名表示这个名字存在，文件和目录都算。工作目录为 `proj`：

```python
find_root("pyproject.toml", start="src/pkg")
# proj
find_root(["pyproject.toml", ".git"], start="src/pkg")
# proj
```

> [!tip]
>
> 相对路径的 `start` 只向上走到 `.`。工作目录已经在 `src/pkg` 时，再传 `start="src/pkg"` 会失败。

```python
find_root("pyproject.toml", start="src/pkg")
# RuntimeError: Project root not found.
```

多个条件是或。工作目录为 `proj`：

```python
find_root(
    [has_file("requirements.txt"), has_dir(".git")],
    start="nested/inner",
)
# proj/nested
```

向上都没有对应标记时：

```python
find_root(has_file("missing.marker"))
# RuntimeError: Project root not found.
```

## 3. 根目录条件

> [!tip]
>
> `has_file`、`has_dir`、`matches_glob`、`as_root_criterion` 只判断传入的那一层目录，不从当前工作目录向上找根。调用方在哪个目录运行，不会改变它们的结果。

`has_file` 只认普通文件，同名目录不算。`has_dir` 只认目录，同名文件不算。

```python
from pyprojroot import find_root, has_dir, has_file

ROOT = find_root(has_dir(".git"))
# proj

has_file("pyproject.toml")(ROOT)
# True
has_file(".git")(ROOT)
# False，.git 是目录
has_dir(".git")(ROOT)
# True
has_dir("pyproject.toml")(ROOT)
# False，pyproject.toml 是文件
```

`matches_glob` 在 `pyprojroot.criterion` 里，包根没有导出。它调用 `Path.glob`，`*.toml` 只看这一层。生成器里能取出至少一项就返回 `True`。

```python
from pyprojroot import find_root, has_dir
from pyprojroot.criterion import matches_glob

ROOT = find_root(has_dir(".git"))
# proj

matches_glob("*.toml")(ROOT)
# True
matches_glob("*.Rproj")(ROOT)
# False

find_root(matches_glob("*.toml"))
# proj
```

自定义条件接收 `pathlib.Path`，返回 `bool`。示例树里从子目录调用，会停在带 `notes.txt` 的 `proj`。

```python
from pathlib import Path

from pyprojroot import find_root


def has_notes(path: Path) -> bool:
    return (path / "notes.txt").is_file()


find_root(has_notes)
# proj
```

`as_root_criterion` 把上面这些写法收成同一个判断函数。传入的已经是函数时，原样返回。传入字符串时用 `exists()`，文件和目录都算命中。传入列表时，任一项成立即可。

```python
from pyprojroot import as_root_criterion, find_root, has_dir, has_file

ROOT = find_root(has_dir(".git"))
# proj

as_root_criterion(has_dir(".git"))(ROOT)
# True
as_root_criterion("pyproject.toml")(ROOT)
# True
as_root_criterion([has_file("requirements.txt"), ".git"])(ROOT)
# True
```

`find_root` 进去之后会先调用 `as_root_criterion`。条件只使用一次时，直接传给 `find_root` 即可。同一组条件要反复用，再自己包成一个函数。

## 4. find_root_with_reason

返回 `(根路径, 原因)`。当前版本找到根时原因固定为 `"Pass"`。找不到根时同样抛 `RuntimeError`。

> [!tip]
>
> `start` 的规则和 `find_root` 相同，省略时按当前工作目录找。

```python
from pyprojroot import find_root_with_reason, has_dir

root, reason = find_root_with_reason(has_dir(".git"))
# root 为 proj，reason 为 'Pass'
```

## 5. as_start_path

`find_root` 用它整理 `start`。`None` 变成当前工作目录的绝对路径。字符串变成相对 `Path`，保持原样。

> [!tip]
>
> 相对路径的父级到 `.` 为止，所以包里要把绝对路径传给 `start`，查找才能沿着真实父目录继续往上。

```python
from pyprojroot.root import as_start_path

as_start_path(None)
# 当前工作目录的绝对路径
as_start_path("src/pkg")
# WindowsPath('src/pkg')
```
