---
title: 将静态博客部署到腾讯云
date: 2026-11-09
order: 2
category: [工作台]
tag:
  - 指南
  - 博客
breadcrumb: true
sticky: true
star: true
---

<!-- more -->

静态页面编译完之后，要放到一台自己的机器上才能用自己的域名打开。这篇记录的是 `intro.rochsen.cn`、`blog.rochsen.cn` 和根域名 `rochsen.cn` 在腾讯云轻量应用服务器上的落地方式。三份站点都是磁盘上的 HTML，后面没有 PHP 或 Node 再拼页面。Nginx 负责认域名、上 HTTPS，并决定每一类文件以什么方式离开服务器。

机器是广州的轻量应用服务器，系统为 Debian。Nginx 为手工安装，站点配置放在 `/etc/nginx/sites-available/`，由 `/etc/nginx/sites-enabled/` 里的软链接加载。主站目录是 `/var/www/intro.rochsen.cn`，博客目录是 `/var/www/blog.rochsen.cn`。配置按 2026-11-03 的线上状态整理。公网地址以域名解析结果为准，这里不写出。

下面按一次访问真正经过的顺序来写。每一步先说明它在这条链路上的作用，再给出当时的配置、逐行含义和自行验证的方法。

## 第一步：看清一次访问经过了什么

作用：后面每一项配置都改的是这条链路里的某一环。先把路径画出来，才知道某一行该写在全局 `nginx.conf` 里，还是写进某一个站点文件。

浏览器输入 `https://intro.rochsen.cn` 时，请求依次经过这些环节：

```text
浏览器
  │  ① DNS：intro.rochsen.cn 解析到这台轻量服务器
  │  ② TCP 三次握手，连到 443 端口
  │  ③ TLS 握手：协商 TLS 1.2 或 1.3，校验证书，ALPN 选出 h2（HTTP/2）
  ▼
Nginx（443）
  │  ④ 按 server_name 选中 intro、blog 或根域名
  │  ⑤ 按 location 决定这个 URL 怎么处理
  │  ⑥ 从磁盘读文件：sendfile 零拷贝，tcp_nopush 合并小包
  │  ⑦ 文本类响应在出站前做 gzip
  ▼
浏览器
  │  ⑧ 静态资源按 30 天或 7 天缓存；HTML 每次带 ETag 校验，未变更则 304
  └  ⑨ 渲染。图片已经是 webp
```

DNS 只负责把域名指到这台机器。端口、证书、读哪个目录、缓存多久，都是 Nginx 在这台机器上决定的。所以「部署到腾讯云」的后半段，就是把下面这些配置写对。

## 第二步：三个域名各管一件事

作用：一台 Nginx 可以同时托管很多站点。三个域名如果挤在同一个 `server` 块里，根域名会落到先加载的那一份配置上，访客打开 `rochsen.cn` 会看到博客，证书主体也会是 `blog.rochsen.cn`。拆成三份文件之后，改主站不会带动博客，根域名也有自己的证书和跳转。

| 域名                           | 做什么                     | 配置文件                |
| ------------------------------ | -------------------------- | ----------------------- |
| `rochsen.cn`、`www.rochsen.cn` | 不展示内容，301 到 `intro` | `rochsen.cn.conf`       |
| `intro.rochsen.cn`             | 主站，静态 HTML 直出       | `intro.rochsen.cn.conf` |
| `blog.rochsen.cn`              | 博客，静态 HTML 直出       | `blog.rochsen.cn.conf`  |

`sites-available` 里放配置正文，`sites-enabled` 里放指向它的软链接。Nginx 只加载启用目录里的链接。备份文件留在 `sites-available`、不建软链接，就不会被读进去。

## 第三步：全站启用 HTTP/2

作用：HTTP/1.1 对同一个域名大约只维持 6 条连接，一条连接一次处理一个请求，页面上的 CSS、脚本和图片要排队。HTTP/2 在一条已经握过手的连接上并发多个请求，并对请求头做 HPACK 压缩。静态页的资源数量一多，省下的是连接数和往返，不是某一个文件的体积。

前提是编译 Nginx 时带了 HTTP/2 模块。三个站点的 `listen 443 ssl;` 下面各加一行 `http2 on;`。Nginx 1.25.1 起，`http2` 从 `listen` 的参数里拆了出来，当前用的就是单独这一行。具体构建参数和补丁版本不写在这里，响应头里也已经关掉版本号。

