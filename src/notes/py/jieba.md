---
title: jieba库的使用
date: 2026-09-28
order: 1
category: [教程, python库]
tag: [python]
article: true
star: true
---

用于为句子里的词语，完成分词的操作

<!-- more -->

```shell
pip install jieba
```

本文按 jieba 0.42.1 的源码核对过。下文用到 `lcut`、`cut`、`lcut_for_search`、`add_word`、`load_userdict`、`suggest_freq`、`tokenize`、`setLogLevel`、`initialize`，以及 `jieba.posseg.lcut`、`jieba.analyse.extract_tags`、`jieba.analyse.textrank`。

线上默认用精确模式。搜索索引用搜索模式把长词再切细。产品名、机构名用自定义词固定住。抽关键词、过滤名词、做高亮，都在分词结果上继续处理。

下面两句贯穿全文。第一句看精确模式、词性和关键词。第二句里有长词和新词，三种模式的差别才看得出来。

```python
text = "春天的早晨，我沿着河边慢慢走，看见柳枝轻摆，几只小鸟飞过水面，心情忽然变得很好。阳光照在草地，孩子笑着奔跑，真开心。"
biz = "他在中国科学院计算所研究机器学习算法，并负责华为鸿蒙系统在南京市长江大桥项目中的落地。如果放到post中将出错。"
```

## 1. 启动时预热词典

第一次分词会加载词典，并打出 DEBUG 日志。进程启动时先初始化，把这段耗时挪到启动阶段。

```python
import logging

import jieba

jieba.setLogLevel(logging.INFO)
jieba.initialize()
```

> [!tip]
>
> Windows 上不要调用 `jieba.enable_parallel`。并行模式只支持 POSIX 系统，调用会直接抛错。

```python
jieba.enable_parallel()
# NotImplementedError: jieba: parallel mode only supports posix system
```

## 2. 三种切分

`jieba.lcut` 返回列表，后面过滤、统计都方便。`jieba.cut` 返回生成器，逐词处理大文本时再用。

```python
jieba.lcut(text)
# 春天 / 的 / 早晨 / ， / 我 / 沿着 / 河边 / 慢慢 / 走 / ， / 看见 / 柳枝 / 轻摆 / ， / 几只 / 小鸟 / 飞过 / 水面 / ， / 心情 / 忽然 / 变得 / 很 / 好 / 。 / 阳光 / 照 / 在 / 草地 / ， / 孩子 / 笑 / 着 / 奔跑 / ， / 真 / 开心 / 。
list(jieba.cut(text)) == jieba.lcut(text)
# True
jieba.lcut(text, HMM=False)
# 「轻摆」拆成 轻 / 摆，其余与精确模式相同
jieba.lcut(text, cut_all=True)
# 在精确结果外多出 慢走、过水、过水面、光照
jieba.lcut_for_search(text)
# 与这句的精确模式相同
```

`HMM=False` 关闭新词识别，结果更稳。词典里没有的搭配会被拆开。「轻摆」在默认模式下是一个词，关掉 HMM 后变成「轻 / 摆」。

全模式会召回句子里所有可能的词，结果有冗余。「慢慢」旁边多出「慢走」，「飞过水面」旁边多出「过水」「过水面」，「阳光」旁边多出「光照」。一般不直接拿来做索引。

业务句的精确模式：

```python
jieba.lcut(biz)
# 他 / 在 / 中国科学院 / 计算所 / 研究 / 机器 / 学习 / 算法 / ， / 并 / 负责 / 华为 / 鸿蒙 / 系统 / 在 / 南京市 / 长江大桥 / 项目 / 中 / 的 / 落地 / 。 / 如果 / 放到 / post / 中将 / 出错 / 。
jieba.lcut_for_search(biz)
# 他 / 在 / 中国 / 科学 / 学院 / 科学院 / 中国科学院 / 计算 / 计算所 / 研究 / 机器 / 学习 / 算法 / ， / 并 / 负责 / 华为 / 鸿蒙 / 系统 / 在 / 南京 / 京市 / 南京市 / 长江 / 大桥 / 长江大桥 / 项目 / 中 / 的 / 落地 / 。 / 如果 / 放到 / post / 中将 / 出错 / 。
```

搜索模式在精确结果上，把长词再切成更短的词，方便倒排索引命中「科学」「大桥」这种短查询。第一句几乎没有长词，所以精确模式和搜索模式结果一样。有「中国科学院」「长江大桥」这种长词时，差别才出现。

## 3. 自定义词

词典里没有的产品名、机构名会被切开。「机器学习」变成「机器 / 学习」，「鸿蒙系统」变成「鸿蒙 / 系统」。

`add_word` 把它们固定成整词。词频给高一些，避免被旁边的字抢走。`tag` 是词性，后面过滤名词时用得上。

