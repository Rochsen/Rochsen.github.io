---
title: Function Calling与MCP
date: 2026-07-04
categories: [教程, 知乎]
tags: [AI, mcp]
---

<!-- more -->

模型能读懂「2023 年 4、5、6 月一日门票的销量，按周统计」，却答不出这句话的答案。它不缺理解力，缺的是伸手去查的那只手。让模型从「会说话」走到「会做事」，中间隔着两套东西：一套是把函数交给模型的机制，另一套是把函数交给所有人的协议。

这一章沿着这条线走：先用 Function Calling 给模型装上第一只手，用一个门票助手把「模型生成 SQL、程序执行 SQL」的回路跑通；再对比 MCP 为什么不是 Function Calling 的替代品，而是它的标准化；接着用高德、Tavily、桌面文件统计器三个案例，把「用别人的 MCP」和「自己写 MCP」两条路都走一遍；最后回到工程判断：什么该写成函数，什么该写成服务。

## 1. Function Calling：把「理解」变成「动作」

### 1.1 模型本身碰不到外部世界

大模型是一个把输入映射成输出的函数。它内部没有数据库连接，没有文件系统句柄，也没有发送 HTTP 请求的能力。用户问「上个月销量环比增长多少」，模型能拆解出「需要查上月销量、再查本月销量、再算差值」，但它执行不了其中任何一步。

于是它只能退回到两种次优做法。第一种是把答案编出来，数字看着合理，来源无从查证。第二种是要求用户自己查完再贴进来，一次对话变成三次往返。

Function Calling 改变的是这个约束：模型不再直接执行，而是输出一份「调用申请」——用哪个函数、传什么参数。真正执行的是宿主程序，执行结果再作为新消息回填给模型，模型据此继续推理或组织答案。模型始终只在语言层面工作，动作由程序完成。

这条分工带来三个直接收益。能力边界被打开，模型可以查实时数据、跑复杂计算、操作外部系统；输出被结构化，自然语言请求被翻译成 `get_weather(location="北京", date="2025-05-06")` 这样确定的参数；流程可以动态决策，模型能根据上下文判断要不要调、调几次、按什么顺序调，先查天气再推荐穿搭就是链式调用。

### 1.2 一次工具调用的完整回路

把所有细节压成一条时间线，一次调用只有五个动作，其中只有第二步属于模型。

```mermaid
sequenceDiagram
    autonumber
    participant U as 用户
    participant H as 宿主程序
    participant L as 大模型
    participant T as 工具函数
    U->>H: 输入自然语言问题
    H->>L: 附带工具清单的请求
    L-->>H: 返回调用申请（函数名与参数）
    H->>T: 执行函数，传入结构化参数
    T-->>H: 返回执行结果
    H->>L: 把结果作为新消息回填
    L-->>H: 组织最终答案
    H-->>U: 展示答案
```

关键在第五步和第六步的衔接。工具返回的往往是一张表、一段 JSON、几行日志，这些原始结果并不会自动变成好看的答案，而是作为上下文的一部分交给模型，由模型决定怎么表述。所以同一个查询，提示词不同，用户看到的答案质量会差很多。

这也解释了一个常见困惑：为什么有些工具调用后，用户只看到一句「已为您查询完成」，数据却不见了。负责收尾的那段程序或提示词把结果吞掉了，模型没有被要求原样输出。

### 1.3 三个角色，三种责任

| 角色 | 负责什么 | 出错时的典型症状 |
| --- | --- | --- |
| 模型 | 判断是否需要调用、选哪个工具、填什么参数、如何表述结果 | 选错工具、参数漏字段、把结果总结掉 |
| 宿主程序 | 提供工具清单、执行调用、把结果回填、管理多轮上下文 | 工具未注册、参数解析失败、上下文串味 |
| 工具函数 | 真正干活：查库、发请求、读文件 | 连接超时、权限不足、返回格式不合约定 |

把三者的边界想清楚，很多问题就不用猜。模型说「我要调 exc_sql，参数是这段 SQL」，这段 SQL 对不对属于工具侧的职责判断，能不能看懂用户意图属于模型侧的本事，而工具有没有被注册进去、参数有没有被正确解析，则是宿主程序的活。

## 2. CASE：门票助手

案例的目标很具体：让助手回答门票业务问题，比如「2023 年 4、5、6 月一日门票、二日门票的销量，按周统计」。

数据在 MySQL 的一张 `tkt_orders` 表里，字段包括订单日期、预定用户 ID、使用人身份证号、性别、年龄、省份、SKU、商品 ID、订单 ID、销售渠道、商品状态、订单金额、商品数量。用户不会写 SQL，也不该学；模型会写 SQL，但不能连库。两者之间只差一个工具。

### 2.1 第一步：把表结构写进系统提示词

模型写 SQL 的依据只有提示词。它看不到库，看不到表，只能看到你告诉它的字段。所以系统提示词要做三件事：说清身份，说清表结构，说清业务术语。

```python
system_prompt = """我是门票助手，以下是关于门票订单表相关的字段，我可能会编写对应的SQL，对数据进行查询
-- 门票订单表
CREATE TABLE tkt_orders (
    order_time DATETIME,             -- 订单日期
    account_id INT,                  -- 预定用户ID
    gov_id VARCHAR(18),              -- 商品使用人ID（身份证号）
    gender VARCHAR(10),              -- 使用人性别
    age INT,                         -- 年龄
    province VARCHAR(30),            -- 使用人省份
    SKU VARCHAR(100),                -- 商品SKU名
    product_serial_no VARCHAR(30),   -- 商品ID
    eco_main_order_id VARCHAR(20),   -- 订单ID
    sales_channel VARCHAR(20),       -- 销售渠道
    status VARCHAR(30),              -- 商品状态
    order_value DECIMAL(10,2),       -- 订单金额
    quantity INT                     -- 商品数量
);
一日门票，对应多种SKU：
Universal Studios Beijing One-Day Dated Ticket-Standard
Universal Studios Beijing One-Day Dated Ticket-Child
Universal Studios Beijing One-Day Dated Ticket-Senior
二日门票，对应多种SKU：
USB 1.5-Day Dated Ticket Standard
USB 1.5-Day Dated Ticket Discounted
一日门票、二日门票查询
SUM(CASE WHEN SKU LIKE 'Universal Studios Beijing One-Day%' THEN quantity ELSE 0 END) AS one_day_ticket_sales,
SUM(CASE WHEN SKU LIKE 'USB%' THEN quantity ELSE 0 END) AS two_day_ticket_sales
我将回答用户关于门票相关的问题
"""
```

这段提示词里有三处容易被忽略、但直接决定成功率的细节。

第一处是**直接给建表语句**。`CREATE TABLE` 是模型读得最顺的格式，字段名、类型、注释一次对齐，比用自然语言罗列「有订单日期、有金额」可靠得多。如果企业里有原始的表元数据，直接贴进去，不要手工转写。

