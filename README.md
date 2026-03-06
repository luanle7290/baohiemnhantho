# Bảo Hiểm Nhân Thọ — Tuyển Dụng

Website theo dõi tuyển dụng Back Office của 7 công ty bảo hiểm nhân thọ lớn tại Việt Nam.

---

## 🚀 Deploy lên Netlify (Hướng dẫn từng bước)

### Bước 1: Tạo tài khoản GitHub (nếu chưa có)
1. Vào **github.com** → Sign up
2. Điền email, password, username → Xác nhận email

---

### Bước 2: Tạo repository trên GitHub
1. Đăng nhập GitHub → Click dấu **+** ở góc trên phải → **New repository**
2. Repository name: `baohiemnhantho`
3. Chọn **Public** (để Netlify deploy miễn phí)
4. **KHÔNG** tick vào "Add a README file"
5. Click **Create repository**

---

### Bước 3: Upload folder lên GitHub
Cách đơn giản nhất (không cần biết git):

1. Trên trang repository vừa tạo, click **uploading an existing file**
2. Kéo thả toàn bộ nội dung trong folder `baohiemnhantho/` vào (bao gồm cả thư mục `data/`)
3. Click **Commit changes**

> ⚠️ Lưu ý: Cần upload cả thư mục `data/` với file `jobs.json` bên trong.

---

### Bước 4: Kết nối Netlify
1. Vào **app.netlify.com** → Sign up bằng tài khoản GitHub
2. Click **Add new site** → **Import an existing project**
3. Chọn **GitHub** → Authorize Netlify
4. Chọn repository `baohiemnhantho`
5. Để nguyên các cài đặt mặc định → Click **Deploy site**
6. Đợi ~1 phút → Netlify sẽ cấp URL dạng: `random-name.netlify.app`

---

### Bước 5: Đổi tên URL (tùy chọn)
1. Trong Netlify dashboard → **Site configuration** → **Change site name**
2. Đặt tên: `baohiemnhantho` → URL sẽ thành `baohiemnhantho.netlify.app`

---

## 🔄 Cập nhật data hàng tuần

Mỗi tuần khi muốn cập nhật thông tin tuyển dụng:

1. Mở **Claude Cowork** → Nói: `"check job bảo hiểm"`
2. Claude tự động scrape 7 công ty → Cập nhật file `data/jobs.json`
3. Mở GitHub repository → Vào thư mục `data/` → Click `jobs.json` → Click icon bút chì (Edit)
4. Paste nội dung mới vào → Click **Commit changes**
5. Netlify tự động deploy lại trong ~30 giây ✅

> **Hoặc** nếu bạn dùng git trên máy tính:
> ```bash
> git add data/jobs.json
> git commit -m "Cập nhật tuyển dụng tuần $(date +%d/%m/%Y)"
> git push
> ```

---

## 📁 Cấu trúc file

```
baohiemnhantho/
├── index.html          ← App layout (sidebar + tabs + content)
├── style.css           ← Teal theme, responsive design
├── app.js              ← Filter, search, render logic
└── data/
    └── jobs.json       ← Tất cả data tuyển dụng (Claude cập nhật hàng tuần)
```

---

## ➕ Thêm công ty mới

Mở `data/jobs.json`, thêm object mới vào mảng `companies`:

```json
{
  "id": "ten-cong-ty",
  "name": "Tên Công Ty",
  "color": "#FF0000",
  "careerUrl": "https://...",
  "jobs": [
    {
      "title": "Tên vị trí",
      "location": "TP. Hồ Chí Minh",
      "posted": "Hôm qua",
      "category": "back-office"
    }
  ]
}
```

Đừng quên cập nhật `summary.totalCompanies` và `summary.totalJobs`.

---

## 7 Công ty hiện tại

| Công ty | Portal | Cập nhật 06/03/2026 |
|---------|--------|---------------------|
| Prudential | Workday | 28 vị trí |
| Manulife | careers.manulife.com | 17 vị trí |
| AIA | Workday | 8 vị trí |
| Dai-ichi Life | dai-ichi-life.com.vn | 2 vị trí |
| Sun Life | sunlife.com.vn | 23 vị trí |
| FWD | Workday | 3 vị trí |
| Generali | generali.talent.vn | 1 vị trí |

**Tổng: 82 vị trí Back Office**
