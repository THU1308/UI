
$(document).ready(function () {
    // Bắt sự kiện khi nút "Dự đoán" được click
    $('.get-data-btn').click(function () {
        // Khởi tạo một biến để xác định có thể gửi dữ liệu hay không
        let canSubmit = true;

        // Khởi tạo một mảng để lưu trữ dữ liệu từ bảng
        let data = [];

        // Lặp qua từng hàng trong tbody của bảng
        $('tbody tr').each(function (index) {
            // Lấy giá trị từng input trong hàng hiện tại và lưu vào đối tượng rowData
            let timeValue = $(this).find('td:eq(0) input[type="datetime-local"]').val();
            let konPlongLuongMua = $(this).find('td:eq(1) input[type="number"]').val();
            let konTumLuongMua = $(this).find('td:eq(2) input[type="number"]').val();
            let mangCanhLuongMua = $(this).find('td:eq(3) input[type="number"]').val();
            let konPlongDongChay = $(this).find('td:eq(4) input[type="number"]').val();
            let konTumDongChay = $(this).find('td:eq(5) input[type="number"]').val();

            // Kiểm tra không được để trống trường dữ liệu nào
            if (!timeValue || !konPlongLuongMua || !konTumLuongMua || !mangCanhLuongMua || !konPlongDongChay || !konTumDongChay) {
                alert(`Mẫu dữ liệu ${index + 1} có trường dữ liệu bị thiếu.`);
                canSubmit = false;
                return false; // Dừng vòng lặp nếu có trường dữ liệu thiếu
            }

            // Kiểm tra số không được âm
            if (parseFloat(konPlongLuongMua) < 0 || parseFloat(konTumLuongMua) < 0 || parseFloat(mangCanhLuongMua) < 0 ||
                parseFloat(konPlongDongChay) < 0 || parseFloat(konTumDongChay) < 0) {
                alert(`Mẫu dữ liệu ${index + 1} có dữ liệu bị âm.`);
                canSubmit = false;
                return false; // Dừng vòng lặp nếu có số âm
            }

            // Kiểm tra cột thời gian mỗi bản ghi cách nhau 6 tiếng
            if (index > 0) {
                let prevTime = new Date($('tbody tr').eq(index - 1).find('td:eq(0) input[type="datetime-local"]').val());
                let currentTime = new Date(timeValue);
                let timeDiff = Math.abs(currentTime - prevTime) / 36e5; // Chuyển đổi ra giờ

                if (timeDiff !== 6) {
                    alert(`Hai mẫu dữ liệu liền nhau phải cách nhau 6 tiếng.`);
                    canSubmit = false;
                    return false; // Dừng vòng lặp nếu thời gian cách nhau ít hơn 6 tiếng
                }
            }

            // Lưu dữ liệu vào mảng data
            let rowData = {
                time: new Date(timeValue).toISOString(),
                konPlongLuongMua: konPlongLuongMua,
                konTumLuongMua: konTumLuongMua,
                mangCanhLuongMua: mangCanhLuongMua,
                konPlongDongChay: konPlongDongChay,
                konTumDongChay: konTumDongChay
            };
            data.push(rowData);
        });

        // Nếu có thể gửi dữ liệu, in ra mảng data trong console để kiểm tra
        if (canSubmit) {
            console.log(data);
            // Ví dụ: hiển thị dữ liệu trong alert
            alert("Dữ liệu đã hợp lệ");
        }
    });
});