第二处是**把术语翻译成条件**。「一日门票」不是一个字段，而是 SKU 的一批前缀；「二日门票」对应另一批前缀。这种业务黑话如果只写「一日门票是好几种 SKU」，模型每轮都要自己猜前缀，猜错就查错数。所以提示词里直接把 `LIKE` 条件写好，等于把口径固定下来。

第三处是**禁止省略结果的约束**。在后来的版本里，提示词末尾补了一句：

```text
每当 exc_sql 工具返回 markdown 表格和图片时，你必须原样输出工具返回的全部内容
（包括图片 markdown），不要只总结表格，也不要省略图片。
```

没有这句，模型拿到表格后会「体贴地」总结成一段话，用户看到的是「一日门票销量最高的是第 18 周」，而不是他要的那张表。工具白跑了。

### 2.2 第二步：把函数注册成工具

模型不知道你的 Python 文件里有什么，除非你把它注册进去。Qwen-Agent 提供了 `BaseTool` 与 `register_tool` 两个东西，一个是父类，一个是装饰器。

```python
from qwen_agent.tools.base import BaseTool, register_tool

@register_tool('exc_sql')
class ExcSQLTool(BaseTool):
    """SQL查询工具，执行传入的SQL语句并返回结果。"""
    description = '对于生成的SQL，进行SQL查询'
    parameters = [{
        'name': 'sql_input',
        'type': 'string',
        'description': '生成的SQL语句',
        'required': True
    }]

    def call(self, params: str, **kwargs) -> str:
        import json
        args = json.loads(params)
        sql_input = args['sql_input']
        database = args.get('database', 'ubr')
        engine = create_engine(...)
        try:
            df = pd.read_sql(text(sql_input), engine)
            return df.head(10).to_markdown(index=False)
        except Exception as e:
            return f"SQL执行出错: {str(e)}"
```

四个组成部分各有用途，缺一个都会出问题：

| 组成 | 作用 | 写错会怎样 |
| --- | --- | --- |
| `@register_tool('exc_sql')` | 把类登记到名字 `exc_sql` 下，供 `function_list` 引用 | 助手初始化时报找不到工具 |
| `description` | 告诉模型「这个工具是干什么的」，是选不选它的唯一依据 | 模型不知何时该用，或该用时不调 |
| `parameters` | 告诉模型要传什么字段、什么类型、是否必填 | 模型漏传参数，或传错类型 |
| `call()` | 真正执行，返回字符串 | 返回非字符串时上下文解析失败 |

`description` 这一项值得单独说。课件里写的是「对于生成的SQL，进行SQL查询」，把「接收 SQL、返回结果」讲清楚了。它的写法直接决定工具的触发率：写成「数据库工具」这种模糊描述，模型会犹豫；写成把输入输出讲明白的一句话，模型命中率明显更高。

返回值也有讲究。`df.head(10).to_markdown(index=False)` 做了两件事：限制行数，避免一次把几千行塞进上下文；转成 Markdown 表格，模型读表格比读 JSON 顺手。如果返回 `df.to_string()`，模型能看懂，但前端渲染就很难看。

异常处理同样不能省。`except` 分支返回一句「SQL执行出错: ...」，模型看到这句会自己修正 SQL 再试一次；如果直接抛出异常，整个助手进程就挂了，用户看到的是报错堆栈。

### 2.3 第三步：用 function_list 交出工具清单

工具注册完只是登记，还没交给模型。真正的交接在 `Assistant` 初始化时完成：

```python
def init_agent_service():
    """初始化门票助手服务"""
    llm_cfg = {
        'model': 'qwen-turbo',
        'timeout': 30,
        'retry_count': 3,
    }
    bot = Assistant(
        llm=llm_cfg,
        name='门票助手',
        description='门票查询与订单分析',
        system_message=system_prompt,
        function_list=['exc_sql'],  # 只传工具名字符串
    )
    return bot
```

`function_list` 里放的是字符串 `'exc_sql'`，不是类，也不是实例。框架拿这个名字去注册表里找对应的工具类，实例化后转成模型能理解的函数描述（name、description、parameters 的 JSON Schema），随每次请求一起发出去。

这行代码是整个案例的枢纽。它说明两件事：模型侧看到的是「工具清单 + 描述」，不是代码；工具侧被约束成「输入参数 + 返回字符串」，不关心模型是谁。两边通过一份结构化的说明书对接，这才是 Function Calling 能跨模型通用的原因。
### 2.4 第四步：两种交互外壳，一份业务内核

同一个助手，课件给了两套入口。终端版就是循环读入、逐轮打印：

```python
def app_tui():
    bot = init_agent_service()
    messages = []
    while True:
        query = input('user question: ')
        file = input('file url (press enter if no file): ').strip()
        if not query:
            print('user question cannot be empty！')
            continue
        if not file:
            messages.append({'role': 'user', 'content': query})
        else:
            messages.append({'role': 'user', 'content': [{'text': query}, {'file': file}]})
        response = []
        for response in bot.run(messages):
            print('bot response:', response)
        messages.extend(response)
```

Web 版多了一步配置：把三个典型问题挂在输入框上方，用户点一下就能发起查询。

```python
def app_gui():
    bot = init_agent_service()
    chatbot_config = {
        'prompt.suggestions': [
            '2023年4、5、6月一日门票，二日门票的销量多少？帮我按照周进行统计',
            '2023年7月的不同省份的入园人数统计',
            '帮我查看2023年10月1-7日销售渠道订单金额排名',
        ]
    }
    WebUI(bot, chatbot_config=chatbot_config).run()
```

`prompt.suggestions` 看着是界面装饰，实际是**降低首次使用门槛**的产品设计。业务助手最怕用户不知道该问什么，一上来问「你能干什么」，然后就没有下文。给三个真实问题，用户点一下就看到完整链路：SQL 被生成、表被查出来、图被画出来。这比写十段介绍有用。

两套外壳都调用同一个 `init_agent_service()`，业务逻辑（提示词、工具、模型配置）只写一遍。这个结构在后续接 IM、接 HTTP 接口时同样成立：换外壳不换内核。

### 2.5 第二版：把查询和画图合成一次调用

第一版跑通后，用户看到的是一张 Markdown 表格。表格能读，但看趋势很费劲，尤其「按周统计」这种天然适合画柱状图的查询。

课件里给了两条路，并当场否掉了第一条：

| 方案 | 做法 | 问题 |
| --- | --- | --- |
| 方法 1 | 新增 `plot_data` 工具，模型把表格当参数传进去 | Markdown 传参体积大；x、y 轴字段要求模型自己判断，容易传错；绘图前还得把 Markdown 解析回 DataFrame |
| 方法 2 | 在 `exc_sql` 内部顺手画图，返回「表格 + 图片」 | 工具职责变重，但对模型只暴露一个工具，调用次数减半 |

