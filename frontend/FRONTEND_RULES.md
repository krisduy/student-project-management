# Quy tac frontend

## Cong nghe

- Su dung React, Vite va React Router cho frontend moi trong thu muc `frontend/`.
- Moi man hinh chinh phai la route rieng trong React Router.
- Goi API thong qua `src/lib/api.js`, khong goi `fetch` truc tiep trong component neu co the tai su dung.
- Luu JWT thong qua `src/lib/session.js`.

## Ngon ngu giao dien

- Toan bo text hien thi cho nguoi dung viet bang tieng Viet.
- Loi dang nhap phai giu chung chung: `Email hoac mat khau khong hop le.`
- Khong hien thong tin ky thuat nhu JWT, HTTP status, stack trace tren UI nguoi dung.

## Thiet ke

- Giao dien dua theo frontend cu: bo cuc chia 2 cot o man dang nhap, ben trai la thuong hieu va loi ich, ben phai la form.
- Phong cach tong the: nghiem tuc, ro rang, phu hop he thong quan ly do an.
- Uu tien giao dien gon, de quet thong tin, khong lam landing page marketing.
- Dung icon tu `lucide-react` cho button, input va cac trang thai.
- Bo goc UI dung `8px` tru khi component cu can khac de giu nhan dien.

## Phan quyen va dieu huong

- Sau khi dang nhap thanh cong:
  - `admin` chuyen den `/admin`
  - `teacher` chuyen den `/teacher`
  - `student` chuyen den `/student`
- Route yeu cau dang nhap phai di qua protected route.
- Route public nhu `/login` phai tu chuyen huong neu da co session hop le.

## Ket noi backend

- Khi chay local Vite, proxy `/api` ve backend qua `VITE_PROXY_TARGET` hoac mac dinh `http://localhost:3000`.
- Khi chay Docker Compose, `VITE_PROXY_TARGET=http://app:3000`.
- Khong hard-code URL backend trong component.

## Mo rong tiep theo

- Admin: quan ly users, students, teachers, topics.
- Sinh vien: xem/tim kiem de tai trong, chon de tai va giang vien huong dan.
- Giang vien: xem danh sach de tai dang huong dan.
