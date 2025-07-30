// main.js — Quản lý nhân viên (Fixed Version for modal.js Error)
// ===========================

console.log("main.js được tải thành công!");

/******************** Utils ********************/
const $id = (selector) => document.querySelector(selector);
const $$id = (selector) => document.querySelectorAll(selector);

function getValue(id) {
    const el = $id(id);
    return el?.value?.trim() || "";
}

function setValue(id, value) {
    const el = $id(id);
    if (el) {
        el.value = value || "";
    } else {
        console.error(`Không tìm thấy phần tử với ID ${id}`);
    }
}

function show(el) {
    if (el) {
        el.style.display = "block";
    } else {
        console.error("Phần tử không tồn tại trong hàm show");
    }
}

function hide(el) {
    if (el) {
        el.style.display = "none";
    } else {
        console.error("Phần tử không tồn tại trong hàm hide");
    }
}

function removeVietnameseTones(str) {
    return str
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/đ/gi, "d")
        .toLowerCase();
}

function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseFormattedNumber(str) {
    return str.replace(/[^\d]/g, "");
}

function formatLargeNumber(number) {
    return Number(number).toLocaleString("vi-VN") + " ₫";
}

/******************** Model - Đối tượng Nhân Viên ********************/
class NhanVien {
    constructor(taiKhoan, hoTen, email, matKhau, ngayLam, luongCB, chucVu, gioLam) {
        this.taiKhoan = taiKhoan;
        this.hoTen = hoTen;
        this.email = email;
        this.matKhau = matKhau;
        this.ngayLam = ngayLam;
        this.luongCB = Number(luongCB);
        this.chucVu = chucVu;
        this.gioLam = Number(gioLam);
        this.tongLuong = 0;
        this.loaiNV = "";
    }

    tinhTongLuong() {
        let heSo = this.chucVu === "Sếp" ? 3 :
                  this.chucVu === "Trưởng phòng" ? 2 : 1;
        this.tongLuong = this.luongCB * heSo;
        return this.tongLuong;
    }

    xepLoai() {
        const h = this.gioLam;
        this.loaiNV = h >= 192 ? "Xuất sắc" :
                     h >= 176 ? "Giỏi" :
                     h >= 160 ? "Khá" : "Trung bình";
        return this.loaiNV;
    }
}

/******************** State ********************/
let danhSachNV = [];
let isEditMode = false;

/******************** Validation Functions ********************/
function showError(spanId, msg) {
    const el = $id(spanId);
    if (el) {
        el.innerText = msg;
        el.style.display = "block";
        el.style.color = "red";
    } else {
        console.error(`Không tìm thấy span với ID ${spanId}`);
    }
}

function clearError(spanId) {
    const el = $id(spanId);
    if (el) {
        el.innerText = "";
        el.style.display = "none";
    }
}

function clearAllErrors() {
    $$id(".sp-thongbao").forEach(s => {
        s.innerText = "";
        s.style.display = "none";
    });
}