方法 1 的失败点不在代码，在**上下文**。qwen-agent 的每次工具调用是独立的，`exc_sql` 查出来的 DataFrame 在工具返回那一刻就结束了，想让 `plot_data` 复用，只能把数据塞进参数里再传一遍，或者让框架缓存中间态。前者把几 KB 的表格塞进一次函数调用参数，后者要为不同用户实例维护缓存，多用户场景下很容易串数据。

所以采用方法 2，让 `exc_sql` 一次干完两件事。核心改动只有四处，按数据流排序：

```python
# Step1 查出数据，同时留一份 DataFrame
df = pd.read_sql(text(sql_input), engine)
md = df.head(10).to_markdown(index=False)

# Step2 自动推断坐标轴：字符串列当 x，数值列全部当 y
x_candidates = df.select_dtypes(include=['object']).columns.tolist()
if not x_candidates:
    x_candidates = df.columns.tolist()
x = x_candidates[0]
y_fields = df.select_dtypes(include=['number']).columns.tolist()

# Step3 按 y 的个数决定柱宽，多系列时并列排布
plt.figure(figsize=(8, 5))
bar_width = 0.35 if len(y_fields) > 1 else 0.6
for idx, y_col in enumerate(y_fields):
    plt.bar([p + idx * bar_width for p in range(len(df))], df[y_col],
            width=bar_width, label=y_col)

# Step4 存图，返回「表格 + 图片引用」
save_dir = os.path.join(os.path.dirname(__file__), 'image_show')
os.makedirs(save_dir, exist_ok=True)
filename = f'bar_{int(time.time() * 1000)}.png'
plt.savefig(os.path.join(save_dir, filename))
plt.close()
img_md = f'![柱状图](image_show/{filename})'
return f"{md}\n\n{img_md}"
```

几个细节值得单独拎出来：

**列类型推断比字段名猜测可靠。** `select_dtypes(include=['object'])` 拿到的是字符串列，通常是日期、省份、渠道这类分类维度；`include=['number']` 拿到的是销量、金额这类度量。用类型判断代替「猜哪个列名像时间」，代码不用为每张表改一次。

**柱宽随系列数变化。** 只有一个数值列时柱宽 0.6，多个数值列时压到 0.35 并依次错位，避免重叠。这是排版问题，但直接决定图能不能看懂。

**图片路径要相对。** 存的是绝对路径，返回给前端的却是 `image_show/xxx.png`。前端服务以脚本所在目录为根，绝对路径在浏览器里加载不出来。

**文件名用时间戳。** 同一秒内两次查询会覆盖，`int(time.time() * 1000)` 把冲突概率压到可以忽略。生产环境更稳的做法是用 UUID 或查询哈希。

### 2.6 第三版：多类别维度下的透视与堆叠

第二版跑起来后，用户立刻提出了下一个需求：**「我看到第 13 周数据有异常，按天、渠道的维度统计，给我它们的表现。」**

这句话里有两个维度——天和渠道——再加一个度量（销量）。第二版的画法会出问题：它只把第一个字符串列当 x，其余数值列当 y，渠道这一列要么被丢掉，要么被误当成数值处理，图上看不到渠道。

课件里先踩了一个坑，值得记下来。模型第一次生成的 SQL 是这样的：

```sql
WHERE order_time BETWEEN '2023-04-01' AND '2023-06-30'
  AND DATE_FORMAT(order_time, '%Y-%U') = '2023-13'
```

查询区间是 4 月到 6 月，却筛「第 13 周」。按 ISO 周的计算，2023 年第 13 周落在 3 月 27 日到 4 月 2 日，其中大部分日期在查询区间之外，数据自然不对。用户补充了具体日期范围后，查询才正确。

这个细节说明一件事：**模型会算错日期边界，而错误不会报错，只会返回偏小的数字。** 涉及周、月、季度的统计，提示词里最好把口径写死（用 `DATE_FORMAT` 还是 `WEEK()`，周一还是周日算起点），否则每次都要靠人眼核对。

数据对了之后，问题回到可视化：多个类别维度怎么画。第三版的解法是先透视，再堆叠：

```python
def generate_chart_png(df_sql, save_path):
    columns = df_sql.columns
    # 第一个字符串列当 x 轴，其余的字符串列当分组维度
    object_columns = df_sql.select_dtypes(include='O').columns.tolist()
    if columns[0] in object_columns:
        object_columns.remove(columns[0])
    num_columns = df_sql.select_dtypes(exclude='O').columns.tolist()

    if len(object_columns) > 0:
        # 透视：x 轴为索引，类别列为列，数值列聚合
        pivot_df = df_sql.pivot_table(index=columns[0], columns=object_columns,
                                      values=num_columns, fill_value=0)
        fig, ax = plt.subplots(figsize=(10, 6))
        bottoms = None
        for col in pivot_df.columns:
            ax.bar(pivot_df.index, pivot_df[col], bottom=bottoms, label=str(col))
            bottoms = pivot_df[col].copy() if bottoms is None else bottoms + pivot_df[col]
    else:
        # 没有额外类别列，按列堆叠即可
        bottom = np.zeros(len(df_sql))
        for column in columns[1:]:
            plt.bar(range(len(df_sql)), df_sql[column], bottom=bottom, label=str(column))
            bottom += df_sql[column]
```

`pivot_table` 是关键的一步：它把「天 × 渠道 × 销量」的长表转成「行是天、列是渠道」的宽表，每个渠道变成一组柱子，堆叠起来既能看到每天的总量，也能看到渠道构成。这正是用户说「给我它们的表现」时想要的东西。

这段代码还有两处是被 bug 逼出来的，属于「不写就一定踩」的类型：

```python
# 中文字体：不设就会显示成方块
plt.rcParams['font.sans-serif'] = ['SimHei', 'Microsoft YaHei', 'SimSun']
plt.rcParams['axes.unicode_minus'] = False

# 标签里的 % 和 {} 会被当成格式符，必须转义
safe_label = str(col).replace('%', '%%').replace('{', '{{').replace('}', '}}')
```

第一处是 Windows 上 matplotlib 的默认字体不含中文，标题和轴标签会变成一排方框。第二处更隐蔽：渠道名里带 `%` 时，`plt.legend()` 内部格式化会抛 `ValueError`，而报错信息里只说「unsupported format character」，看不出是标签的问题。转义之后才稳。

### 2.7 三版对照

三版代码递进关系清楚，每一版只解决前一版暴露的一个问题：