改之前先备份，再用临时文件覆盖，避免写到一半把原文件截断：

```bash
cd /etc/nginx/sites-available && \
for f in intro.rochsen.cn.conf blog.rochsen.cn.conf rochsen.cn.conf; do
  cp -f $f $f.bak_h2
  awk '{print} /listen 443 ssl;/{print "    http2 on;"}' $f > $f.new && mv $f.new $f
done
nginx -t && systemctl reload nginx
```

| 行                              | 含义                                                                             |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `cd /etc/nginx/sites-available` | 进入站点配置目录，后面可以用相对文件名                                           |
| `for f in ...; do ... done`     | 三个文件名依次赋给 `$f`                                                          |
| `cp -f $f $f.bak_h2`            | 先复制一份备份，文件名带 `.bak_h2`。`-f` 表示目标已存在就覆盖                    |
| `awk ... > $f.new`              | 逐行原样输出；碰到 `listen 443 ssl;` 时，在它后面多写一行缩进过的 `http2 on;`    |
| `&& mv $f.new $f`               | 上一步成功才用临时文件替换原文件                                                 |
| `nginx -t`                      | 读完全部配置做语法检查。这里不通过，就不要执行后面的 reload                      |
| `systemctl reload nginx`        | 平滑重载：新配置生效，已经连上的请求处理完再退出。`restart` 会把现有连接短暂断开 |

验证：

```bash
curl -sI https://intro.rochsen.cn | head -1
# 期望：HTTP/2 200
curl -sI --http2 https://rochsen.cn | head -2
# 期望：HTTP/2 301
```

当时三个站点都已经是 HTTP/2，首字节大约 16–20ms。

## 第四步：根域名用自己的证书，并跳到主站

作用：只给 `intro` 和 `blog` 配了 443 时，访问 `https://rochsen.cn` 在 443 上找不到匹配的 `server_name`。Nginx 会退回第一个加载的 SSL 站点。按文件名排序，那一份是 `blog`，于是根域名打开的是博客，证书主体也是 `CN=blog.rochsen.cn`。给根域名单独一个 443 块之后，请求在匹配阶段就被接住，页面和证书一起归位。

做法分三件：

1. 在证书控制台签发同时覆盖 `rochsen.cn` 和 `www.rochsen.cn` 的证书。到期前更换，有效期不写在文章里。
2. 这台轻量服务器的镜像不能用控制台自动部署，改为手动把证书和私钥放到 `/etc/nginx/ssl/rochsen.cn/`。不要把压缩包长期留在登录用户的家目录里。
3. 重写 `rochsen.cn.conf`。改写前先另存一份备份，备份文件名不必带可公开的日期。

```nginx
server {
    listen 80;
    server_name rochsen.cn www.rochsen.cn;
    return 301 https://intro.rochsen.cn$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name rochsen.cn www.rochsen.cn;
    ssl_certificate     /etc/nginx/ssl/rochsen.cn/rochsen.cn_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/rochsen.cn/rochsen.cn.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    return 301 https://intro.rochsen.cn$request_uri;
}
```

| 行                                                 | 含义                                                                                             |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `server { ... }`                                   | 一个虚拟主机。一台 Nginx 里每个 `server` 块负责一批域名                                          |
| `listen 80;`                                       | 这个块只听 HTTP 明文端口                                                                         |
| `server_name rochsen.cn www.rochsen.cn;`           | 请求头 `Host` 命中其中任何一个，就由这个块处理                                                   |
| `return 301 https://intro.rochsen.cn$request_uri;` | 直接返回永久跳转，不读磁盘。`$request_uri` 是原始路径加查询串，`/about?x=1` 跳过去仍停在对应路径 |
| `listen 443 ssl;`                                  | 这个块只听 HTTPS。`ssl` 表示这条连接要做 TLS                                                     |
| `http2 on;`                                        | 这条 443 连接按第三步启用 HTTP/2                                                                 |
| `ssl_certificate ..._bundle.crt;`                  | 公钥证书。`bundle` 里含服务器证书和中间证书，避免部分客户端报证书链不完整                        |
| `ssl_certificate_key ...key;`                      | 与上面那张证书配对的私钥。私钥权限 `600`，证书 `644`                                             |
| `ssl_protocols TLSv1.2 TLSv1.3;`                   | 只保留 TLS 1.2 和 1.3                                                                            |
| `ssl_session_cache` 与 `ssl_session_timeout`       | 会话复用，含义放在第八步                                                                         |
| 第二个 `return 301`                                | 443 上同样不展示内容。这个块没有 `root`，也没有 `index`，因为它不需要读文件                      |

