---
title: 站点访问提速策略介绍
date: 2026-11-09
order: 3
category: [工作台]
tag:
  - 指南
  - 博客
breadcrumb: true
sticky: true
star: true
---

<!-- more -->

主站和博客都是已经生成好的静态页面，打开快不快，不取决于后面还有没有一套应用服务，而取决于 Nginx 在连接、体积、缓存和读盘这几层做了什么。机器、三个域名的分工，以及拼好的站点文件，记在[将静态博客部署到腾讯云](./tencentCloud.md)。这篇只介绍提速：每一项解决访问链路里的哪一段，配置写在哪里，改完怎样自己确认。

配置按 2026-11-03 的线上状态整理。站点文件在 `/etc/nginx/sites-available/`，由 `sites-enabled/` 的软链接加载。Nginx 的补丁版本不写在这里。

## 第一步：先看时间花在哪一段

作用：一项配置只能加快链路里的一段。先把一次访问拆开，后面才知道 HTTP/2 省的是连接，gzip 省的是字节，缓存省的是回源。

浏览器打开 `https://intro.rochsen.cn` 时，请求按这个顺序走：

```text
浏览器
  │  ① DNS：intro.rochsen.cn 解析到这台轻量服务器
  │  ② TCP 三次握手，连到 443
  │  ③ TLS 握手，协商出 HTTP/2
  ▼
Nginx
  │  ④ 按域名选中 intro、blog 或根域名
  │  ⑤ 按 location 决定这个 URL 怎么处理
  │  ⑥ 从磁盘把文件送出去
  │  ⑦ 文本在出站前 gzip
  ▼
浏览器
  │  ⑧ 静态资源按 30 天或 7 天留在本地；HTML 每次用 ETag 确认，没变就 304
  └  ⑨ 渲染。图片已经是 webp
```

当时 intro 和 blog 的首字节大约 16–20ms。这个数字主要来自「文件就在本机磁盘上」，后面几步是在此之上再省连接、省字节、省重复请求。

## 第二步：先看哪些已经生效

作用：提速项不是一次加完的。先有一张对照，读后面的步骤时就知道它是现状，还是还没做的可选项。

| 步骤 | 策略                           | 写在哪里            | 作用                         | 状态   |
| ---- | ------------------------------ | ------------------- | ---------------------------- | ------ |
| 三   | HTTP/2                         | 各站点 `http2 on;`  | 一条连接上并发多个请求       | 已启用 |
| 四   | 根域名 301 和独立证书          | `rochsen.cn.conf`   | 根域名不再打开成博客         | 已启用 |
| 五   | gzip                           | `nginx.conf`        | 文本体积压到大约三分之一     | 已启用 |
| 六   | 分级缓存                       | 各站点 `location`   | 再次访问几乎不再回源         | 已启用 |
| 七   | ETag / 304                     | Nginx 默认          | HTML 没变时不重传正文        | 已启用 |
| 八   | TLS 会话复用                   | `ssl_session_cache` | 短时间内再次访问省掉完整握手 | 已启用 |
| 九   | sendfile 与 tcp_nopush         | `nginx.conf`        | 少一次内存拷贝，合并小包     | 已启用 |
| 十   | 静态资源不写访问日志           | 各站点 `location`   | 少写磁盘                     | 已启用 |
| 十一 | 静态页面直出                   | 站点目录            | 请求路径里没有后端           | 现状   |
| 十二 | webp                           | 站点文件            | 图片体积下降                 | 已完成 |
| 十四 | HTTP/3、预压缩、Brotli、CDN 等 | —                   | 还能再快的部分               | 未启用 |

## 第三步：一条连接上并发多个请求

作用：HTTP/1.1 对同一个域名大约只开 6 条连接，一条连接一次只处理一个请求，样式、脚本和图片要排队。HTTP/2 在一条已经握过手的连接上同时跑多个请求，并对请求头做 HPACK 压缩。页面上的文件越多，省下的往返越多。

Nginx 编译时需要带上 HTTP/2 模块。三个站点在 `listen 443 ssl;` 下面各有一行 `http2 on;`。1.25.1 之后，`http2` 不再写进 `listen` 的参数里。构建里还有哪些模块，不在文章里列出。

当时是先备份，再在匹配行后面插入这一行：

```bash
cd /etc/nginx/sites-available && \
for f in intro.rochsen.cn.conf blog.rochsen.cn.conf rochsen.cn.conf; do
  cp -f $f $f.bak_h2
  awk '{print} /listen 443 ssl;/{print "    http2 on;"}' $f > $f.new && mv $f.new $f
done
nginx -t && systemctl reload nginx
```