| 版本 | 新增能力 | 触发它的用户反馈 | 关键代码 |
| --- | --- | --- | --- |
| `assistant_ticket_bot-1` | 跑通 Function Calling，模型生成 SQL、工具执行、返回表格 | 初始需求 | `@register_tool('exc_sql')` + `function_list=['exc_sql']` |
| `assistant_ticket_bot-2` | 查询后自动出图，一次调用返回表格 + 柱状图 | 「有表没图，看不出趋势」 | `select_dtypes` 推断坐标轴、时间戳文件名 |
| `assistant_ticket_bot-3` | 支持多类别维度，透视后堆叠柱状图 | 「第 13 周异常，按天和渠道看」 | `pivot_table` + `bottom` 累加 + 标签转义 |

值得注意的是，三版都没有改动 `Assistant` 的初始化参数结构，也没有改动 `function_list` 的写法。所有演进都发生在工具内部——这说明 Function Calling 的扩展点很干净：想让模型多做一件事，改工具实现或加一个工具，不用调整对话协议。

课件留了一道练习题，用同一份代码结构换业务数据：某月销量、环比增长、分省销售额、某时间段销售额 Top3 渠道。四个问题从单维度到多维度递进，正好对应三版代码覆盖的能力范围。练完这四个，基本就能判断手上的业务问题该用哪一版的结构。

## 3. MCP：把函数从「我的程序」里搬出来

门票助手已经能用了。问题出现在它要给别人用的时候。

### 3.1 私有接口的三重限制

第一重是**客户端的限制**。Function Calling 的调用发生在宿主程序里，业务系统要接入，就得在业务系统里重写一遍 `init_agent_service`：换模型要改，换框架要改，工具的实现还得跟着搬。同一份「查门票销量」的能力，给网页版写一遍、给 IM 写一遍、给桌面端写一遍。

第二重是**模型的限制**。不同厂商的函数描述格式有差异，`parameters` 的 JSON Schema 写法、参数顺序、是否支持并行调用，各家都有自己的约定。想换模型，工具定义跟着改。

第三重是**复用的限制**。工具函数长在某个 Python 文件里，依赖那个项目的虚拟环境、配置文件、数据库连接串。别的团队想用，只能复制代码，复制完各自演化，出问题各修各的。

MCP（Model Context Protocol）解决的就是这三重限制。它是 Anthropic 在 2024 年 11 月发布的一套开放协议，用来标准化「模型与外部数据源、工具、服务之间怎么交互」。课件里给了一个很贴切的类比：**AI 领域的 USB-C 接口**。

这个类比的准确之处在于，它规定的不是「有哪些设备」，而是「插头和插座长什么样」。工具仍然要有人写，数据仍然要有人连，但写完之后只要符合协议，就能被任何支持该协议的客户端使用。

### 3.2 Function Calling 与 MCP 的差别

课件在不同页给了两张对比表，合起来看更完整。

先看定位与工程成本：

| 维度 | Function Calling | MCP |
| --- | --- | --- |
| 定位 | 模型厂商的私有接口，如 OpenAI、Qwen | 开放协议，类似 HTTP、USB-C |
| 扩展性 | 每个模型单独适配 | 一次开发，多模型兼容 |
| 复杂性 | 适合简单、单次调用任务 | 支持多轮对话与复杂上下文管理 |
| 生态依赖 | 依赖特定模型 | 跨模型、跨平台，如 Claude、Cursor |
| 安全性 | 依赖云端 API 密钥 | 支持本地化数据控制 |

再看性质与适用范围：

| 类别 | Function Calling | MCP |
| --- | --- | --- |
| 性质 | 功能 | 协议 |
| 范围 | 特定场景，单一数据源或功能 | 通用，多数据源、多功能 |
| 目标 | 扩展模型能力 | 统一接口，实现互操作 |
| 实现 | 依赖特定模型的实现 | 基于标准协议 |
| 开发复杂度 | 高，每个任务单独开发函数 | 低，统一协议实现多源兼容 |
| 复用性 | 低，函数为特定任务设计 | 高，一次开发多场景使用 |
| 灵活性 | 低，扩展需额外开发 | 高，支持动态适配 |
| 常见场景 | 天气查询、商品推荐 | 跨平台数据访问与整合 |

两张表说的是同一件事的两个面：Function Calling 是**能力**，MCP 是**接口标准**。能力必须有，标准决定能力能否流通。

### 3.3 已经有了 MCP，还需要 Function Calling 吗

会。课件给了一个很干脆的判断：**简单、原子化的任务，用 Function Calling 更方便。**

```python
get_weather(city="北京")
calculate(expression="3+5")
send_email(to="user@example.com")
```

这三个例子的共同点是：只有一个调用、一个数据源、没有跨进程边界。为它们搭一个 MCP Server，要起进程、管生命周期、处理传输层，收益抵不过成本。而 Function Calling 只要写个函数、注册一下，模型就能用。

两个优势也很实际。开发快捷，不必配置独立的 Server；延迟低，单次请求-响应，没有协议层的握手与转发开销。

课件的结论是「MCP 可能成为主流，但 Function Calling 作为底层能力仍将存在」。这句话可以再往前推一步：MCP 本身也建立在工具调用的语义之上——Server 暴露的工具，最终还是要转成函数描述交给模型。两者不是替代关系，而是分层关系。

```mermaid
flowchart TD
    L["大模型"] -->|"生成调用申请"| H["宿主程序 / MCP Client"]
    H -->|"进程内直接调用"| F["本地函数<br/>Function Calling"]
    H -->|"协议调用"| S["MCP Server<br/>独立进程或远端"]
    S --> D["数据库 · 文件 · 第三方 API"]
    F --> D
```
## 4. MCP 的核心概念

协议要落地，得先有三样东西：谁发起、谁提供、怎么连。MCP 把这三件事分别定义成 Host、Server 和 Transport。

### 4.1 三个角色

```mermaid
flowchart LR
    subgraph HOST["MCP Host（宿主环境）"]
        L["大模型"]
        C["MCP Client"]
    end
    C -->|"Transport<br/>stdio 或 HTTP+SSE"| S1["MCP Server：高德地图"]
    C --> S2["MCP Server：Tavily 搜索"]
    C --> S3["MCP Server：桌面文件统计"]
    S1 --> A1["地图 API"]
    S2 --> A2["搜索 API"]
    S3 --> A3["本地文件系统"]
```

- **MCP Host**：运行模型的宿主环境，比如 Claude Desktop、Cursor IDE、Cherry Studio，也包括你自己用 Qwen-Agent 写的那个 Web 助手。
- **MCP Client**：嵌在 Host 里的组件，负责把工具清单收上来、把调用请求发出去、把结果接回来。一个 Host 里可以有多个 Client，每个 Client 连一个 Server。
- **MCP Server**：提供具体能力的轻量服务，可以是一个本地 Python 进程，也可以是部署在远端的 HTTP 服务。