真正挡住「串到 blog」的是 443 这段里的 `server_name`。有这个块在，根域名的请求就不会再落到按文件名排在前面的博客站点。

验证：

```bash
curl -sI https://rochsen.cn | grep -Ei '^(HTTP|location)'
# 期望：HTTP/2 301 ，location 指向 https://intro.rochsen.cn/
openssl s_client -connect rochsen.cn:443 -servername rochsen.cn </dev/null 2>/dev/null | grep 'subject='
# 期望：subject=CN = rochsen.cn
curl -sIL https://rochsen.cn -o /dev/null -w '%{http_code}\n'
# 跟随跳转后的落地状态码：200
```

修复前，`https://rochsen.cn` 返回 200，内容却是博客，证书为 `CN=blog.rochsen.cn`。修复后返回 301，落到 intro，证书主体是 `rochsen.cn`，SAN 同时包含 `rochsen.cn` 和 `www.rochsen.cn`。

## 第五步：文本在出站前做 gzip

作用：HTML、CSS、JS、JSON、SVG 和字体里重复字符很多，压缩后体积常常降到原来的三分之一上下。图片本身已经是压缩格式，再压一次几乎不减小，所以故意不放进类型名单。intro 首页原始大约 10.6KB，压完传输 3812 字节。

这段写在 `/etc/nginx/nginx.conf` 的 `http { }` 里，用注释 `# KIKI_GZIP_BLOCK` 标出来，三个站点一起生效。

```nginx
http {
    # KIKI_GZIP_BLOCK
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_buffers 16 8k;
    gzip_http_version 1.1;
    gzip_types
        text/plain text/css text/xml
        application/json application/javascript text/javascript
        application/xml application/xml+rss
        image/svg+xml application/rss+xml application/atom+xml
        font/ttf font/otf application/vnd.ms-fontobject;

    sendfile on;
    tcp_nopush on;
}
```

| 行                       | 含义                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------- |
| `gzip on;`               | 打开响应压缩                                                                                         |
| `gzip_vary on;`          | 加上 `Vary: Accept-Encoding`，让中间的代理和 CDN 知道：同一个 URL 会因为客户端是否接受压缩而内容不同 |
| `gzip_proxied any;`      | 请求经过代理、带有 `Via` 时仍然压缩。前面再挂 CDN 时需要这一行                                       |
| `gzip_comp_level 6;`     | 级别 1 到 9。6 是体积和 CPU 的平衡点，个人静态站不必用到 9                                           |
| `gzip_min_length 1024;`  | 小于 1KB 的响应不压。太小的文件压完可能更大                                                          |
| `gzip_buffers 16 8k;`    | 压缩过程使用 16 块 8KB 的缓冲区                                                                      |
| `gzip_http_version 1.1;` | 对 HTTP/1.1 及以上压缩。HTTP/2 落在这个范围里                                                        |
| `gzip_types ...;`        | 白名单。默认只压 `text/html`，其余类型要逐个写上                                                     |
| `sendfile`、`tcp_nopush` | 放在第九步                                                                                           |

配置文件末尾还留着 Debian 自带的 `# gzip_vary on;` 这类注释。被注释的行不生效，生效的是上面这一段。

验证：

```bash
curl -sI -H 'Accept-Encoding: gzip' https://intro.rochsen.cn/ | grep -Ei 'content-encoding|content-length|vary'
curl -s -o /dev/null -w '未压缩: %{size_download} 字节\n' https://intro.rochsen.cn/
curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '已压缩: %{size_download} 字节\n' https://intro.rochsen.cn/
```

当时 intro 首页传输 3812 字节，blog 首页 15722 字节，两边都带 `content-encoding: gzip`。

## 第六步：按资源类型分开缓存

作用：同一个人第二次打开页面时，CSS、脚本和图片不需要再向广州这台机器要一遍。缓存时间要分开。构建产物的文件名带哈希，可以放很久；散落在其他目录、文件名不变的资源要短一些；HTML 是入口，缓存太久，文章更新了访客仍看到旧页面。

