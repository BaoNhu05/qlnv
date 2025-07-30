// datepicker.js - Cấu hình datepicker với định dạng mm/dd/yyyy và giới hạn ngày
$(function() {
    $("#datepicker").datepicker({
        showOn: "button",
        buttonImage: "img/calendar-icon.png",
        buttonImageOnly: true,
        buttonText: "Chọn ngày",
        dateFormat: "mm/dd/yy",
        changeMonth: true,
        changeYear: true,
        yearRange: "1950:2030",
        showAnim: "slideDown",
        closeText: "Đóng",
        prevText: "Trước",
        nextText: "Tiếp",
        currentText: "Hôm nay",
        monthNames: ["Tháng Một", "Tháng Hai", "Tháng Ba", "Tháng Tư", "Tháng Năm", "Tháng Sáu",
            "Tháng Bảy", "Tháng Tám", "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"],
        monthNamesShort: ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
            "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"],
        dayNames: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
        dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        dayNamesMin: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
        weekHeader: "Tu",
        firstDay: 1
    });
});

// Đặt ngày mặc định và giới hạn ngày khi mở modal Thêm nhân viên
$(document).ready(function() {
    $("#btnThem").on("click", function() {
        const d = new Date(2025, 6, 29); // Hardcode 07/29/2025
        const month = ('0' + (d.getMonth() + 1)).slice(-2);
        const day = ('0' + d.getDate()).slice(-2);
        const year = d.getFullYear();
        const output = `${month}/${day}/${year}`;
        $('#datepicker').val(output);
        console.log("Set default date:", output);
        $("#datepicker").datepicker("option", "minDate", d);
        console.log("Set minDate to:", d);
    });

    // Khi mở modal sửa, bỏ giới hạn minDate
    $("#employeeModal").on("show.bs.modal", function(event) {
        if ($("#modalTitle").text() === "Cập nhật nhân viên") {
            $("#datepicker").datepicker("option", "minDate", null);
            console.log("Removed minDate restriction for editing");
        }
    });

    // Đặt ngày mặc định khi trang load
    const today = new Date(2025, 6, 29);
    const month = ('0' + (today.getMonth() + 1)).slice(-2);
    const day = ('0' + today.getDate()).slice(-2);
    const year = today.getFullYear();
    const todayFormatted = `${month}/${day}/${year}`;
    $('#datepicker').val(todayFormatted);
    console.log("Set initial date:", todayFormatted);
});