一个容易混淆的点：Host 和 Client 不是一回事。Host 是「用户看到的那个应用」，Client 是「应用内部负责讲协议的那部分」。用户装一个 MCP，实际上是在 Host 的配置里加了一条 Server 记录，Host 启动时按这条记录拉起 Client 去连接。

### 4.2 三种能力

MCP Server 不只暴露函数，它提供三类东西：

| 能力 | 是什么 | 典型用途 | 谁来触发 |
| --- | --- | --- | --- |
| Resources | 结构化数据，喂给模型扩充上下文 | 数据库表结构、文档库、配置文件 | 用户或客户端按需读取 |
| Tools | 可执行的函数，带参数与返回值 | 查库、发邮件、调用第三方 API | 模型自动决定是否调用 |
| Prompts | 预定义的提示模板 | 固定的分析流程、报告格式 | 用户主动选择 |

三者的区别可以这样理解：Resources 是「给你的资料」，Tools 是「给你的手」，Prompts 是「给你的模板」。桌面 TXT 统计器那两个函数属于 Tools，因为它要执行动作、返回结果；如果改成把桌面上所有 txt 的目录清单一次性提供给模型，那就是 Resources。

理解了这一点，封装时的取舍就清楚了：**需要模型判断时机和参数的，做成 Tool；只是补充背景知识的，做成 Resource。** 把两者混在一起，模型会频繁调用本来可以直接喂给它的东西，白白增加往返次数。

### 4.3 两种传输方式

Client 和 Server 之间怎么说话，MCP 定义了两种主流方式。

**stdio（标准输入输出）**：Host 用命令行把 Server 拉起来，双方通过子进程的标准输入输出交换消息。

```json
{
  "mcpServers": {
    "txt-counter": {
      "command": "python",
      "args": ["txt_counter.py"]
    }
  }
}
```

`command` 是可执行程序，`args` 是参数，启动后双方用 JSON-RPC 一行一行地收发。这种方式的优点是简单、没有端口、没有网络配置；缺点是 Server 必须跑在 Host 同一台机器上，而且一个 Server 对应一个进程。

**HTTP + SSE**：Server 独立部署，通过 HTTP 提供接口，用 SSE（Server-Sent Events）把结果流式推回来。

```mermaid
sequenceDiagram
    participant C as MCP Client
    participant S as MCP Server（HTTP）
    C->>S: POST 初始化请求
    S-->>C: 返回 session 与能力清单
    C->>S: POST 调用工具（携带 session）
    S-->>C: SSE 流式返回结果
```

这里有一个常见的误解值得澄清：SSE 是**单向**的，服务端推、客户端收。它不像 WebSocket 那样双向实时。MCP 用 SSE 承载消息流，是因为「一问一答、结果可能较长」这个场景用单向流就够，而且穿防火墙比 WebSocket 更省心。

| 维度 | stdio | HTTP + SSE |
| --- | --- | --- |
| 部署位置 | 必须与 Host 同机 | 可独立部署、可远端 |
| 进程管理 | Host 负责拉起与回收 | Server 自行管理 |
| 网络配置 | 无需端口 | 需要地址、端口、鉴权 |
| 适用场景 | 本地文件、本地工具、单机开发 | 团队共享、跨机器、需要权限控制 |
| 典型问题 | 打包与环境依赖 | 密钥、限流、超时 |

课程里的三个示例都是本地 stdio，这是教学场景的自然选择：不用管服务器、不用配网络，改一行代码立刻见效。但生产环境里，SSE 那种「服务在别人机器上、我只拿结果」的形态更常见——下一节会看到，它带来的不只是便利，还有新的边界问题。

### 4.4 进程边界就是数据边界

这是整章最值得记住的一句话：**MCP 的 Server 进程跑在哪台机器上，它就能看到哪台机器的数据。**

本地 stdio 的 TXT 统计器，读到的是你这台电脑桌面的文件。把它部署到公司服务器上，同一个工具读到的就是服务器桌面的文件——而服务器通常没有「桌面」这个目录，工具会直接返回零。

```mermaid
flowchart TD
    subgraph LOCAL["本机：stdio 模式"]
        A1["MCP Client"] --> B1["MCP Server 进程<br/>运行在你的电脑"]
        B1 --> C1["你的桌面文件"]
    end
    subgraph REMOTE["服务器：HTTP+SSE 模式"]
        A2["MCP Client"] --> B2["MCP Server 进程<br/>运行在机房"]
        B2 --> C2["服务器的文件系统"]
    end
```

这条边界决定了两类完全不同的设计：

如果目标是「让模型访问用户自己的电脑」，MCP Server 必须装在用户本机，用 stdio 启动。这类工具读本地文档、看本地截图、整理下载目录，天然属于个人侧。

如果目标是「让模型访问公司的业务数据」，Server 应该部署在业务侧，通过 HTTP 暴露，统一鉴权、统一审计。这类工具查数据库、调内部 API、读共享盘，绝不能装在个人电脑上。

把这条边界搞混，会出现两种事故。一种是以为在查公司数据，其实在查自己电脑上的空目录；另一种更严重——把带数据库连接串的 Server 装到了员工电脑上，等于把库的连接方式散播出去了。

## 5. CASE：旅游攻略 MCP（用别人的服务）

第一个 MCP 案例不写代码，全程配置。它回答的问题是：现成的 MCP 服务怎么用起来。

### 5.1 先拿服务的钥匙

高德地图提供了官方的 MCP Server，但它需要 API Key 才能调。获取流程三步：

1. 打开高德开放平台 `https://lbs.amap.com/`，注册成为开发者；
2. 进入控制台创建应用，服务平台选择「Web 服务」；
3. 拿到该应用的 API Key。

「Web 服务」这个选项容易选错。高德的应用分 Web 端、Android、iOS 等几种，MCP Server 走的是服务端接口，必须选 Web 服务，拿到的 Key 才能被 `@amap/amap-maps-mcp-server` 使用。

### 5.2 在三个客户端里配同一条记录

MCP 的通用性在这里体现得很直接：同一段配置，粘到不同客户端里都能用。

**Cursor**：编辑 `mcp.json`，然后在设置里打开该服务。

```json
{
  "mcpServers": {
    "amap-maps": {
      "command": "npx",
      "args": ["-y", "@amap/amap-maps-mcp-server"],
      "env": {
        "AMAP_MAPS_API_KEY": "你的key"
      }
    }
  }
}
```

**GitHub Copilot**：打开 VS Code 设置，搜索 mcp，选择 `Edit in settings.json`，把同样的 `mcpServers` 段落粘进去。

**Cherry Studio**：图形化操作，搜索 `@amap`，找到高德地图相关的服务直接添加。它需要先装好 UV 和 Bun 两个运行时：

```bash
powershell -c "irm bun.sh/install.ps1|iex"
powershell -ExecutionPolicy Bypass -c "irm https://github.com/astral-sh/uv/releases/download/0.6.17/uv-installer.ps1 | iex"
```

