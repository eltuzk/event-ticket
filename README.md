# Hệ thống quản lý bán vé sự kiện (Event Ticket System)

**Kho lưu trữ (Repository):** [https://github.com/eltuzk/event-ticket](https://github.com/eltuzk/event-ticket)

Đây là Hệ thống Quản lý Bán vé Sự kiện với giao diện (frontend) được xây dựng bằng React (Vite) và máy chủ (backend) được xây dựng bằng Node.js (Express).

## Yêu cầu hệ thống

- Node.js (khuyến nghị phiên bản v18 trở lên)
- MySQL Server

## Hướng dẫn cài đặt & thiết lập

### 1. Tải mã nguồn (Clone repository)

```bash
git clone https://github.com/eltuzk/event-ticket.git
cd event-ticket
```

### 2. Thiết lập cơ sở dữ liệu (Database Setup)

1. Đảm bảo rằng MySQL server của bạn đang hoạt động.
2. Tạo một cơ sở dữ liệu mới cho ứng dụng (tên mặc định: `event_ticket`).
   ```sql
   CREATE DATABASE event_ticket;
   ```

### 3. Thiết lập Backend

1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   - Copy file `.env.example` thành file `.env`:
     ```bash
     cp .env.example .env
     ```
   - Mở file `.env` và cập nhật các thông tin kết nối cơ sở dữ liệu (`DB_USER`, `DB_PASS`, `DB_NAME`, v.v.) sao cho phù hợp với cấu hình MySQL của bạn.
4. Chạy migration để tạo các bảng trong cơ sở dữ liệu:
   ```bash
   npm run migration:run
   ```
5. (Tùy chọn) Chạy lệnh seed để tạo dữ liệu mẫu ban đầu:
   ```bash
   npm run seed
   ```
6. Khởi động server backend cho môi trường phát triển (development):
   ```bash
   npm run dev
   ```
   Server backend sẽ hoạt động tại địa chỉ `http://localhost:3000`.

### 4. Thiết lập Frontend

1. Mở một terminal mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các thư viện cần thiết:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường:
   - Copy file `.env.example` thành file `.env`:
     ```bash
     cp .env.example .env
     ```
4. Khởi động server frontend cho môi trường phát triển (development):
   ```bash
   npm run dev
   ```
   Ứng dụng frontend sẽ có thể truy cập được trên trình duyệt của bạn (thông thường là ở `http://localhost:5173`).