function validateForm(data, isAdd) {
    console.log("Bắt đầu validate với data:", data);
    let valid = true;

    clearAllErrors();

    // 1. Tài khoản: 4-6 ký số, không để trống
    if (!data.taiKhoan) {
        showError("#tbTKNV", "Tài khoản không được để trống");
        valid = false;
    } else if (data.taiKhoan.length < 4 || data.taiKhoan.length > 6) {
        showError("#tbTKNV", "Tài khoản phải có 4-6 ký tự");
        valid = false;
    } else if (!/^\d+$/.test(data.taiKhoan)) {
        showError("#tbTKNV", "Tài khoản phải là số");
        valid = false;
    } else if (isAdd && danhSachNV.some(nv => nv.taiKhoan === data.taiKhoan)) {
        showError("#tbTKNV", "Tài khoản đã tồn tại");
        valid = false;
    }

    // 2. Tên nhân viên: phải là chữ, không để trống
    if (!data.hoTen) {
        showError("#tbTen", "Tên không được để trống");
        valid = false;
    } else if (!/^[a-zA-ZÀ-ỹ\s]+$/u.test(data.hoTen)) {
        showError("#tbTen", "Tên phải là chữ");
        valid = false;
    }

    // 3. Email: đúng định dạng, không để trống
    if (!data.email) {
        showError("#tbEmail", "Email không được để trống");
        valid = false;
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(data.email)) {
        showError("#tbEmail", "Email không hợp lệ");
        valid = false;
    }

    // 4. Mật khẩu: 6-10 ký tự (số, in hoa, đặc biệt), không để trống
    if (!data.matKhau) {
        showError("#tbMatKhau", "Mật khẩu không được để trống");
        valid = false;
    } else if (!/^(?=.*\d)(?=.*[A-Z])(?=.*[^\w\s]).{6,10}$/.test(data.matKhau)) {
        showError("#tbMatKhau", "Mật khẩu 6-10 ký tự, chứa ít nhất 1 số, 1 in hoa, 1 ký tự đặc biệt");
        valid = false;
    }

    // 5. Ngày làm: không để trống, định dạng mm/dd/yyyy
    if (!data.ngayLam) {
        showError("#tbNgay", "Ngày làm không được để trống");
        valid = false;
    } else {
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        if (!dateRegex.test(data.ngayLam)) {
            showError("#tbNgay", "Định dạng ngày phải là mm/dd/yyyy");
            valid = false;
        } else {
            const [_, month, day, year] = data.ngayLam.match(dateRegex);
            const date = new Date(year, month - 1, day);
            if (date.getMonth() + 1 != month || date.getDate() != day || date.getFullYear() != year) {
                showError("#tbNgay", "Ngày không hợp lệ");
                valid = false;
            }
        }
    }

    // 6. Lương cơ bản: 1,000,000 - 20,000,000, không để trống
    if (!data.luongCB) {
        showError("#tbLuongCB", "Lương cơ bản không được để trống");
        valid = false;
    } else {
        const luong = Number(data.luongCB);
        if (isNaN(luong) || luong < 1000000 || luong > 20000000) {
            showError("#tbLuongCB", "Lương cơ bản từ 1,000,000 - 20,000,000");
            valid = false;
        }
    }

    // 7. Chức vụ: phải chọn hợp lệ
    if (!data.chucVu || data.chucVu === "Chọn chức vụ") {
        showError("#tbChucVu", "Vui lòng chọn chức vụ hợp lệ");
        valid = false;
    } else if (!["Sếp", "Trưởng phòng", "Nhân viên"].includes(data.chucVu)) {
        showError("#tbChucVu", "Chức vụ phải là: Sếp, Trưởng phòng, hoặc Nhân viên");
        valid = false;
    }

    // 8. Giờ làm: 80-200 giờ, không để trống
    if (!data.gioLam) {
        showError("#tbGiolam", "Giờ làm không được để trống");
        valid = false;
    } else {
        const gio = Number(data.gioLam);
        if (isNaN(gio) || gio < 80 || gio > 200) {
            showError("#tbGiolam", "Giờ làm trong tháng từ 80 - 200 giờ");
            valid = false;
        }
    }

    console.log("Kết quả validate:", valid);
    return valid;
}

/******************** Modal và Form Functions ********************/
function setupModal(editMode) {
    console.log("🔧 Setup modal, editMode:", editMode);
    isEditMode = editMode;
    const title = $id("#header-title");
    if (title) {
        title.innerText = editMode ? "Cập nhật nhân viên" : "Thêm nhân viên";
    } else {
        console.error("Không tìm thấy #header-title");
    }
    const btnCapNhat = $id("#btnCapNhat");
    const btnThemNV = $id("#btnThemNV");
    if (editMode) {
        if (btnCapNhat) {
            show(btnCapNhat);
        } else {
            console.error("Không tìm thấy #btnCapNhat");
        }
        if (btnThemNV) {
            hide(btnThemNV);
        } else {
            console.error("Không tìm thấy #btnThemNV");
        }
    } else {
        if (btnCapNhat) {
            hide(btnCapNhat);
        } else {
            console.error("Không tìm thấy #btnCapNhat");
        }
        if (btnThemNV) {
            show(btnThemNV);
        } else {
            console.error("Không tìm thấy #btnThemNV");
        }
    }
    const tknvInput = $id("#tknv");
    if (tknvInput) {
        tknvInput.disabled = editMode;
    } else {
        console.error("Không tìm thấy #tknv");
    }
    if (!editMode) resetForm();
    clearAllErrors();
}

/******************** Core Functions ********************/
function collectFormData() {
    console.log("Thu thập dữ liệu từ form...");
    const data = {
        taiKhoan: getValue("#tknv"),
        hoTen: getValue("#name"),
        email: getValue("#email"),
        matKhau: getValue("#password"),
        ngayLam: getValue("#datepicker"),
        luongCB: parseFormattedNumber(getValue("#luongCB")),
        chucVu: getValue("#chucvu"),
        gioLam: getValue("#gioLam")
    };
    console.log("Dữ liệu thu thập:", data);
    return data;
}