配置完成后有个细节要注意：Cherry Studio 里要先点保存，再打开服务开关，开关变绿才说明连接成功。很多人配完直接提问，界面没有任何反应，其实是服务根本没启动。

还有一个前提容易被跳过：**模型必须支持工具调用**。Cherry Studio 里如果选了一个不支持 Function Calling 的模型，即使 MCP 连上了，模型也不会去调。课件里专门提了这点，用的是 qwen-turbo。

### 5.3 用提示词把「服务」变成「产物」

配好 MCP 之后，第一反应通常是问一句「用高德 MCP，做上海一天旅游攻略」。能出结果，但格式随机：有时是段落，有时是列表，有时干脆是一段广告语。

课件的做法是先把「产物规格」写成一个文件 `旅行规划.md`，再让模型按这个规格产出：

```text
你是一位优秀的平面设计师和前端开发工程师……现在需要为我创建一个 A4 纸张大小的旅行规划表，
适合打印出来随身携带使用。请使用 HTML、CSS 和 JavaScript 代码实现以下要求：
- 严格符合 A4 纸尺寸（210mm×297mm），比例为 1:1.414
- 采用单页设计，所有重要信息必须在一页内完整呈现
- 使用图标和颜色编码区分不同类型的活动（景点、餐饮、交通等）
- 为景点和活动设计简洁的时间轴或表格布局
- 提供专用的打印按钮，优化打印样式
```

然后一句 `@旅行规划.md 根据这个，生成大连一日游的网页`。

这一步的作用是把两件事分开：MCP 负责「有哪些景点、地址、门票、营业时间」，提示词负责「这些信息怎么排」。前者需要实时数据，后者是设计规格。两者混在一句话里，模型会顾此失彼。

### 5.4 课件的实际输出

在 GitHub Copilot 里用高德 MCP 提问「用高德 MCP，做上海一天旅游攻略」，得到的行程是这样的：

```text
上午行程：上海豫园 + 城隍庙区域
08:30 - 11:30 上海豫园
  地址：福佑路168号    门票：40元
  开放时间：09:00-16:30（16:00停止入场）
  亮点：明代古典园林，有九曲桥、湖心亭、玉玲珑，建议游览 2-3 小时

中午：前往陆家嘴区域
11:30 - 12:30 午餐（豫园周边上海本地特色美食）
  午餐后乘地铁 10 号线，豫园站上车，陆家嘴站下车

下午行程：东方明珠 + 陆家嘴金融区
13:00 - 16:00 东方明珠广播电视塔
  地址：世纪大道1号（陆家嘴地铁站1号口步行约220米）
  门票：80元
  开放时间：09:00-21:00（最晚入场20:30）
  等级：AAAAA级旅游景区
16:00 - 17:30 陆家嘴金融区漫步，隔江看外滩
```

这份输出里，地址、门票、营业时间、地铁线路都是实时查来的，模型原本不可能知道「豫园门票 40 元」这种会变的信息。而行程怎么排、几点到几点、上午下午如何分配，是模型自己组织的能力。

两类信息合在一起，用户拿到的才是可以直接照着走的东西。这也是 MCP 最直观的价值：它让模型的回答里出现了「它本来无法知道的事实」。

值得留一句提醒：门票价格与营业时间属于会变的数据，MCP 返回的是查询当天的结果。做行程规划类产品时，页面上的这类字段最好标注数据时间，否则用户按旧价格做预算就会出错。
## 6. CASE：Tavily 搜索 MCP（把互联网接进来）

高德案例解决的是「查一个特定领域」。Tavily 解决的是「查一个开放问题」：搜新闻、搜文章、把网页正文抓下来。

### 6.1 配置

Tavily 在 ModelScope 的 MCP 广场上有托管条目，配置同样是一段 JSON：

```json
{
  "mcpServers": {
    "tavily-mcp": {
      "command": "npx",
      "args": ["-y", "tavily-mcp@0.1.4"],
      "autoApprove": [],
      "disabled": false,
      "env": {
        "TAVILY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

`autoApprove` 是个容易被忽略的字段。它是「自动批准的工具白名单」，留空表示每次调用都要人工确认。搜索类工具读的是公开网页，风险低，很多场景会把它设成自动执行；但涉及写操作的工具——发邮件、删文件、下单——绝不能自动批准。

### 6.2 两个工具，六个参数

Tavily 的 MCP Server 主要暴露两个工具，课件把它们的能力边界列得很清楚。

`tavily-search` 负责搜索：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `query` | 字符串 | 是 | 搜索关键词 |
| `max_results` | 整数 | 否 | 返回条数，默认 3-10 |
| `search_depth` | 枚举 | 否 | `basic` / `advanced`，后者会抓取并总结页面正文 |
| `include_domains` / `exclude_domains` | 数组 | 否 | 限定或排除域名 |
| `time_range` | 字符串 | 否 | 时间过滤，如 `day`、`week`、`month` |
| `include_answer` | 布尔 | 否 | 是否直接返回答案 |
| `include_raw_content` | 布尔 | 否 | 是否携带原始 HTML |

`tavily-extract` 负责取正文：

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `urls` | 字符串或数组 | 是 | 要提取的页面地址 |
| `extract_depth` | 枚举 | 否 | `basic` / `advanced`，后者解析更细并过滤噪音 |
| `format` | 枚举 | 否 | `text` / `markdown` / `json`，默认 `text` |
| `include_images` | 布尔 | 否 | 是否同时提取图片链接 |

这两个参数的组合决定了用法。只想看看有没有这回事，`search_depth=basic` 就够，快且省；要写一份带细节的综述，`search_depth=advanced` 加 `include_raw_content=true`，一次把正文拿全。抓已知道 URL 的正文，直接上 `extract`，比先搜再点更省。

`format=markdown` 这一项对博客、文档类场景特别有用：返回的正文已经带标题层级和链接，不用再做 HTML 清洗。

### 6.3 在 Qwen-Agent 里接入

客户端里试完，真正的集成发生在代码里。Qwen-Agent 的 `function_list` 允许直接放一个 MCP 配置字典：

```python
tools = [{
    "mcpServers": {
        "tavily-mcp": {
            "command": "npx",
            "args": ["-y", "tavily-mcp@0.1.4"],
            "env": {
                "TAVILY_API_KEY": os.getenv('TAVILY_API_KEY', 'your-api-key-here')
            }
        }
    }
}]