`intro` 和 `blog` 的这段相同，写在各自的 `server` 块里，用 `# KIKI_CACHE_BLOCK` 标出。

```nginx
    # KIKI_CACHE_BLOCK
    location ~* ^/assets/ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
        try_files $uri =404;
    }

    location ~* \.(?:css|js|mjs|woff2?|ttf|otf|eot|png|jpe?g|gif|webp|avif|svg|ico|mp4|webm)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        access_log off;
        try_files $uri =404;
    }

    location ~* \.html?$ {
        add_header Cache-Control "no-cache";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ =404;
    }
```

第一档是 `/assets/` 下的构建产物，缓存 30 天：

| 行                                         | 含义                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `location ~* ^/assets/`                    | `~*` 是不区分大小写的正则。`^/assets/` 要求路径以这个前缀开始                            |
| `expires 30d;`                             | 同时产生 `Expires` 和 `Cache-Control: max-age=2592000`                                   |
| `add_header Cache-Control "... immutable"` | `public` 允许中间缓存保存；`immutable` 表示这 30 天内直接用本地副本，连 304 的确认也省掉 |
| `access_log off;`                          | 这一档不写访问日志，见第十步                                                             |
| `try_files $uri =404;`                     | 磁盘上有这个文件就返回，没有就 404，避免落到后面的规则里产生含糊结果                     |

第二档是其他静态后缀，缓存 7 天。正则里 `woff2?` 同时匹配 `woff` 和 `woff2`，`jpe?g` 同时匹配 `jpg` 和 `jpeg`。这里用 7 天，是因为这些文件名没有哈希，同名覆盖之后要更早失效。这一档的 `Cache-Control` 没有 `immutable`，刷新时仍可能做一次 304。

第三档是 HTML。`\.html?$` 同时匹配 `.htm` 和 `.html`。`Cache-Control: no-cache` 的含义是可以留在本地，但每次使用前要向服务器确认一次。确认通常只是第七步里的 304，正文不重传。文章一更新，下一次确认就会拿到新文件。

最后的 `location /` 接住其余 URL。`try_files $uri $uri/ =404` 先找同名文件，再把路径当目录并套用 `index index.html`，仍没有就返回 404。

`location` 的选用顺序决定了「改了为什么不生效」：

1. `=` 精确匹配优先。
2. 然后是 `^~` 前缀。
3. 然后是 `~` 和 `~*`，按配置文件里的先后，命中第一条就停。
4. 再是普通前缀。
5. 最后才是 `location /`。

因此 `/assets/style.css` 命中第一条，拿 30 天加 `immutable`，不会掉进第二条的 7 天规则。

`expires` 和 `add_header Cache-Control` 都会写出 `Cache-Control`，响应里可能出现两条。浏览器会选用其中一条，当前这样可以工作。想收成一条时，保留 `add_header`、去掉 `expires` 即可。

验证：

```bash
for u in https://intro.rochsen.cn/ https://intro.rochsen.cn/assets/index.css https://intro.rochsen.cn/logo.png; do
  echo "== $u"
  curl -sI "$u" | grep -Ei 'cache-control|expires|etag'
  echo
done
```

浏览器里打开开发者工具的 Network。HTML 一行会是 `304` 或来自磁盘缓存；`/assets/` 下的文件会直接来自内存或磁盘缓存。

## 第七步：HTML 用 ETag 做条件请求

作用：第六步让 HTML 每次都向服务器确认一次。如果每次确认都重传整页，缓存就没有省下流量。ETag 把这次确认变成一次很短的比对：文件没变，服务器只回 `304 Not Modified`，响应里没有正文。

这里不用额外配置。Nginx 默认 `etag on`，并且 `if_modified_since exact`。只要由 `try_files` 返回磁盘文件，响应里就会带上 `ETag` 和 `Last-Modified`。当时首页能看到 `ETag: W/"6ae96122-2980"`。

```text
ETag: W/"6ae96122-2980"
       │  │        └── 文件大小的十六进制，0x2980 = 10624 字节
       │  └── 最后修改时间的十六进制秒数
       └── W/ 表示弱校验：内容语义相同即可
```

一次完整往返是：