```python
jieba.add_word("机器学习", freq=1000, tag="n")
jieba.add_word("鸿蒙系统", freq=1000, tag="nz")
jieba.lcut(biz)
# 「机器学习」「鸿蒙系统」保持整词，其余切分不变
```

词条多的时候写成词典文件，每行是「词语 词频 词性」：

```text
机器学习 1000 n
鸿蒙系统 1000 nz
```

然后加载。效果和多次调用 `add_word` 相同。

```python
jieba.load_userdict("userdict.txt")
```

还有一种粘错。「中将」在词典里是军衔，会把「post 中将出错」切成「中将」。想强制拆开时，调高「中」「将」单独成词的概率。

```python
jieba.suggest_freq(("中", "将"), tune=True)
# 494
jieba.lcut("如果放到post中将出错。")
# 如果 / 放到 / post / 中 / 将 / 出错 / 。
```

> [!tip]
>
> `tune=True` 会改全局词典，只对确实要拆开或合并的词使用。HMM 仍可能把结果拉回去。拆开没有生效时，再对这次 `lcut` 加上 `HMM=False`。

## 4. 词性标注

`jieba.posseg.lcut` 返回带词性的对象，用 `.word` 和 `.flag` 读取。只要名词时，看 `flag` 是否以 `n` 开头。

```python
import jieba.posseg as pseg

pairs = list(pseg.lcut(text))
[item.word for item in pairs if item.flag.startswith("n")]
# ['柳枝', '小鸟', '水面', '心情', '阳光', '草地', '孩子']
```

常见标记：

| 标记 | 含义           |
| ---- | -------------- |
| n    | 名词           |
| nr   | 人名           |
| ns   | 地名           |
| nt   | 机构名         |
| nz   | 其他专名       |
| v    | 动词           |
| vn   | 名动词         |
| a    | 形容词         |
| d    | 副词           |
| m    | 数词           |
| p    | 介词           |
| x    | 标点、非语素字 |

> [!tip]
>
> 词性切分和 `jieba.lcut` 不一定相同。精确模式里「轻摆」是一个词，词性结果里是「轻/a」「摆/v」。人名、地名也会标错，「柳枝」「阳光」会被标成 `nr`。专有名词用 `add_word` 指定 `tag` 修正。

## 5. 关键词

TF-IDF 适合抽主题词。TextRank 看的是篇内词和词的关系，适合反复出现的词。TextRank 默认只在名词和动词里抽。

```python
import jieba.analyse

jieba.analyse.extract_tags(text, topK=5, withWeight=True)
# [('轻摆', 0.597738375145), ('柳枝', 0.500442867695), ('飞过', 0.460009864309), ('小鸟', 0.4472425297185), ('草地', 0.4145602928395)]
jieba.analyse.textrank(text, topK=5, withWeight=True)
# [('孩子', 1.0), ('奔跑', 0.9927709249625987), ('水面', 0.9427192481018887), ('心情', 0.9401749485643267), ('飞过', 0.7099354910324519)]
```

`allowPOS` 只在指定词性里抽，助词和标点会被丢掉：

```python
jieba.analyse.extract_tags(
    text,
    topK=5,
    withWeight=True,
    allowPOS=("n", "nr", "ns", "nz", "v", "vn"),
)
# [('柳枝', 0.8340714461583333), ('飞过', 0.7666831071816667), ('小鸟', 0.7454042161975), ('草地', 0.6909338213991667), ('奔跑', 0.6811524920325001)]
```

## 6. 进索引前的清洗

jieba 会把标点也切出来。中文停用词要自己维护，再丢掉空白和标点，留下能进索引或模型的词。

```python
STOP_WORDS = {
    "的", "了", "着", "在", "和", "与", "或", "及", "等",
    "被", "把", "从", "对", "并", "而", "就", "也", "都",
    "很", "太", "真", "我", "他", "她",
}
PUNCTUATION = set("，。！？、；：（）()[]【】《》\"'")


def keep_word(word):
    word = word.strip()
    if not word or word in PUNCTUATION or word in STOP_WORDS:
        return False
    return True


[word for word in jieba.lcut(text) if keep_word(word)]
# ['春天', '早晨', '沿着', '河边', '慢慢', '走', '看见', '柳枝', '轻摆', '几只', '小鸟', '飞过', '水面', '心情', '忽然', '变得', '好', '阳光', '照', '草地', '孩子', '笑', '奔跑', '开心']
```

搜索高亮需要词在原文里的位置。`jieba.tokenize` 给出词和字符区间，用原文切片即可高亮。

```python
for word, start, end in jieba.tokenize(text):
    if word in ("春天", "柳枝", "开心"):
        print(word, text[start:end], start, end)
# 春天 春天 0 2
# 柳枝 柳枝 17 19
# 开心 开心 55 57
```