`cp` 留下 `.bak_h2`。`awk` 原样输出每一行，碰到 `listen 443 ssl;` 就多写一行 `http2 on;`。结果先写入临时文件，成功后再覆盖原文件。`nginx -t` 不通过就不 `reload`。`reload` 让新配置生效，已经连上的请求处理完再退出。

```bash
curl -sI https://intro.rochsen.cn | head -1
# 期望：HTTP/2 200
curl -sI --http2 https://rochsen.cn | head -2
# 期望：HTTP/2 301
```

三个站点当时都已经是 HTTP/2。

## 第四步：根域名带着自己的证书跳到主站

作用：这一步首先是让入口正确，同时也避免访客先下载一整份错误页面再跳走。只给 intro 和 blog 配 443 时，`https://rochsen.cn` 找不到匹配的 `server_name`，Nginx 会退回第一个 SSL 站点。按文件名，那一份是 blog，于是根域名打开的是博客，证书主体也是 `blog.rochsen.cn`。

根域名现在有自己的 80 和 443，两边都直接 301 到 intro。证书放在 `/etc/nginx/ssl/rochsen.cn/`，到期前更换。这台轻量服务器的镜像不能用控制台自动部署，证书是手动放上去的。

```nginx
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

挡住串站的是这里的 `server_name`。`bundle.crt` 带上中间证书，避免部分客户端报证书链不完整。`$request_uri` 保留原始路径和查询串，`/about?x=1` 跳过去仍停在对应地址。这个块没有 `root`，因为它不读文件。

```bash
curl -sI https://rochsen.cn | grep -Ei '^(HTTP|location)'
# 期望：HTTP/2 301，location 指向 https://intro.rochsen.cn/
openssl s_client -connect rochsen.cn:443 -servername rochsen.cn </dev/null 2>/dev/null | grep 'subject='
# 期望：subject=CN = rochsen.cn
```

修复前根域名返回 200，内容却是博客。修复后是 301，证书主体是 `rochsen.cn`。

## 第五步：文本在出站前压缩

作用：HTML、CSS、JS、JSON、SVG 和字体里重复字符很多，gzip 常常能把体积压到大约三分之一。intro 首页原始约 10.6KB，压完传输 3812 字节。图片本身已经是压缩格式，再压一次几乎不减小，所以不放进类型名单。

这段在 `/etc/nginx/nginx.conf` 的 `http` 块里，注释 `# KIKI_GZIP_BLOCK` 标出，三个站点一起生效。

```nginx
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
```

| 行                      | 含义                                                                   |
| ----------------------- | ---------------------------------------------------------------------- |
| `gzip on;`              | 打开压缩                                                               |
| `gzip_vary on;`         | 加上 `Vary: Accept-Encoding`，让前面的代理按客户端是否接受压缩分别缓存 |
| `gzip_proxied any;`     | 请求经过代理时仍然压缩。以后挂 CDN 需要这一行                          |
| `gzip_comp_level 6;`    | 1 到 9 里的平衡点。个人站不必用到 9                                    |
| `gzip_min_length 1024;` | 小于 1KB 的响应不压，避免压完更大                                      |
| `gzip_types`            | 白名单。默认只压 `text/html`，其余类型要写出来                         |

文件末尾 Debian 自带的 `# gzip_vary on;` 仍是注释，不生效。

```bash
curl -sI -H 'Accept-Encoding: gzip' https://intro.rochsen.cn/ | grep -Ei 'content-encoding|content-length|vary'
curl -s -o /dev/null -w '未压缩: %{size_download} 字节\n' https://intro.rochsen.cn/
curl -s -H 'Accept-Encoding: gzip' -o /dev/null -w '已压缩: %{size_download} 字节\n' https://intro.rochsen.cn/
```

当时 intro 首页传输 3812 字节，blog 首页 15722 字节，两边都带 gzip。

## 第六步：按资源会不会改名来决定缓存多久

作用：同一个人第二次打开页面时，样式、脚本和图片不该再向广州这台机器要一遍。时间要分开。构建产物的文件名带哈希，可以放很久；文件名不变的资源要短一些；HTML 是入口，缓存太久，文章更新了仍会看到旧页面。

intro 和 blog 的这段相同，用 `# KIKI_CACHE_BLOCK` 标出。