bot = Assistant(
    llm=llm_cfg,
    name='搜索助手',
    description='网络搜索与信息检索',
    system_message=system,
    function_list=tools,
)
```

这里出现了本章最重要的一个对照：`function_list=['exc_sql']` 是**本地函数**的写法，`function_list=[{"mcpServers": {...}}]` 是**协议服务**的写法。同一个参数位置，两种来源，模型看到的都是「一组可调用的工具」。

这个设计的价值在于迁移成本。门票助手想把查询能力换成别人提供的 MCP，只要把 `'exc_sql'` 换成一段 MCP 配置，提示词和交互层都不用动。反过来说，如果一开始就把所有能力都写成 MCP，本地那些简单工具反而要背进程和协议的负担。

课件里配了三个建议提示词做演示：

```python
chatbot_config = {
    'prompt.suggestions': [
        '查找黄金相关的新闻',
        '搜索最新的AI技术发展趋势',
        '查找2026年经济预测相关文章',
    ]
}
```

问「帮我搜索一下关于 AI 的最新新闻」，模型会自己调 `tavily-search`，把标题和摘要带回来。接着追问「这篇文章的详细内容」并给出 URL，模型会切到 `tavily-extract`，把正文抓下来再总结。

第二次调用能不能成功，取决于上下文里留没留下那个 URL。这也是 MCP 相比纯函数调用的一个隐含优势：Server 返回的结果结构相对稳定（标题、链接、摘要的固定字段），模型更容易在后续轮次里引用它。

## 7. CASE：桌面 TXT 统计器（自己写一个 MCP Server）

前两个案例都是「用别人的」。这个案例从零写一个 Server，把「自己写」这件事的成本看清楚。

目标很小：统计桌面上 `.txt` 文件的数量，并列出文件名。小到不值得写，但正好够看清一个 MCP Server 的最小结构。

### 7.1 三个动作起一个服务

Python 的 MCP SDK 里有一个轻量框架 FastMCP，一个 Server 只需要三件东西：

```python
import os
from pathlib import Path
from mcp.server.fastmcp import FastMCP

# 1. 创建 Server
mcp = FastMCP("桌面 TXT 文件统计器")

# 2. 注册工具
@mcp.tool()
def count_desktop_txt_files() -> int:
    """统计桌面上 .txt 文件的数量"""
    desktop_path = Path(os.path.expanduser("~/Desktop"))
    txt_files = list(desktop_path.glob("*.txt"))
    return len(txt_files)

# 3. 启动
if __name__ == "__main__":
    mcp.run()
```

三个动作对应三个问题：这个服务叫什么（`FastMCP("名字")`）、它能干什么（`@mcp.tool()`）、怎么跑起来（`mcp.run()`）。

对比一下 Function Calling 的工具注册，差别在「谁看见」。`@register_tool('exc_sql')` 是把类登记到当前进程的注册表，只有这个 Python 进程知道；`@mcp.tool()` 是把函数登记到 Server 的能力清单，任何连上来的 Client 都能看到并调用。

函数签名也承担了职责。`count_desktop_txt_files() -> int` 没有参数、返回整数，模型据此知道「这个工具不需要传参，结果是个数字」。第二个工具更复杂：

```python
@mcp.tool()
def read_txt_file(filename: str) -> str:
    """读取指定txt文件的内容

    Args:
        filename: txt文件的名称（例如：test.txt）

    Returns:
        文件内容，如果文件不存在则返回错误信息
    """
    desktop_path = Path(os.path.expanduser("~/Desktop"))
    file_path = desktop_path / filename

    if not file_path.exists():
        return f"错误：文件 '{filename}' 不存在于桌面上。"
    if file_path.suffix.lower() != '.txt':
        return f"错误：文件 '{filename}' 不是txt文件。"

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return f"文件 '{filename}' 的内容：\n\n{content}"
```

这个函数有参数、有类型标注、有文档字符串。**MCP 的 Client 就是靠这些信息生成工具描述的**：参数名 `filename`、类型 `str`、说明在 Args 里。文档字符串写得含糊，模型就不知道该传文件名还是完整路径。

代码里还有两处防御值得注意。`suffix.lower() != '.txt'` 拦住了「用这个工具读任意文件」的可能；`exists()` 判断让错误以字符串返回而不是抛异常。第一处是安全边界，第二处是体验边界——异常会让整个 Server 崩，字符串能让模型自己纠正。

课件里贴的是两函数版本，实际文件还多了 `read_txt_file`，说明这个例子在课上被扩展过。扩展方向很自然：从「数文件」到「读文件」，工具的能力边界随之变宽，安全约束也就必须跟着补。

### 7.2 用 Inspector 先验收，再接模型

Server 写完不要急着塞给模型。先单独验证它能跑，问题才好定位。SDK 自带的调试方式是：

```bash
mcp dev txt_counter.py
```

它会拉起 MCP Inspector，浏览器打开 `http://localhost:5173/`。接下来的操作在课件里有完整记录：

1. 点击 Connect 连接本地 Server；
2. 选择 Tools，点 `count_desktop_txt_files`；
3. 点 Run Tool，得到结果 `2`；
4. 换 `list_desktop_txt_files` 再跑，得到文件名列表。

课件截图里那个真实的返回是这样的：

```text
在桌面上找到 2 个 .txt 文件：
- 111.txt
- 新建文本文档.txt
```

Inspector 的价值不只是「能调通」。它提供三样东西：连接管理（可以切 stdio 或 HTTP+SSE，可以传环境变量和启动参数）、服务浏览（Tools、Resources、Prompts 分门别类列出来）、执行历史（每次调用的请求与响应都留档）。

最后一项在排错时最有用。模型调了工具但结果不对，第一步永远是看 History 里实际发了什么参数、Server 返回了什么。没有这个记录，只能靠猜。

### 7.3 让 Agent 消费这个服务

验收通过，再交给模型。Qwen-Agent 里的写法和 Tavily 案例一致：

```python
tools = [{
    "mcpServers": {
        "txt-counter": {
            "command": "python",
            "args": ["txt_counter.py"],
            "port": 6277
        }
    }
}]

bot = Assistant(
    llm=llm_cfg,
    name='文本计数助手',
    description='文本统计与分析',
    system_message=system,
    function_list=tools,
)
```

`command` 写 `python`，`args` 写脚本名，Host 会用当前进程的解释器把脚本拉起来。这里有个隐性依赖：**`python` 必须能找到 `mcp` 这个包**。如果脚本跑在另一个虚拟环境里，Host 拉起来的进程会因为 `ModuleNotFoundError` 直接退出，而错误信息只在子进程日志里，界面上只表现为「工具不可用」。

更稳的写法是用 `sys.executable`：

```python
import sys

"command": sys.executable,      # 与宿主同一个解释器，环境必然一致
"args": [server_script],        # 用绝对路径，避免工作目录不同
```

这两行解决的是同一个问题：**子进程的环境与父进程不一定相同**。用 `sys.executable` 保证解释器一致，用绝对路径保证脚本能被找到。本地开发时这两处最容易被忽略，因为恰好都在同一个目录、同一个环境里跑得通。