function handleThemNV() {
    console.log("=== BẮT ĐẦU THÊM NHÂN VIÊN MỚI ===");
    try {
        const data = collectFormData();
        if (!validateForm(data, true)) {
            console.log("Validation thất bại");
            return;
        }
        const nv = new NhanVien(
            data.taiKhoan,
            data.hoTen,
            data.email,
            data.matKhau,
            data.ngayLam,
            data.luongCB,
            data.chucVu,
            data.gioLam
        );
        nv.tinhTongLuong();
        nv.xepLoai();
        danhSachNV.push(nv);
        saveToStorage();
        render();
        $("#myModal").modal("hide");
        resetForm();
        showSuccessMessage(`Đã thêm nhân viên "${nv.hoTen}" thành công!`);
        console.log("=== THÊM NHÂN VIÊN THÀNH CÔNG ===");
    } catch (error) {
        console.error("Lỗi khi thêm nhân viên:", error);
        showError("#tbTKNV", "Có lỗi xảy ra khi thêm nhân viên");
    }
}

function handleCapNhatNV() {
    console.log("=== BẮT ĐẦU CẬP NHẬT NHÂN VIÊN ===");
    try {
        const data = collectFormData();
        if (!validateForm(data, false)) {
            console.log("Validation thất bại");
            return;
        }
        const index = danhSachNV.findIndex(nv => nv.taiKhoan === data.taiKhoan);
        if (index === -1) {
            console.error("Không tìm thấy nhân viên để cập nhật");
            showError("#tbTKNV", "Không tìm thấy nhân viên");
            return;
        }
        const nv = danhSachNV[index];
        Object.assign(nv, {
            hoTen: data.hoTen,
            email: data.email,
            matKhau: data.matKhau,
            ngayLam: data.ngayLam,
            luongCB: Number(data.luongCB),
            chucVu: data.chucVu,
            gioLam: Number(data.gioLam)
        });
        nv.tinhTongLuong();
        nv.xepLoai();
        saveToStorage();
        render();
        $("#myModal").modal("hide");
        resetForm();
        showSuccessMessage(`Đã cập nhật nhân viên "${nv.hoTen}" thành công!`);
        console.log("=== CẬP NHẬT NHÂN VIÊN THÀNH CÔNG ===");
    } catch (error) {
        console.error("Lỗi khi cập nhật nhân viên:", error);
        showError("#tbTKNV", "Có lỗi xảy ra khi cập nhật nhân viên");
    }
}

