
const ERROR = {
    USERNAME_DOESNOT_EXIST: 'USERNAME_DOESNOT_EXIST',
    WRONG_PASSWORD: 'WRONG_PASSWORD',
    EXISTED_USERNAME: 'EXISTED_USERNAME'
}

const DEV_MODE = true
let api

function RandomFunction(seed = 1) {
    return (s = 0, e = 1) => {
        let x = Math.sin(seed++) * 10000;
        return s + (x - Math.floor(x)) * (e - s);
    }
}

function FakeAPI() {
    let NUM_USERS = 100
    let MAX_NUM_SECURITY_QUESTIONS_PER_USER = 4
    let MAX_NUM_MEMBERS_PER_ROOM = 16
    let NUM_ROOMS = 80
    let MAX_NUM_JOIN_ROOM_REQUESTS_PER_USER = 2
    let MAX_NUM_SMALL_TRANSCATION_PER_USER_PER_ROOM = 30
    let MAX_NUM_FEE_WITH_DEADLINE = 72

    let random = RandomFunction()
    let randInt = (a, b) => Math.floor(random(a, b + 1))
    let sample = (arr) => arr[Math.floor(random()*arr.length)]
    let sample_n = (arr, n) => {
        let indices = new Set()
        for (let i = 0; i < n; i++) {
            let index = randInt(0, arr.length - 1)
            while (indices.has(index)) {
                index = randInt(0, arr.length - 1)
            }
            indices.add(index)
        }
        let result = []
        for (let index of indices) result.push(arr[index])
        return result
    }
    let d1SmallerThanD2 = (date1, date2) => {
        let [d1, m1, y1] = date1.split('/').map(i => Number(i))
        let [d2, m2, y2] = date2.split('/').map(i => Number(i))
        if (y1 < y2) return true
        if (y2 < y1) return false
        if (m1 < m2) return true
        if (m2 < m1) return false
        if (d1 < d2) return true
        if (d2 < d1) return false
        // date1 == date2, xử lý riêng
        return false
    }
    let randomDate = (after = null) => {
        if (!after) {
            let r = `${randInt(1, 28)}/${randInt(1, 12)}/${randInt(2020, 2023)}`
            while (d1SmallerThanD2('12/4/2023', r)) {
                r = `${randInt(1, 28)}/${randInt(1, 12)}/${randInt(2020, 2023)}`
            }
            return r
        }
        let [d, m, y] = after.split('/').map(i => Number(i))
        let n_y = randInt(y, 2023)
        if (n_y > y) {
            return `${randInt(1, 28)}/${randInt(1, 12)}/${n_y}`
        }
        let n_m = randInt(m, 12)
        if (n_m > m) {
            return `${randInt(1, 28)}/${n_m}/${n_y}`
        }
        let n_d = randInt(d, 28)
        if (n_d > d) {
            return `${n_d}/${n_m}/${n_y}`
        }
        return `${randInt(1, 28)}/${randInt(1, 12)}/${n_y + 1}`
    }
    let randomId = (prefix = '') => {
        return prefix + randInt(10E16, 10E17 - 1)
    }
    
    function initUsers(NUM_USERS) {
        let users = []
        let n1 = ['Nguyễn', 'Lê', 'Trần', 'Phạm', 'Hồ', 'Phan', 'Vũ', 'Dương']
        let n2 = ['Hoàng', 'Tiến', 'Minh', 'Văn', 'Thị', 'Quang', 'Duy', 'Anh', 'Hữu']
        let n3 = ['Hùng', 'Lực', 'Mạnh', 'Phong', 'Hiệp']
        let bankNames = ['Vietinbank', 'Agribank', 'Techcombank', 'Momo', 'Zalo pay', 'MB bank']
        for (let i = 0; i < NUM_USERS; i++) {
            let id = randomId()
            let fullname = [sample(n1), sample(n2), sample(n3)].join(' ')
            let username = '' + (i + 1)
            let password = username
            let phoneNumber = '0' + randInt(1E7, 1E8 - 1)
            let bankNumber = '' + randInt(1E9, 1E11 - 1)
            let bankName = sample(bankNames)
            let imageIndex = []
            for (let j = 0; j < 4; j++) imageIndex.push('default-avatar')
            for (let j = 0; j < 22; j++) imageIndex.push(j)
            let avatarUrl = './resources/user-images/' + sample(imageIndex, random) + '.jpg'
    
            users.push({
                id, fullname, username, password, phoneNumber, bankName, bankNumber, avatarUrl
            })
        }
        return users
    }
    function initSecurityQues(users, MAX_NUM_SECURITY_QUESTIONS_PER_USER) {
        let secQuess = []
        for (let user of users) {
            let userId = user.id
            let id = randomId()
            let numQues = randInt(0, MAX_NUM_SECURITY_QUESTIONS_PER_USER)
            for (let j = 0; j < numQues; j++) {
                let a = randInt(1E2, 1E3)
                let b = randInt(1E2, 1E3)
                secQuess.push({
                    userId, id,
                    question: `${a} + ${b} = ?`,
                    answer: '' + (a + b)
                })
            }
        }
        return secQuess
    }
    function initRooms(users, NUM_ROOMS, MAX_NUM_MEMBERS_PER_ROOM) {
        let rooms = []
        let room_user = []
        let roomNames1 = ['Trà đá', 'Anh em', 'Gia đình', 'Nhà trọ', 'Quán ăn', 'Anh em cây khế', 'Hội chị em', 'Hội anh em', 'Nhà ăn', 'Khu doanh trại']
        let roomNames2 = ['Bách Khoa', 'NEU', 'HUCE', 'KTX', 'B1', 'B3', 'IT1-01', 'Hà Nội', 'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh']
        let addresses = ['Bách Khoa', 'NEU', 'Hà Nội', 'TP HCM']
        for (let i = 0; i < NUM_ROOMS; i++) {
            let id = randomId()
            let numUsers = randInt(1, MAX_NUM_MEMBERS_PER_ROOM)
            let usersInRoom = sample_n(users, numUsers)
            let adminUserId = sample(usersInRoom).id

            for (let user of usersInRoom) {
                room_user.push({
                    userId: user.id,
                    roomId: id,
                    status: (adminUserId == user.id) ? 1 : randInt(0, 1),
                    joinDate: randomDate()
                })
            }
            let roomName = [sample(roomNames1), sample(roomNames2), '-', randInt(1, 9)].join(' ')
            let address = sample(addresses)

            rooms.push({
                id, adminUserId, roomName, address
            })
        }
        return [rooms, room_user]
    }
    function initJoinReq(users, rooms, room_user, MAX_NUM_JOIN_ROOM_REQUESTS_PER_USER) {
        let joinRoomRequests = []
        for (let user of users) {
            let numRequests = randInt(0, Math.min(MAX_NUM_JOIN_ROOM_REQUESTS_PER_USER, rooms.length))
            let roomIdsHasThisUser = new Set(
                room_user
                .filter(({userId}) => userId == user.id)
                .map(({userId}) => userId)
            )
            let allowedRooms = rooms.filter(({id}) => !roomIdsHasThisUser.has(id))
            for (let room of sample_n(allowedRooms, numRequests)) {
                joinRoomRequests.push({
                    roomId: room.id,
                    userId: user.id,
                    status: 1,
                    requestDate: randomDate()
                })
            }
        }
        return joinRoomRequests
    }
    function initSmallTransactions(room_user, MAX_NUM_SMALL_TRANSCATION_PER_USER_PER_ROOM) {
        let itemNames1 = ['Kem đánh răng', 'Cá', 'Mực', 'Giấy vệ sinh', 'Đậu phụ', 'Gạo', 'Kẹo mút',
            'Nem chua', 'Súng', 'Nước tương', 'Cà phê', 'Rau muống', 'Rau xà lách', 'Lạc', 'Ngô',
            'Thịt ba chỉ', 'Nước mắm', 'Chuối', 'Cá khô', 'Túi đựng rác']
        let itemNames2 = ['chợ Bách Khoa', 'chợ Long Biên', 'chợ Đồng Xuân', 'cửa hàng tạp hóa', 'vinmart', '', '']
        let notes = [
            'Đồ ăn hàng ngày',
            'Đồ dùng chung',
            'Khác'
        ]
        let smallTransactions = []
        let mapRoomIdToUserIds = {}
        for (let {roomId, userId, joinDate} of room_user) {
            if (!mapRoomIdToUserIds[roomId]) {
                mapRoomIdToUserIds[roomId] = []
            }
            mapRoomIdToUserIds[roomId].push([userId, joinDate])
        }
        for (let roomId in mapRoomIdToUserIds) {
            for (let [userId, joinDate] of mapRoomIdToUserIds[roomId]) {
                let numSTOfUserInRoom = randInt(0, MAX_NUM_SMALL_TRANSCATION_PER_USER_PER_ROOM)
                for (let i = 0; i < numSTOfUserInRoom; i++) {
                    let id = randomId()
                    let itemName = [sample(itemNames1), sample(itemNames2)].join(' ')
                    let price = randInt(10, 200)
                    let note = sample(notes)
                    smallTransactions.push({
                        id, userId, roomId,
                        itemName, price, note,
                        transactionDate: randomDate(joinDate)
                    })
                }
            }
        }
        return smallTransactions
    }
    function initFeeWithDeadline(room_user, MAX_NUM_FEE_WITH_DEADLINE) {
        let feeNames = [
            'Tiền điện',
            'Tiền nhà',
            'Tiền mừng cưới',
            'Tiền thuê phòng',
            'Tiền sửa bồn cầu',
            'Tiền sửa mái nhà'
        ]

        let user_feeWithDeadline = []
        let feesWithDealine = []

        let mapRoomIdToUserIds = {}
        for (let {roomId, userId, joinDate, status} of room_user) {
            if (!mapRoomIdToUserIds[roomId]) {
                mapRoomIdToUserIds[roomId] = []
            }
            mapRoomIdToUserIds[roomId].push([userId, joinDate, status])
        }

        for (let roomId in mapRoomIdToUserIds) {
            let numFees = randInt(1, MAX_NUM_FEE_WITH_DEADLINE)
            for (let i = 0; i < numFees; i++) {
                let id = randomId()
                let name = sample(feeNames)
                let deadline = randomDate()
                let numUsers = Math.max(1, mapRoomIdToUserIds[roomId].length - randInt(0, 2))
                let userIds = sample_n(mapRoomIdToUserIds[roomId], numUsers).map(x => x[0])
                
                for (let userId of userIds) {
                    user_feeWithDeadline.push({
                        userId,
                        feeId: id,
                        status: (random() < 0.7) ? 1 : 0
                    })
                }

                feesWithDealine.push({
                    id,
                    name, deadline,
                    roomId
                })
            }
        }
        return [feesWithDealine, user_feeWithDeadline]
    }
    
    let users = initUsers(NUM_USERS)
    let securityQuestions = initSecurityQues(users, MAX_NUM_SECURITY_QUESTIONS_PER_USER)
    let [rooms, room_user] = initRooms(users, NUM_ROOMS, MAX_NUM_MEMBERS_PER_ROOM)
    let joinRoomRequests = initJoinReq(users, rooms, room_user, MAX_NUM_JOIN_ROOM_REQUESTS_PER_USER)
    let smallTransactions = initSmallTransactions(room_user, MAX_NUM_SMALL_TRANSCATION_PER_USER_PER_ROOM)
    let [feesWithDealine, user_feeWithDeadline] = initFeeWithDeadline(room_user, MAX_NUM_FEE_WITH_DEADLINE)

    let userDAO = (() => {
        return {
            findUserByUsername: (un) => users.find(user => user.username == un),
            findUserById: (id) => users.find(user => user.id == id),
            saveUser: (user) => users.push(user),
            getRoomIdsOfUserId: (uid) => [...new Set(room_user.filter(({userId}) => userId == uid).map(({roomId}) => roomId))]
        }
    })()

    let roomDAO = (() => {
        return {
            getRoomsOfUserId: (uid) => {
                let roomIdsOfUser = new Set(room_user.filter(({userId}) => uid == userId).map(({roomId}) => roomId))
                return rooms.filter(room => roomIdsOfUser.has(room.id))
            }
        }
    })()

    return {
        login: function (username, password, {onDone, onFailed}) {
            let user = userDAO.findUserByUsername(username)
            if (!user) {
                onFailed(ERROR.USERNAME_DOESNOT_EXIST)
            }
            else if (user.password != password) {
                onFailed(ERROR.WRONG_PASSWORD)
            }
            else {
                localStorage.setItem('userId', user.id)
                onDone()
            }
        },
        logout: function ({onDone, onFailed}) {
            localStorage.removeItem('userId')
            onDone()
        },
        signUp: function (fullname, username, password, {onDone, onFailed}) {
            let user = userDAO.findUserByUsername(username)
            if (user) {
                onFailed(ERROR.EXISTED_USERNAME)
            }
            let newUser = {
                username,
                fullname,
                password
            }
            userDAO.saveUser(newUser)
            localStorage.setItem('userId', user.id)
            onDone()
        },
        getUserInfo: (userId, {onDone, onFailed}) => {
            let userIdStorage = localStorage.getItem('userId')
            if (userIdStorage != userId) {
                let roomIdsOfU1 = userDAO.getRoomIdsOfUserId(userId)
                let roomIdsOfU2 = new Set(userDAO.getRoomIdsOfUserId(userIdStorage))
                let twoUserInSameRoom = roomIdsOfU1.some(roomId => roomIdsOfU2.has(roomId))
                if (!twoUserInSameRoom) {
                    onFailed()
                }
            }
            let user = userDAO.findUserById(userId)
            onDone(user)
        },
        getRoomsOfUser: ({onDone, onFailed}) => {
            let userId = localStorage.getItem('userId')
            onDone(roomDAO.getRoomsOfUserId(userId))
        }
    }
}

function TrueAPI() {
    let base = ''
    return {
        login: function (username, password, {onDone, onFailed}) {
            $.post(base + '/api/login', {username, password}, onDone)
        }
    }
}

api = (DEV_MODE ? FakeAPI: TrueAPI)()