1. 第一次访问返回 200、正文和 ETag，浏览器把正文和这个值记下来。
2. 再次访问时带上 `If-None-Match`，值就是上次的 ETag。
3. Nginx 用文件当前的 ETag 比对。相同则回 304；文件改过则回 200、新正文和新的 ETag。

验证：

```bash
ETAG=$(curl -sI https://intro.rochsen.cn/ | grep -i '^etag' | tr -d '\r' | cut -d' ' -f2)
echo "ETag = $ETAG"
curl -sI -H "If-None-Match: $ETAG" https://intro.rochsen.cn/ | head -1
# 期望：HTTP/2 304
```

## 第八步：复用 TLS 会话

作用：每次新建 HTTPS 连接都要做 TLS 握手，交换参数、验证证书，通常要一到两次往返，其中的非对称运算也比后面的对称加密贵。会话复用让短时间内再次访问的客户端沿用刚才协商好的密钥，跳过完整握手。

三个站点的 443 段都有这两行：

```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

| 行                         | 含义                                                                                                                               |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `shared:SSL:10m`           | `shared` 表示所有 worker 共用一块内存。`SSL` 是这块缓存的名字，同机多个站点用同一个名字就可以互相复用。`10m` 大约能放下 4 万个会话 |
| `ssl_session_timeout 10m;` | 10 分钟后会话过期，下一次要重新握手。访问很密的站可以放到 1 小时，时间越长越容易把缓存占满                                         |

全局还有 `ssl_prefer_server_ciphers off;`，套件的选择交给客户端。现代浏览器会选自己合适的套件，和 TLS 1.3 放在一起使用。`ssl_protocols` 只留 1.2 和 1.3，也避免为了旧协议再做一轮回退。

验证时连续做两次握手，第二次应出现会话被复用：

```bash
echo | openssl s_client -connect intro.rochsen.cn:443 -servername intro.rochsen.cn 2>/dev/null | grep -Ei 'New,|Reused,|Protocol|Cipher'
```

第一次是 `New`。紧接着再跑一次，通常是 `Reused`。要用 `-sess_out` 和 `-sess_in` 才能稳定复现同一次会话。

## 第九步：用 sendfile 把文件直接送上网卡

作用：静态站的主要工作是把磁盘文件交给网络。默认路径是内核读进用户态，应用再写回 socket，同一份数据多抄一遍。`sendfile` 让内核在文件和 socket 之间直接搬运。`tcp_nopush` 把响应头和紧跟着的文件开头凑满一个报文再发出，减少小包数量。

Debian 这份 `nginx.conf` 里已经打开：

```nginx
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;
    server_tokens off;
```

| 行                          | 含义                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| `sendfile on;`              | 数据从磁盘文件直接进入 socket 缓冲                                                          |
| `tcp_nopush on;`            | 在 Linux 上对应 `TCP_CORK`，把响应头和小文件开头合并发送。它要和 `sendfile on` 一起才有意义 |
| `types_hash_max_size 2048;` | 按扩展名查 `Content-Type` 时使用的哈希表大小                                                |
| `server_tokens off;`        | `Server` 响应头只写 `nginx`，不带版本号                                                     |

```bash
nginx -T 2>/dev/null | grep -E '^\s*(sendfile|tcp_nopush)'
# 期望：sendfile on; 与 tcp_nopush on;
```

`sendfile` 在大文件上更明显。对小 HTML，它省的是一次拷贝。首字节能到 16–20ms，主要还是因为第十一步的静态直出，文件就在本机磁盘上。

## 第十步：静态资源不再写访问日志

作用：默认每个请求都往 `/var/log/nginx/access.log` 追加一行。一个页面带几十个静态资源，就会写几十行。这些行对判断「谁打开了哪篇文章」帮助不大，却占用磁盘写入。

全局仍是 `access_log /var/log/nginx/access.log;`，使用 `combined` 格式，记录 IP、时间、请求行、状态码、UA 和 referer。第六步那两个静态资源 `location` 里写了 `access_log off;`。Nginx 里子级覆盖父级，所以只有这两个范围内的请求不记录。HTML 和 404 仍会留下，排障时看的是页面访问。

验证时请求一个静态资源，再看日志末尾，不应出现该资源那一行：

```bash
curl -s -o /dev/null https://intro.rochsen.cn/assets/xxx.css
sudo tail -3 /var/log/nginx/access.log
```

## 第十一步：页面由 Nginx 直接从目录里读出

作用：动态站点每次请求都要启动框架、查数据、拼 HTML，这一段常常就是几十到几百毫秒。现在两个站的页面在构建时已经生成，Nginx 按 URL 去站点目录取文件。请求处理里没有后端进程，首字节才会落在 16–20ms。

对应配置：

```nginx
    root /var/www/intro.rochsen.cn;
    index index.html;
    error_page 404 /404.html;