function render(list = danhSachNV) {
    console.log("🎨 Render danh sách với", list.length, "nhân viên");
    const tbody = $id("#tableDanhSach");
    if (!tbody) {
        console.error("❌ Không tìm thấy tbody #tableDanhSach");
        return;
    }
    tbody.innerHTML = list.length === 0 ? `
        <tr>
            <td colspan="8" class="text-center">Không có nhân viên nào</td>
        </tr>
    ` : list.map(nv => `
        <tr>
            <td>${nv.taiKhoan}</td>
            <td>${nv.hoTen}</td>
            <td>${nv.email}</td>
            <td>${nv.ngayLam}</td>
            <td>${nv.chucVu}</td>
            <td>${formatLargeNumber(nv.tongLuong)}</td>
            <td>${nv.loaiNV}</td>
            <td>
                <button class="btn btn-primary btn-sm btn-edit" data-tk="${nv.taiKhoan}" title="Chỉnh sửa">
                    <i class="fa fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-delete" data-tk="${nv.taiKhoan}" title="Xóa">
                    <i class="fa fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join("");
    attachTableEventListeners();
    console.log("✅ Render hoàn tất");
}

function attachTableEventListeners() {
    const tbody = $id("#tableDanhSach");
    if (!tbody) {
        console.error("Không tìm thấy #tableDanhSach để gắn sự kiện");
        return;
    }
    tbody.removeEventListener("click", handleTableClick);
    tbody.addEventListener("click", handleTableClick);
}

function handleTableClick(e) {
    const target = e.target.closest("button");
    if (!target) return;
    e.preventDefault();
    const taiKhoan = target.getAttribute("data-tk");
    if (!taiKhoan) {
        console.error("Không tìm thấy data-tk trên button");
        return;
    }
    if (target.classList.contains("btn-edit")) {
        console.log("🔧 Nhấn nút Sửa cho tài khoản:", taiKhoan);
        editNV(taiKhoan);
    } else if (target.classList.contains("btn-delete")) {
        console.log("🗑️ Nhấn nút Xóa cho tài khoản:", taiKhoan);
        deleteNV(taiKhoan);
    }
}

function timNhanVienTheoLoai() {
    const keyword = getValue("#searchName").toLowerCase();
    console.log("🔍 Tìm kiếm với keyword:", keyword);
    const filtered = danhSachNV.filter(nv => {
        if (!keyword) return true;
        return removeVietnameseTones(nv.loaiNV.toLowerCase()).includes(removeVietnameseTones(keyword)) ||
               removeVietnameseTones(nv.taiKhoan).includes(removeVietnameseTones(keyword)) ||
               removeVietnameseTones(nv.hoTen.toLowerCase()).includes(removeVietnameseTones(keyword)) ||
               removeVietnameseTones(nv.email.toLowerCase()).includes(removeVietnameseTones(keyword)) ||
               removeVietnameseTones(nv.chucVu.toLowerCase()).includes(removeVietnameseTones(keyword)) ||
               removeVietnameseTones(nv.ngayLam).includes(removeVietnameseTones(keyword));
    });
    console.log("Kết quả tìm kiếm:", filtered.length, "nhân viên");
    render(filtered);
}

function sortByTaiKhoan(ascending = true) {
    console.log("📊 Sắp xếp", ascending ? "tăng dần" : "giảm dần", "theo tài khoản");
    const sorted = [...danhSachNV].sort((a, b) =>
        ascending ? a.taiKhoan.localeCompare(b.taiKhoan) : b.taiKhoan.localeCompare(a.taiKhoan)
    );
    render(sorted);
}

function deleteNV(taiKhoan) {
    console.log("🗑️ Xóa nhân viên:", taiKhoan);
    const index = danhSachNV.findIndex(nv => nv.taiKhoan === taiKhoan);
    if (index === -1) {
        console.error("Không tìm thấy nhân viên để xóa");
        showError("#tbTKNV", "Không tìm thấy nhân viên");
        return;
    }
    const nv = danhSachNV[index];
    if (confirm(`Xác nhận xóa nhân viên "${nv.hoTen}" (${nv.taiKhoan})?`)) {
        danhSachNV.splice(index, 1);
        saveToStorage();
        render();
        showSuccessMessage(`Đã xóa nhân viên "${nv.hoTen}" thành công!`);
        console.log("✅ Xóa nhân viên thành công");
    }
}
window.deleteNV = deleteNV;

function editNV(taiKhoan) {
    console.log("🔧 Bắt đầu chỉnh sửa nhân viên:", taiKhoan);
    const nv = danhSachNV.find(nv => nv.taiKhoan === taiKhoan);
    if (!nv) {
        console.error("Không tìm thấy nhân viên với tài khoản:", taiKhoan);
        showError("#tbTKNV", "Không tìm thấy nhân viên");
        return;
    }
    isEditMode = true;
    try {
        setupModal(true);
        setValue("#tknv", nv.taiKhoan);
        setValue("#name", nv.hoTen);
        setValue("#email", nv.email);
        setValue("#password", nv.matKhau);
        setValue("#datepicker", nv.ngayLam);
        setValue("#luongCB", formatNumber(nv.luongCB));
        setValue("#chucvu", nv.chucVu);
        setValue("#gioLam", nv.gioLam);
        $("#myModal").modal("show");
        console.log("✅ Modal chỉnh sửa đã mở");
    } catch (error) {
        console.error("Lỗi khi mở modal chỉnh sửa:", error);
        showError("#tbTKNV", "Lỗi khi mở modal chỉnh sửa");
    }
}
window.editNV = editNV;

function resetForm() {
    console.log("🔄 Reset form");
    setValue("#tknv", "");
    setValue("#name", "");
    setValue("#email", "");
    setValue("#password", "");
    setValue("#datepicker", "");
    setValue("#luongCB", "");
    setValue("#chucvu", "Chọn chức vụ");
    setValue("#gioLam", "");
    clearAllErrors();
    const tknvInput = $id("#tknv");
    if (tknvInput) tknvInput.disabled = false;
}

/******************** Storage Functions ********************/
function saveToStorage() {
    try {
        localStorage.setItem("DSNV", JSON.stringify(danhSachNV));
        console.log("💾 Lưu vào localStorage thành công");
    } catch (error) {
        console.error("❌ Lỗi khi lưu vào localStorage:", error);
    }
}

function loadFromStorage() {
    try {
        const data = localStorage.getItem("DSNV");
        if (data) {
            danhSachNV = JSON.parse(data).map(o => {
                const nv = new NhanVien(
                    o.taiKhoan,
                    o.hoTen,
                    o.email,
                    o.matKhau,
                    o.ngayLam,
                    o.luongCB,
                    o.chucVu,
                    o.gioLam
                );
                nv.tongLuong = o.tongLuong;
                nv.loaiNV = o.loaiNV;
                return nv;
            });
            console.log("📂 Load từ localStorage thành công:", danhSachNV.length, "nhân viên");
            render();
        }
    } catch (error) {
        console.error("❌ Lỗi khi load từ localStorage:", error);
    }
}

/******************** Utility Functions ********************/
function showSuccessMessage(message) {
    console.log("📢 Hiển thị thông báo:", message);
    const existingToasts = document.querySelectorAll(".alert-success");
    existingToasts.forEach(toast => toast.remove());
    const toast = document.createElement("div");
    toast.className = "alert alert-success alert-dismissible fade show";
    toast.style.cssText = "position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
    toast.innerHTML = `
        <i class="fa fa-check-circle"></i> ${message}
        <button type="button" class="close" data-dismiss="alert">&times;</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

/******************** Event Listeners ********************/
function initEventListeners() {
    console.log("🎧 Khởi tạo event listeners...");
    const btnThem = $id("#btnThem");
    if (btnThem) {
        btnThem.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("➕ Mở modal thêm nhân viên");
            setupModal(false);
            $("#myModal").modal("show");
        });
    } else {
        console.error("Không tìm thấy #btnThem");
    }
    const btnThemNV = $id("#btnThemNV");
    if (btnThemNV) {
        btnThemNV.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("➕ Nhấn nút Thêm người dùng");
            handleThemNV();
        });
    } else {
        console.error("Không tìm thấy #btnThemNV");
    }
    const btnCapNhat = $id("#btnCapNhat");
    if (btnCapNhat) {
        btnCapNhat.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("🔄 Nhấn nút Cập nhật");
            handleCapNhatNV();
        });
    } else {
        console.error("Không tìm thấy #btnCapNhat");
    }
    const btnDong = $id("#btnDong");
    if (btnDong) {
        btnDong.addEventListener("click", function(e) {
            e.preventDefault();
            console.log("❌ Đóng modal");
            resetForm();
            $("#myModal").modal("hide");
        });
    } else {
        console.error("Không tìm thấy #btnDong");
    }
    const searchInput = $id("#searchName");
    if (searchInput) {
        searchInput.addEventListener("input", timNhanVienTheoLoai);
    } else {
        console.error("Không tìm thấy #searchName");
    }
    const btnTimNV = $id("#btnTimNV");
    if (btnTimNV) {
        btnTimNV.addEventListener("click", timNhanVienTheoLoai);
    } else {
        console.error("Không tìm thấy #btnTimNV");
    }
    const btnSapXepTang = $id("#SapXepTang");
    if (btnSapXepTang) {
        btnSapXepTang.addEventListener("click", () => sortByTaiKhoan(true));
    } else {
        console.error("Không tìm thấy #SapXepTang");
    }
    const btnSapXepGiam = $id("#SapXepGiam");
    if (btnSapXepGiam) {
        btnSapXepGiam.addEventListener("click", () => sortByTaiKhoan(false));
    } else {
        console.error("Không tìm thấy #SapXepGiam");
    }
    console.log("✅ Tất cả event listeners đã được khởi tạo");
}

/******************** Initialization ********************/
$(document).ready(function() {
    console.log("=== KHỞI TẠO ỨNG DỤNG QUẢN LÝ NHÂN VIÊN ===");
    loadFromStorage();
    initEventListeners();
    try {
        $("#datepicker").datepicker({
            dateFormat: "mm/dd/yy",
            changeMonth: true,
            changeYear: true
        });
        console.log("✅ Datepicker đã được khởi tạo");
    } catch (error) {
        console.error("Lỗi khi khởi tạo datepicker:", error);
    }
    console.log("=== KHỞI TẠO HOÀN TẤT ===");
});