
1) Đăng nhập
- Tham số đầu vào:
{
    username // Tên đăng nhập
    password // Mật khẩu
}
- Trả về có 3 trường hợp:
+ TH1: Thành công: Trả về status 200
+ TH2: Thất bại do username không tồn tại: Trả về status 401 và thông báo lỗi "USERNAME_DOESNOT_EXIST"
+ TH3: Thất bại do sai mật khẩu: Trả về status 401 và thông báo lỗi "WRONG_PASSWORD"

2) Đăng xuất
- Tham số đầu vào: Không có
- Trả về: Thành công trả về status 200

3) Đăng kí
- Tham số đầu vào:
{
    fullname // Tên người dùng
    username // Tên đăng nhập
    password // Mật khẩu
}
- Trả về có 3 trường hợp:
+ TH1: Thành công: Trả về status 200
+ TH2: Thất bại do username đã tồn tại: Trả về status 401 và thông báo lỗi "EXISTED_USERNAME"

4) Lấy thông tin cơ bản của người dùng
- Tham số đầu vào: Không có
- Trả về các thông tin của user bao gồm {
    fullname, username, phoneNumber, bankName, bankNumber, avatarUrl
}

5) Lấy các phòng mà người dùng đã đăng nhập đã tham gia
- Truyền vào: Không có
- Trả về: Mảng các phòng, mỗi phòng là 1 object như sau
{
    id // id Phòng
    roomName // Tên phòng
    address
    isAdmin // Người dùng hiện tại có phải là admin phòng hay không
}

6) Lấy thông tin các giao dịch mua bán nhỏ
- Truyền vào: {
    roomId // id phòng
    month // Tháng
    year // Năm
    userId // Người dùng thwucj hiện giao dịch
}
* Nếu userId == null thì hiểu là bất kì user nào cũng được
- Trả về: Mảng các giao dịch nhỏ, mỗi giao dịch là 1 object như trong cơ sở dữ liệu

7) Tạo giao dịch mua bán nhỏ
- Truyền vào: {
    name, price, date, roomId
}
- Trả về: Giao dịch đã tạo thành công

8) Cập nhật giao dịch mua bán nhỏ
- Truyền vào: {
    name, price, date,
    id // Mã giao dịch mua bán cần sửa
}
- Trả về: Giao dịch đã cập nhật thành công

9) Xóa giao dịch mua bán nhỏ
- Truyền vào: {
    id: Mã giao dịch
}
- Trả về: Thành công

10) Lấy thông tin của các user trong phòng
- Đầu vào: {
    roomId // mã phòng
}
- Trả về: Mảng các user, mỗi user là object có dạng
{
    fullname, phoneNumber, bankName, bankNumber, avatarUrl
}

11) Lấy thông tin thống kê nhanh về chi tiêu giao dịch nhỏ
- Đầu vào: {
    roomId // mã phòng
}
- Trả về:
{
    mySpent // Số tiền mình đã chi,
    roomAverage // Số tiền trung bình phòng đã chi
}

12) Tạo chi phí có thời hạn
- Truyền vào: {
    roomId, name, price, deadline
}

- Trả về: Thành công

13) Lấy chi phí có thời hạn
- Truyền vào: {
    roomId
}

- Trả về: Mảng chi phí có thời hạn, mỗi chi phí có thời hạn là object {
    name, price, deadline,
    id // Fee id
}

14) Cập nhật chi phí có thời hạn
- Truyền vào: {
    feeId // id fee cần sưuar
    name, price, deadline
}

- Trả về: Chi phí có thời hạn vừa sửa thành công

15) Xóa chi phí có thời hạn
- Truyền vào: {
    id: Mã phí cần xóa
}
- Trả về: Thành công

16) Lấy tình hình đóng phí có thời hạn
- Truyền vào: {
    roomId: Mã phòng,
    allUser // True hoặc False chỉ ra rằng lấy của cả phòng hay không
}
allUser == false: Lấy của mình user đã đăng nhập
allUser == true: Lấy của tất cả thành viên trong phòng
- Trả về:
+ TH1: allUser == true
Object như sau, gồm 3 key {
    key1 là feesWithDealine: Là mảng các chi phí có thời hạn, mỗi chi phí có thời hạn là 1 object có dạng {
        id, name, pricePerUser, deadline
    }

    key2 là payStatus: Là mảng cácobject, mỗi object có dạng {
        feeId, userId, status
    }

    key3 là users: Mảng các user, mỗi user gồm các trường thông tin {
        userId, username
    }
}
+ TH2: allUser == false
Trả về một mảng, mỗi phần tử có dạng như sau: {
    feeName, pricePerUser, status, deadline
}

17) Đảo ngược trạng thái đóng chi phí có thời hạn
- Truyền vào: {
    userId, feeId
}
- Trả về: Thành công

18) Tạo phòng
- Truyền vào: {
    name // Tên phòng mới,
    address // Địa chỉ
}

- Trả về: Thông tin phòng vừa tạo thành công

19) Gửi yêu cầu tham gia phòng
- Truyền vào: {
    roomId
}

- Trả về có 3 trường hợp:
+ TH1: Thành công trả về thành công
+ TH2: Lỗi do mã phòng không tồn tại, trả về status 401, tin nhắn lỗi "ROOM_ID_DOESNOT_EXIST"
+ TH3: Lỗi do người dùng đã ở trong phòng, trả về status 401, tin nhắn lỗi "USER_HAS_BEEN_IN_ROOM"

20) Lấy các yêu cầu tham gia phòng đã gửi của người dùng đã dăng nhập
- Truyền vào: Không có
- Trả về: Mảng các yêu cầu tham gia phòng có các trường thông tin {
    roomName
    requestDate
    status
    roomId
}

21) Lấy các yêu cầu tham gia phòng đã gửi tới phòng
- Truyền vào: {
    roomId
}
- Trả về: Mảng các yêu cầu tham gia phòng có các trường thông tin {
    requestDate
    userId
    fullname
    avatarUrl
}

22) Hủy yêu cầu tham gia phòng
- Truyền vào {
    roomId,
    userId
}
Nếu userId là null có nghĩa là user đã đăng nhập tự hủy yêu cầu vào phòng
Nếu userId khác null thì có nghĩa là admin của phòng roomId từ chối yêu cầu vào phòng của thằng userId
- Trả về: Thành công

23) Chấp nhận yêu cầu vào phòng
- Truyền vào {
    roomId,
    userId
}
- Trả về: Thành công

24) Thống kê tổng số tiền mà người dùng phải chi cho mỗi phòng mà họ tham gia trong tháng và năm chỉ định
- Đấu vào {
    month
    year
}

- Trả về mảng, mỗi phần tử là 1 object như sau {
    roomName // Tên phòng
    totalSpending // Tổng số tiền chi tiêu cho phòng này
}

25) Thống kê tổng số tiền mà người dùng phải chi cho tất cả các phòng mà họ tham gia trong 12 tháng của năm chỉ định
- Đấu vào {
    year
}

- Trả về mảng gồm 12 phần tử, phần tử thứ i là tổng số tiền chi tiêu của tháng i

26) Chuyển quyền trưởng phòng
- Đầu vào {
    roomId,
    newAdminId
}
- Trả về: Thành công

27) Rời phòng
- Đầu vào: {
    roomId
}

- Trả về: Thành công
Sẽ thất bại nếu user là trưởng phòng và số thành viên lớn hơn 1, khi đó trả về tin nhắn lỗi là "ROOM_ADMIN_CAN_NOT_LEAVE_ROOM"