```nginx
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

`/assets/` 缓存 30 天，并带 `immutable`：这 30 天里浏览器直接用本地副本，连 304 的确认也省掉。其他静态后缀缓存 7 天，因为这些文件名没有哈希，同名覆盖后要更早失效。`woff2?` 同时匹配 `woff` 和 `woff2`，`jpe?g` 同时匹配 `jpg` 和 `jpeg`。

HTML 的 `no-cache` 表示可以留在本地，但每次使用前要向服务器确认。确认通常就是下一步的 304，正文不重传。

`location` 按出现顺序选用正则，第一条命中就停。所以 `/assets/style.css` 走 30 天，不会掉进 7 天那条。`expires` 和 `add_header` 都会写出 `Cache-Control`，响应里可能有两条，浏览器会选用其中一条。

```bash
for u in https://intro.rochsen.cn/ https://intro.rochsen.cn/assets/index.css https://intro.rochsen.cn/logo.png; do
  echo "== $u"
  curl -sI "$u" | grep -Ei 'cache-control|expires|etag'
  echo
done
```

## 第七步：HTML 没变就只回 304

作用：上一步让 HTML 每次都确认一次。如果每次确认都重传整页，缓存就没有省下流量。ETag 把确认变成一次比对：文件没变，服务器只回 `304 Not Modified`，没有正文。

不用额外配置。Nginx 默认 `etag on`。当时首页的响应是 `ETag: W/"6ae96122-2980"`：`W/` 表示弱校验，中间是修改时间的十六进制秒数，末尾 `2980` 是文件大小的十六进制，等于 10624 字节。

再次访问时浏览器带上 `If-None-Match`。值相同就 304；文件改过就 200，并换一个新的 ETag。

```bash
ETAG=$(curl -sI https://intro.rochsen.cn/ | grep -i '^etag' | tr -d '\r' | cut -d' ' -f2)
curl -sI -H "If-None-Match: $ETAG" https://intro.rochsen.cn/ | head -1
# 期望：HTTP/2 304
```

## 第八步：短时间内复用 TLS 会话

作用：每次新建 HTTPS 连接都要做完整握手，通常一到两次往返，其中的非对称运算也比后面的对称加密贵。会话复用让 10 分钟内再次访问的客户端沿用刚才的密钥。

三个站点的 443 段都有：

```nginx
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

`shared` 表示所有 worker 共用一块内存。名字都叫 `SSL`，三个站点可以互相复用。10MB 大约能放 4 万个会话，10 分钟后过期。全局还有 `ssl_prefer_server_ciphers off;`，套件交给客户端选。协议只留 TLS 1.2 和 1.3，不再为旧版本做回退。

连续两次握手，第二次应出现 `Reused`：

```bash
echo | openssl s_client -connect intro.rochsen.cn:443 -servername intro.rochsen.cn 2>/dev/null | grep -Ei 'New,|Reused,|Protocol|Cipher'
```

## 第九步：文件从磁盘直接送上网卡

作用：默认路径是内核把文件读进用户态，应用再写回 socket，同一份数据多抄一遍。`sendfile` 让内核在文件和 socket 之间直接搬运。`tcp_nopush` 把响应头和文件开头凑满一个报文再发，减少小包。它要和 `sendfile on` 一起才有意义。

```nginx
sendfile on;
tcp_nopush on;
types_hash_max_size 2048;
server_tokens off;
```

`server_tokens off` 让 `Server` 头只写 `nginx`，不带版本号。这不加快传输，只是少暴露版本。

```bash
nginx -T 2>/dev/null | grep -E '^\s*(sendfile|tcp_nopush)'
```

大文件上这一步更明显。小 HTML 省的是一次拷贝。首字节能到 16–20ms，主要仍是因为页面直接从本机目录读出。

## 第十步：静态资源不再写访问日志

作用：每个请求默认都往 `/var/log/nginx/access.log` 追加一行。一个页面带几十个静态文件，就会写几十行。这些行对判断「谁打开了哪篇文章」帮助不大，却占用磁盘写入。

全局日志仍开着，格式是 `combined`。第六步那两个静态 `location` 里写了 `access_log off;`，子级覆盖父级，所以只有静态资源不记。HTML 和 404 仍会留下。

```bash
curl -s -o /dev/null https://intro.rochsen.cn/assets/xxx.css
sudo tail -3 /var/log/nginx/access.log
```

日志末尾不应出现这个 css。

## 第十一步：请求路径里没有后端

作用：动态站每次都要启动框架、查数据、拼 HTML，这一段常常就是几十到几百毫秒。现在页面在构建时已经生成，Nginx 按 URL 去 `/var/www/intro.rochsen.cn` 或 `/var/www/blog.rochsen.cn` 取文件。首字节里没有后端的时间。

```nginx
root /var/www/intro.rochsen.cn;
index index.html;
error_page 404 /404.html;
```

`index` 在访问目录时返回 `index.html`。`error_page` 让 404 显示自定义页面，状态码仍是 404。

80 端口用 `return 301 https://$host$request_uri;` 把明文请求转到 HTTPS。`$host` 取当前主机名，这段配置复制到另一个子域名时仍然正确。根域名则写死跳到 intro，因为它自己不承载内容。

```bash
curl -s -o /dev/null -w '状态码=%{http_code} 首字节=%{time_starttransfer}s 总计=%{time_total}s\n' https://intro.rochsen.cn/
```

## 第十二步：图片用 webp，并让缓存规则认识它

作用：同一张图换成 WebP，体积通常还能小四分之一到一半。转换在文件层面完成，HTML 直接引用 `.webp`。

Nginx 配合两处：`gzip_types` 不包含 `image/webp`，避免对已经压缩的图片再压一次；第六步的后缀正则里写了 `webp`，于是这些文件进入 7 天缓存，放在 `/assets/` 下则是 30 天加 `immutable`。删掉这个后缀后，图片会落到 `location /`，只剩 ETag 那种每次来问一次的行为。

还有一种没启用的做法：看请求头 `Accept` 里有没有 `image/webp`，再决定送 webp 还是原图。那样可以不改 HTML，但每张图要多存一份，缓存还要带 `Vary: Accept`。当前是构建时转好，规则更少。

## 第十三步：以后改任何一项都按同一顺序

作用：提速配置已经在线上。再改一行时，语法错误不能被加载进去，并且要能退回改之前的文件。

```bash
cp /etc/nginx/sites-available/intro.rochsen.cn.conf \
   /etc/nginx/sites-available/intro.rochsen.cn.conf.bak$(date +%Y%m%d)
nano /etc/nginx/sites-available/intro.rochsen.cn.conf
nginx -t
systemctl reload nginx
curl -sI https://intro.rochsen.cn | head -1
```

`nginx -t` 不通过就不要 reload。回滚是把备份盖回去，再检查并重载。少一个分号时，`nginx -t` 会报行号。改了 `sites-available` 却没生效时，用 `ls -l /etc/nginx/sites-enabled/` 看软链接是否指向这份文件。

改配置前留下的备份都在 `sites-available` 里，启用目录没有对应链接，所以不会被加载。备份文件名不写进文章。

## 第十四步：这些还没开，因为条件还没到

作用：把边界写清楚。连接、压缩、缓存和读盘已经覆盖。下表是还能再做的事，以及先要满足的条件。

| 项目              | 还能多得到什么                                 | 先要满足的条件                                                       |
| ----------------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| HTTP/3            | 弱网下首次连接更快，重连可以 0-RTT             | 需要相应模块，并放通 UDP 443。国内部分网络对 UDP 443 有干扰          |
| `gzip_static`     | 直接发送构建时生成的 `.gz`，请求到来时不再现压 | 每个目标文件旁边要有同名 `.gz`。适合 `assets` 里的大脚本和样式       |
| `open_file_cache` | 记住文件句柄，减少 `stat()`                    | 文件经常替换时，缓存的属性会暂时是旧的。以目前的首字节，收益有限     |
| Brotli            | 比 gzip 再小大约 15% 到 20%                    | 要额外安装模块，或者把压缩交给 CDN                                   |
| CDN               | 各省从近处的节点取文件                         | 单独计费。接入前先看价格、缓存规则和回源                             |
| HSTS              | 浏览器在一段时间内只走 HTTPS                   | 下发后，在 `max-age` 内浏览器会拒绝 HTTP。先用较短的时间确认跳转稳定 |

这几项目前都不启用。

## 这几步各自省的是什么

- 连接：HTTP/2 和 TLS 会话复用，让重复访问少握手。
- 体积：gzip 处理文本，webp 处理图片。
- 再次访问：`/assets/` 放 30 天，其他静态文件放 7 天，HTML 每次确认，没变就 304。
- 机器本身：文件直接送上网卡，静态资源不写日志，请求路径里没有后端。
- 入口：根域名带着自己的证书跳到主站，不会先打开一整份博客再离开。

对这个流量的个人静态站，上面这些已经够用。第十四步里的项目是在此之上的追加，等有对应需求再开。