### 7.4 stdio 还是 HTTP+SSE

课件的三个示例都用 stdio。但真实项目里要选，判断标准其实只有一条：**Server 和 Client 是不是同一台机器、同一个人用。**

| 场景 | 选择 | 理由 |
| --- | --- | --- |
| 读写用户本地文件 | stdio | 数据就在本机，不需要也不应该出网 |
| 个人开发调试 | stdio | 无端口、无鉴权、改完即生效 |
| 团队共用一个工具 | HTTP+SSE | 一次部署，多人使用，集中升级 |
| 接入内部业务系统 | HTTP+SSE | 需要统一鉴权、审计、限流 |
| 给外部合作方调用 | HTTP+SSE | 要能发 Key、能撤销、能看用量 |

想把本地 MCP Server 开放给别人用，最直接的问题就是「没有地方配 Key」。stdio 模式没有身份概念，因为它默认「能启动这个进程的人就是使用者」。一旦走 HTTP，就必须自己实现鉴权：把 token 放在请求头里，Server 侧校验，这套逻辑要自己写。

这也是为什么 ModelScope 上有一个 MCP 广场——它解决的不只是「去哪儿找 Server」，还有「谁来管 Key 和配额」。

### 7.5 用 UV 管运行环境

课程最后提到 UV。它的作用是把「启动脚本」和「准备环境」合并成一步：

```json
{
  "mcpServers": {
    "example-server": {
      "name": "example-server",
      "type": "stdio",
      "command": "uv",
      "args": ["--directory", "/path/to/your/project", "run", "main.py"]
    }
  }
}
```

`--directory` 指定项目目录，`run` 会按该目录的 `pyproject.toml` 准备依赖再执行。相比 `python main.py`，它多做了两件事：进到正确的工作目录、保证依赖版本一致。

对本地 MCP Server 来说，这两件事恰好是最常见的失败原因。工作目录不对，相对路径全错；依赖不一致，`ModuleNotFoundError`。UV 把这两个坑一起填了，代价是用户机器上得先装 UV——Cherry Studio 案例里装的 Bun 和 UV 就是为这个准备的。

## 8. 什么时候写函数，什么时候写服务

三个案例走完，判断标准可以收敛成一张表。

### 8.1 选型

| 判断维度 | 留在 Function Calling | 做成 MCP Server |
| --- | --- | --- |
| 调用范围 | 只服务当前这个助手 | 多个助手、多个团队要用 |
| 依赖 | 当前进程内的库与配置 | 独立环境、独立依赖、独立部署 |
| 数据位置 | 本地文件、内存数据 | 数据库、内部系统、第三方 API |
| 变更频率 | 跟着助手一起改 | 需要独立升级，不影响调用方 |
| 安全要求 | 无鉴权需求 | 需要 Key、审计、限流 |
| 生命周期 | 一次请求内结束 | 长期运行、需要被多个 Client 连接 |

一句经验判断：**当你在第二个项目里复制第一份工具代码时，就该把它做成 MCP Server 了。** 复制之前，它只是一个函数；复制之后，它就是一份需要被维护的公共能力。公司里已经写好的 function，做成 MCP Server 让别的部门的 Agent 直接调用，比让他们抄一遍代码更省事——这句是课件里对「要不要复用」的正面回答。

### 8.2 安全：三个不能省的动作

课件代码里有一处必须点出来的风险：数据库连接串是明文写在工具里的。

```python
engine = create_engine(
    f'mysql+pymysql://student123:student321@rm-xxx.mysql.rds.aliyuncs.com:3306/{database}'
)
```

教学环境里这是为了方便，生产环境里这是事故。三个动作不能省：

**第一，连接信息走环境变量或密钥管理。** 代码里只留 `os.getenv('DB_URL')`，凭据放在部署环境里。代码一旦进 Git，明文密码就等于公开。

**第二，给工具配一个只读账号。** 门票助手的工具只需要 `SELECT`，就不该用有 `INSERT`、`DELETE`、`DROP` 权限的账号。模型的 SQL 是生成出来的，多一条语句的风险一直存在。

**第三，控制返回的数据量。** `df.head(10)` 不只是为了排版，也是在防止「一次查询把几万行敏感数据送进上下文」。涉及个人信息（身份证号、手机号）的字段，应该在建表侧就做脱敏视图，而不是指望提示词约束模型。

还有一条更隐蔽的：**查询结果的去向**。ChatBI 类应用里，查询结果会进入模型上下文，再被组织成自然语言回复。如果数据本身不允许出现在外部 API 的请求里，那么问题不在 SQL，在「把结果回填给模型」这一步。解法是把聚合做在本地，只把聚合后的少量数值交给模型，明细不出库。

### 8.3 三个真实踩过的坑

**坑一：日期口径错，数据不报错但偏小。** 第 13 周那个例子里，`BETWEEN '2023-04-01'` 和 `DATE_FORMAT(..., '%Y-%U') = '2023-13'` 组合起来，把跨月的那一周切掉了一半。修法是在提示词里把口径写死，或者在工具侧对周、月、季度的边界做一次校验。

**坑二：工具太多，模型开始乱选。** `function_list` 里塞了十几个工具后，命中率明显下降，模型会挑一个「看起来像」的调用。MCP 场景更容易出现这个问题，因为接一个 Server 就可能带来七八个工具。解法是分组：一个助手只挂当前任务需要的 Server，而不是把所有服务一次配齐。

**坑三：中间过程用户看不见。** 模型生成了 SQL、调了工具、拿到了结果，但用户界面上只有一句结论。想看中间过程，得在工具里打日志（`print('sql_input=', sql_input)`），或者用 Inspector 的 History 回看。做业务系统时，这段过程建议做成可展开的「执行详情」，因为它同时也是审计记录。

### 8.4 收尾：能力、边界与复用

回到开头那句话。模型能读懂问题，但要动手，得有人给它三样东西。

**给它手**——Function Calling 定义了「模型怎么申请一次调用」，`@register_tool` 加 `function_list` 是最小实现。

**给它边界**——每次调用都是一次权限决策。工具能碰什么数据、返回多少、要不要人工确认，这些都不该由模型自己决定。

**给它复用**——MCP 把工具从某个 Python 文件里搬出来，变成任何人、任何客户端都能连的服务。stdio 解决「本机自己用」，HTTP+SSE 解决「团队一起用」，选哪个取决于数据在哪台机器上。

下一步可以动手的三件事：把门票助手的 `exc_sql` 拆成一个独立 MCP Server，在 Cursor 里连上它；给统计器加一个 Resource，把桌面 txt 的目录清单直接提供给模型；或者把手上某个写了两遍的工具函数，改成 Server 让同事直接连。

写完这些再去问模型同一句话，它给出的就不只是答案，还有查询路径——而路径，才是能核查的那部分。
