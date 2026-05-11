# Database Migrations

## Setup

- Database: **MySQL**
- ORM: **TypeORM**
- Config: `src/config/database.ts`
- Migration files: `src/migrations/`

> Database `event_ticket` phải được tạo thủ công trước khi chạy migration.

---

## Scripts

```bash
# Chạy tất cả migration chưa chạy
npm run migration:run

# Revert migration gần nhất
npm run migration:revert
```

### Generate migration từ entity thay đổi

Script hiện tại hardcode tên file là `init`. Để truyền tên động, chạy trực tiếp:

```bash
npx typeorm-ts-node-commonjs migration:generate src/migrations/MigrationName -d src/config/database.ts
```

Ví dụ:

```bash
npx typeorm-ts-node-commonjs migration:generate src/migrations/InitSchema -d src/config/database.ts
npx typeorm-ts-node-commonjs migration:generate src/migrations/AddPaymentStatus -d src/config/database.ts
```

> 💡 Khuyến nghị: cập nhật lại script `migration:generate` trong `package.json` để bỏ hardcode `init`:
> ```json
> "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/config/database.ts"
> ```
> Sau đó dùng: `npm run migration:generate -- src/migrations/MigrationName`

---

## Workflow

### 1. Chỉnh sửa Entity

Cập nhật entity files trong `src/entities/`

### 2. Generate Migration

```bash
npx typeorm-ts-node-commonjs migration:generate src/migrations/MigrationName -d src/config/database.ts
```

### 3. Review file migration

Kiểm tra file vừa tạo trong `src/migrations/` trước khi chạy.  
File có dạng: `1234567890123-MigrationName.ts`

### 4. Chạy Migration

```bash
npm run migration:run
```

### 5. Rollback nếu cần

```bash
npm run migration:revert
```

---

## Best Practices

- Luôn review file migration trước khi chạy
- Test migration trên môi trường dev trước
- **Không chỉnh sửa migration đã được deploy/commit**
- Đặt tên migration mô tả rõ thay đổi (ví dụ: `AddQRCodeIndex`, `CreatePaymentTable`)
- Commit file migration cùng với entity thay đổi liên quan