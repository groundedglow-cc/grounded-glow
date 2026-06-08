# 练习数据同步修复方案

## 问题

前端提交练习答案的字段名（`userAnswer`、`isCorrect`、`groupId`）与 Java VO 的字段名（`answer`、`correct`、`groupIndex`）不匹配，导致数据库存的全是 null/默认值。跨设备拉取数据后因格式不同无法渲染。

## 涉及的项目和文件

| 项目 | 文件 | 改动 |
|------|------|------|
| light-blog | `ExerciseSubmitVo.java` | VO 字段名改为前端实际发送的 |
| light-blog | `JfExerciseResult.java` | Entity 新增 `groupId`、`isSkipped` 字段 |
| light-blog | `JfExerciseController.java` | 适配新 VO 字段 |
| light-blog | `ExerciseServiceImpl.java` | 适配新字段存储 |
| japa-flow | `app.js` | `pullServerData()` 添加格式转换 |
| 数据库 | `jf_exercise_result` 表 | 新增 `group_id`、`is_skipped` 列 |

## 发布步骤

### Step 1: 数据库变更（手动，SSH 到服务器）

```bash
sudo docker exec -i light-blog-mysql mysql -u light_blog -plight_blog_password techblog << 'EOF'
ALTER TABLE jf_exercise_result
  ADD COLUMN group_id VARCHAR(32) DEFAULT '' AFTER exercise_id,
  ADD COLUMN is_skipped TINYINT(1) NOT NULL DEFAULT 0 AFTER correct;
EOF
```

验证：
```bash
sudo docker exec light-blog-mysql mysql -u light_blog -plight_blog_password -e "DESCRIBE techblog.jf_exercise_result;"
```

> 应看到新增的 `group_id` 和 `is_skipped` 列。此变更向后兼容，新增列有默认值，不影响现有数据。

### Step 2: 发布 light-blog（Java 后端）

代码改动后 push main，GitHub Actions 自动构建部署。

验证：
```bash
# 带 token 提交一条测试数据
TOKEN="你的token"
curl -s -X POST "https://groundedglow.cc/api/japaflow/lessons/1/exercises/test-1" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"groupId":"ex-i-1","userAnswer":"テスト","isCorrect":true,"isSkipped":false}'

# 查看导出数据，确认字段有值
curl -s -H "Authorization: Bearer $TOKEN" "https://groundedglow.cc/api/japaflow/progress/export" | python3 -m json.tool | head -30
```

### Step 3: 发布 japa-flow（前端）

代码改动后 push main，GitHub Actions 自动构建部署。

验证：
1. 无痕模式打开 `japaflow.groundedglow.cc` → 登录
2. 访问练习页 → 应能看到之前的作答记录
3. 提交新答案 → 换浏览器查看 → 答案应能同步

### Step 4: 清理旧数据（可选）

旧数据的 `group_id` 为空、`answer` 为 null，但不影响使用（前端会显示"未作答"）。如果需要清理，可以删除旧记录让用户重新作答：

```bash
sudo docker exec -i light-blog-mysql mysql -u light_blog -plight_blog_password techblog << 'EOF'
DELETE FROM jf_exercise_result WHERE answer IS NULL;
EOF
```
