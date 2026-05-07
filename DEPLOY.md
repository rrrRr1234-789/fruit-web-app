# 今日水果小管家网页部署说明

这个版本是纯静态网页，可以部署到 Netlify，部署后会得到一个公网网址，不需要手机和电脑在同一 Wi-Fi。

## 部署到 Netlify

1. 打开 https://app.netlify.com/drop
2. 把整个 `fruit-web-app` 文件夹拖进去。
3. Netlify 部署完成后会生成一个 `https://...netlify.app` 网址。
4. 用手机浏览器打开这个网址即可访问。

## 接收水果提交

网页已经内置 Netlify Forms 表单，表单名是 `fruit-choice`。

部署后，在 Netlify 后台：

1. 进入这个站点。
2. 打开 `Forms`，确认 form detection 已启用。
3. 重新部署一次站点，让 Netlify 扫描到表单。
4. 用户提交后，可以在 `Forms` 里看到提交记录。

## 邮件通知

在 Netlify 后台：

1. 进入站点的 `Project configuration`。
2. 打开 `Notifications`。
3. 找到 `Form submission notifications`。
4. 添加 Email notification。
5. 选择 `fruit-choice` 表单，填写你的接收邮箱。

完成后，别人提交“今日想吃”的水果，你会收到邮件。