```

| 行                          | 含义                                                                        |
| --------------------------- | --------------------------------------------------------------------------- |
| `root`                      | 站点根目录。请求 `/about/` 时，到 `/var/www/intro.rochsen.cn/about/` 下面找 |
| `index index.html;`         | 请求的是目录时，返回该目录下的 `index.html`                                 |
| `error_page 404 /404.html;` | 找不到文件时内部改去输出 `/404.html`，状态码仍是 404                        |

博客那一份只改两处：`server_name` 换成 `blog.rochsen.cn`，`root` 换成 `/var/www/blog.rochsen.cn`。

80 端口那一段也值得单独看：

```nginx
return 301 https://$host$request_uri;
```

`$host` 取请求里的主机名，`$request_uri` 是原始路径和查询串。`http://intro.rochsen.cn/a?b=1` 会跳到 `https://intro.rochsen.cn/a?b=1`。用 `$host` 而不是把域名写死，同一段配置复制到另一个子域名时仍然正确。根域名的第四步则是写死跳到 intro，因为根域名本身不承载内容。

验证：

```bash
curl -s -o /dev/null -w '状态码=%{http_code} 首字节=%{time_starttransfer}s 总计=%{time_total}s\n' https://intro.rochsen.cn/
```

## 第十二步：图片用 webp，并让缓存规则认识这个后缀

作用：同一张图换成 WebP，体积通常能再小四分之一到一半。页面里图片越多，这一步对传输量的影响越大。转换是在文件层面完成的：图片做成 `.webp`，HTML 里直接引用这个后缀。

Nginx 要配合的有两处，都已经在前面的配置里：

1. `gzip_types` 不包含 `image/webp`。WebP 自己已经压缩过，再 gzip 几乎不减小，只增加 CPU。
2. 第六步的静态后缀正则里写了 `webp`。于是 `.webp` 进入 7 天缓存；如果文件放在 `/assets/` 下，则走 30 天加 `immutable`。

删掉正则里的 `webp` 之后，这些图片会落到 `location /`，失去明确的缓存时间，只剩下 ETag 那种「每次来问一次」的行为。

还有一种没启用的做法：服务器看浏览器的 `Accept` 是否包含 `image/webp`，再决定送 `.webp` 还是原图。

```nginx
map $http_accept $webp_suffix {
    default        "";
    "~*image/webp" ".webp";
}
```

这样可以不改 HTML。代价是每张图要多存一份，缓存键还要带上 `Vary: Accept`。当前是构建时转好、HTML 直接引用 `.webp`，规则更少，效果相同。

## 第十三步：以后改配置按同一顺序做

作用：前面十二步已经在线上。之后再改任何一行，都要保证语法错误不会被加载进去，并且能退回改之前的文件。这是部署完成之后仍要保留的操作顺序。

```bash
cp /etc/nginx/sites-available/intro.rochsen.cn.conf \
   /etc/nginx/sites-available/intro.rochsen.cn.conf.bak$(date +%Y%m%d)

nano /etc/nginx/sites-available/intro.rochsen.cn.conf

nginx -t
systemctl reload nginx

systemctl status nginx --no-pager | head -5
curl -sI https://intro.rochsen.cn | head -1
```

`nginx -t` 不通过时，不要执行 reload。回滚就是把备份盖回去，再检查并重载：

```bash
cp -f /etc/nginx/sites-available/intro.rochsen.cn.conf.bak \
      /etc/nginx/sites-available/intro.rochsen.cn.conf
nginx -t && systemctl reload nginx
```

两件容易出错的事：

1. 少一个分号。`nginx -t` 会报行号，补上即可。
2. 改了 `sites-available` 里的文件，但 `sites-enabled` 的软链接没有指向它。用 `ls -l /etc/nginx/sites-enabled/` 确认链接目标。

