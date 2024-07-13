
$(document).ready(function () {
    // Hàm để đọc file CSV
    function readCSV(file) {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                console.log(results.data.filter((row) => row.length > 0));
                processData(results.data.filter((row) => row.length > 0));
            },
        });
    }

    // Hàm để đọc file XLSX
    function readXLSX(file) {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: "array" });
            var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            var jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            console.log(jsonData.filter((row) => row.length > 0));
            processData(jsonData.filter((row) => row.length > 0));
        };
        reader.readAsArrayBuffer(file);
    }

    // Hàm để chuyển đổi giá trị thời gian của Excel thành ngày tháng năm
    function excelDateToJSDate(serial) {
        var utc_days = Math.floor(serial - 25569);
        var utc_value = utc_days * 86400;
        var date_info = new Date(utc_value * 1000);

        var fractional_day = serial - Math.floor(serial) + 0.0000001;

        var total_seconds = Math.floor(86400 * fractional_day);

        var seconds = total_seconds % 60;

        total_seconds -= seconds;

        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;

        return new Date(
            date_info.getFullYear(),
            date_info.getMonth(),
            date_info.getDate(),
            hours,
            minutes,
            seconds
        );
    }

    // Định nghĩa lớp Record đại diện cho một bản ghi
    class Record {
        constructor(
            time,
            konPlongLuongMua,
            konTumLuongMua,
            mangCanhLuongMua,
            konPlongDongChay,
            konTumDongChay
        ) {
            this.time = time;
            this.konPlongLuongMua = konPlongLuongMua;
            this.konTumLuongMua = konTumLuongMua;
            this.mangCanhLuongMua = mangCanhLuongMua;
            this.konPlongDongChay = konPlongDongChay;
            this.konTumDongChay = konTumDongChay;
        }

        // Phương thức để hiển thị bản ghi
        display() {
            return `
            <tr>
                <td class="border px-4 py-2">${this.time}</td>
                <td class="border px-4 py-2">${this.konPlongLuongMua}</td>
                <td class="border px-4 py-2">${this.konTumLuongMua}</td>
                <td class="border px-4 py-2">${this.mangCanhLuongMua}</td>
                <td class="border px-4 py-2">${this.konPlongDongChay}</td>
                <td class="border px-4 py-2">${this.konTumDongChay}</td>
            </tr>
        `;
        }
    }
    //map row excel sang class Record
    function excelRowToRecord(row) {
        return new Record(excelDateToJSDate(row[0]),
            row[1],
            row[2],
            row[3],
            row[4],
            row[5]);
    }

    // Hàm để xử lý dữ liệu và tạo các đối tượng Record
    function processData(data) {
        // Kiểm tra và xử lý dữ liệu
        var records = [];
        var validRecords = []; // Mảng chứa các bản ghi hợp lệ (4 bản ghi liền kề với khoảng cách 6 tiếng)
        var invalidRecords = []; // Mảng chứa các bản ghi không hợp lệ

        for (var i = 1; i < data.length; i = i + 4) {
            var record1 = excelRowToRecord(data[i]);
            var record2 = excelRowToRecord(data[i + 1]);
            var record3 = excelRowToRecord(data[i + 2]);
            var record4 = excelRowToRecord(data[i + 3]);

            // Kiểm tra và bỏ qua các dòng trống
            if (
                !isValidRow(record1) ||
                !isValidRow(record2) ||
                !isValidRow(record3) ||
                !isValidRow(record4)
            ) {
                alert("Dữ liệu trong file chưa đúng định dạng!Xem chi tiết trong Errors/invalid_records.xlsx");
                invalidRecords.push(record1, record2, record3, record4);
                writeInvalidRecordsToFile(invalidRecords);
                return;
            }

            if (checkTime(record1, record2, record3, record4)) {
                validRecords.push(record1, record2, record3, record4);
            } else {
                invalidRecords.push(record1, record2, record3, record4);
            }
        }
        // Hiển thị thông báo cho các bản ghi không hợp lệ (nếu có)
        if (invalidRecords.length > 0) {
            writeInvalidRecordsToFile(invalidRecords);
            alert(
                "Dữ liệu trong file chưa đúng định dạng!Xem chi tiết trong Errors/invalid_records.xlsx"
            );
            return;
        }

        // Xử lý và hiển thị các bản ghi hợp lệ
        validRecords.forEach(function (record) {
            var newRecord = new Record(
                record.time,
                record.konPlongLuongMua,
                record.konTumLuongMua,
                record.mangCanhLuongMua,
                record.konPlongDongChay,
                record.konTumDongChay
            );
            records.push(newRecord);
        });
        // Hiển thị dữ liệu
        displayData(records);
    }


    function checkTime(record1, record2, record3, record4) {
        // Chuyển đổi thời gian từ Excel sang đối tượng Date
        var time1 = record1.time;
        var time2 = record2.time;
        var time3 = record3.time;
        var time4 = record4.time;

        // Tính khoảng cách thời gian giữa các bản ghi
        var diff1to2 = Math.abs(time2 - time1) / (1000 * 60 * 60); // Đổi ra giờ
        var diff2to3 = Math.abs(time3 - time2) / (1000 * 60 * 60); // Đổi ra giờ
        var diff3to4 = Math.abs(time4 - time3) / (1000 * 60 * 60); // Đổi ra giờ

        // Kiểm tra các bản ghi có đáp ứng yêu cầu khoảng cách 6 tiếng không
        return (diff1to2 >= 6 && diff2to3 >= 6 && diff3to4 >= 6);
    }

    function isValidRow(row) {
        // Kiểm tra dòng có tồn tại không
        if (!row) {
            return false;
        }

        // Kiểm tra thuộc tính time là đối tượng Date hợp lệ
        if (!(row.time instanceof Date)) {
            return false;
        }

        // Kiểm tra các thuộc tính khác là số không âm
        let properties = ['konPlongLuongMua', 'konTumLuongMua', 'mangCanhLuongMua', 'konPlongDongChay', 'konTumDongChay'];
        for (let prop of properties) {
            if (
                row[prop] === null ||
                row[prop] === undefined ||
                isNaN(row[prop]) ||
                row[prop] < 0
            ) {
                return false;
            }
        }
        // Nếu không có vấn đề gì, trả về true
        return true;
    }

    // Hàm để hiển thị dữ liệu lên trang web
    // function displayData(records) {
    //     var table =
    //         '<div class="max-h-96 overflow-auto"><table class="table-auto w-full text-left">';
    //     table += "<thead><tr>";
    //     table += '<th class="px-4 py-2">Time</th>';
    //     table += '<th class="px-4 py-2">KonPlong_luongmua</th>';
    //     table += '<th class="px-4 py-2">KonTum_luongmua</th>';
    //     table += '<th class="px-4 py-2">Mang Canh_luongmua</th>';
    //     table += '<th class="px-4 py-2">KonPlong_dongchay</th>';
    //     table += '<th class="px-4 py-2">KonTum_dongchay</th>';
    //     table += "</tr></thead><tbody>";

    //     for (var i = 0; i < records.length; i++) {
    //         table += records[i].display();
    //     }

    //     table += "</tbody></table></div>";
    //     $("#dataTable").html(table);
    // }

    // Xử lý sự kiện khi chọn file
    $("#fileInput").change(function (event) {
        var file = event.target.files[0];
        var fileType = file.name.split(".").pop().toLowerCase();
        if (fileType === "csv") {
            readCSV(file);
        } else if (fileType === "xlsx") {
            readXLSX(file);
        } else {
            alert("Please select a valid CSV or XLSX file.");
        }
    });
});

//log lỗi
function writeInvalidRecordsToFile(invalidRecords) {
    // Chuyển đổi mảng các đối tượng Record thành mảng 2 chiều (array of arrays)
    let data = invalidRecords.map(record => [
        record.time,
        record.konPlongLuongMua,
        record.konTumLuongMua,
        record.mangCanhLuongMua,
        record.konPlongDongChay,
        record.konTumDongChay
    ]);

    // Tạo sheet từ mảng 2 chiều
    let ws = XLSX.utils.aoa_to_sheet(data);

    // Tạo workbook mới
    let wb = XLSX.utils.book_new();

    // Thêm sheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, "Errors");

    // Ghi workbook ra dạng mảng byte
    let wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Tạo Blob từ mảng byte
    let blob = new Blob([wbout], { type: "application/octet-stream" });

    // Lưu Blob thành file Excel
    saveAs(blob, "Errors/invalid_records.xlsx");
}