当时留下的备份是：

| 备份                           | 说明                |
| ------------------------------ | ------------------- |
| 根域名配置的改前副本           | 改成 301 之前的配置 |
| intro 在加上 HTTP/2 之前的副本 | 回退 HTTP/2 时使用  |
| blog 在加上 HTTP/2 之前的副本  | 回退 HTTP/2 时使用  |
| 根域名在加上 HTTP/2 之前的副本 | 回退 HTTP/2 时使用  |

它们都在 `sites-available` 里，启用目录没有对应软链接，所以不会被加载。

## 第十四步：先记下还没启用的项目

作用：把边界写清楚。当前这套已经覆盖连接、压缩、缓存和静态读取。下表是还能再做的事，以及各自要先满足的条件。没有条件就先不加，避免为了纸面上的优化改动已经稳定的站点。

| 项目              | 能多得到什么                                   | 先要满足的条件                                                                                                                                           |
| ----------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP/3（QUIC）    | 弱网和移动网络上首次连接更快，重连可以 0-RTT   | 需要相应模块，并在防火墙放通 UDP 443。配置是 `listen 443 quic reuseport;`，再加 `Alt-Svc` 头。国内部分网络对 UDP 443 有干扰                              |
| `gzip_static on;` | 直接发送构建时生成的 `.gz`，请求到来时不再现压 | 需要相应模块，且每个目标文件旁边要有同名 `.gz`。适合放在 `assets` 里的大脚本和样式上                                                                     |
| `open_file_cache` | 记住文件句柄和属性，减少 `stat()`              | 要设好 `inactive` 和 `valid`。文件经常替换时，缓存的属性会暂时是旧的。以目前的首字节时间，收益有限                                                       |
| Brotli            | 同样内容比 gzip 再小大约 15% 到 20%            | 要额外安装 `ngx_brotli`，或者把压缩交给 CDN                                                                                                              |
| CDN               | 各省访问都从近处的节点取文件                   | 单独计费。静态站适合，接入前先看官方价格、缓存规则和回源方式                                                                                             |
| HSTS              | 浏览器在一段时间内只走 HTTPS                   | `add_header Strict-Transport-Security "max-age=31536000" always;`。下发之后，在 `max-age` 内浏览器会拒绝 HTTP。先用较短的 `max-age` 确认跳转稳定，再拉长 |

## 把各步拼回一份站点配置

intro 当前的线上配置就是前面几步叠在一起的结果：

```nginx
server {
    listen 80;
    server_name intro.rochsen.cn;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name intro.rochsen.cn;
    root /var/www/intro.rochsen.cn;
    index index.html;
    error_page 404 /404.html;
    ssl_certificate     /etc/nginx/ssl/intro.rochsen.cn/intro.rochsen.cn_bundle.crt;
    ssl_certificate_key /etc/nginx/ssl/intro.rochsen.cn/intro.rochsen.cn.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # KIKI_CACHE_BLOCK
    location ~* ^/assets/ {
        expires 30d;
        add_header Cache-Control "public, max-age=2592000, immutable";
        access_log off;
        try_files $uri =404;
    }

    location ~* \.(?:css|js|mjs|woff2?|ttf|otf|eot|png|jpe?g|gif|webp|avif|svg|ico|mp4|webm)$ {
        expires 7d;
        add_header Cache-Control "public, max-age=604800";
        access_log off;
        try_files $uri =404;
    }

    location ~* \.html?$ {
        add_header Cache-Control "no-cache";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

`blog.rochsen.cn.conf` 与它的差别只有 `server_name` 和 `root`。根域名那一份则没有 `root`，两个端口都 `return 301` 到 intro。

这几步合在一起，各自负责不同的层：

- 连接：HTTP/2、TLS 1.2/1.3、会话复用，让重复访问少握手。
- 体积：gzip 处理文本，webp 处理图片。
- 复访：`/assets/` 缓存 30 天并标记 `immutable`，其他静态后缀 7 天，HTML 每次确认，未变更则 304。
- 机器本身：`sendfile`、`tcp_nopush`、目录直出，以及不为静态资源写日志。
- 入口：根域名带着自己的证书跳到 intro，不再打开成博客。

对这个流量的个人静态站，上面这些已经够用。HTTP/3、Brotli 和 CDN 是在此之上的追加项，等有对应需求再开。
