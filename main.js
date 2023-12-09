
function loadInputTransactionView() {
    let jCont = $('#input-transaction')

    function reloadQuickInfo() {
        api.getQuickStatisticInfo(currentRoom.id, {
            onDone: ({mySpent, roomAverage}) => {
                mySpent = Number(mySpent), roomAverage = Number(roomAverage)
                let jElem = jCont.find('.left #money-spent')
                jElem.find('#my-spent .value')
                    .text(mySpent + 'k')
                    .toggleClass('value-green', mySpent <= roomAverage)
                    .toggleClass('value-red', mySpent > roomAverage)
                jElem.find('.room-average .value')
                    .text(roomAverage + 'k')
            }
        })
    }

    function errorsOfSMTransactionInput(name, price, date) {
        let errors = []
        if (TypeManager.isEmpty(name)) errors.push('Không được để trống trường "Tên sản phẩm"')
        if (TypeManager.isEmpty(price)) errors.push('Không được để trống trường "Giá sản phẩm"')
        else if (!TypeManager.isPositiveInterger(price)) errors.push('Giá trị của trường price phải là số nguyên không âm')
        if (TypeManager.isEmpty(date)) errors.push('Không được để trống trường "Ngày giao dịch"')
        else if (!TypeManager.isMyCustomDate(date)) errors.push('Trường thời gian giao dịch phải là thời gian hợp lệ có dạng dd/mm/yyyy')
        else {
            let [d, m, y] = date.split('/').map(x => Number(x))
            let now = new Date()
            let nowMonth = now.getMonth() + 1
            let nowDay = now.getDate()
            let nowYear = now.getFullYear()
            if (m == nowMonth && y == nowYear) {
                newItemInThisMonth = true
            }

            let weekDistance = y*12 + m - nowYear*12 - nowMonth
            if (weekDistance < 0) {
                errors.push('Không thể thêm giao dịch vào các tháng trước đó')
            }
            else if (weekDistance > 3) {
                errors.push('Chỉ được thêm giao dịch vào tối đa 3 tháng tương lai')
            }
        }
        return errors
    }

    function appendNewItemToListItem(newItem) {
        let jItems = jCont.find('#transactions .item')
        let jNewItem = createItemInListTransaction(newItem)

        let i = 0
        for (; i < jItems.length; i++) {
            let itemDate = jItems.eq(i).find('.info .user-bought').html().split(' - ')[1]
            if (CustomDateManager.d1SmallerThanD2(itemDate, newItem.transactionDate)) {
                break
            }
        }
        if (i != jItems.length) {
            jNewItem.insertBefore(jItems[i])
        } else {
            jCont.find('#transactions').append(jNewItem)
        }
    }

    // Add small transaction
    let jAddItemForm = jCont.find('.left form')
    jAddItemForm.find('input').val('')
    jAddItemForm.find('button').click(function (e) {
        e.preventDefault()
        jAddItemForm.find('.errors').html('')
        let name = jAddItemForm.find('input[name="name"]').val()
        let price = jAddItemForm.find('input[name="price"]').val()
        let date = jAddItemForm.find('input[name="date"]').val()

        let errors = errorsOfSMTransactionInput(name, price, date)

        if (errors.length == 0) {
            let newItemInListTrasnView = false
            let newItemInThisMonth = false
            let [d, m, y] = date.split('/').map(x => Number(x))
            if (m == currMonth && y == currYear) {
                newItemInListTrasnView = true
            }
            let now = new Date()
            let nowMonth = now.getMonth() + 1
            let nowYear = now.getFullYear()
            if (m == nowMonth && y == nowYear) {
                newItemInThisMonth = true
            }

            api.createSmallTransaction(name, price, date, currentRoom.id, {
                onDone: (newItem) => {
                    jAddItemForm.find('input').val('')
                    if (newItemInThisMonth) reloadQuickInfo()
                    if (!newItemInListTrasnView) return

                    appendNewItemToListItem(newItem)
                }
            })
        }

        else {
            jAddItemForm.find('.errors').html(
                errors.map(err => `* <span class="errors">${err}</span>`).join('<br>')
            )
        }
    })

    jCont.find('.user-selection').html('')
    api.getUsersOfRoomId(currentRoom.id, {
        onDone: (users) => {
            jCont.find('.user-selection')
            .html(
                `<option value="">Mọi người</option>`
                + users.map(({fullname, id}) => `<option value="${id}">${fullname}</option>`).join('')
            )
            .on('change', loadListTransaction)
        }
    })

    function createItemInListTransaction({id, itemName, userId, price, transactionDate}) {
        let editable = (userId == user.id) && (transactionDate.split('/')[1] == new Date().getMonth() + 1)
        let itemHtml = (`<div class="item">
            <div class="info">
                <div class="product-name">${itemName}</div>
                <div class="user-bought"></div>
            </div>

            ${editable ? `<div class="more-operation">
                <img class="icon" src="./resources/three-dot.png">
            </div>` : ''}

            <div class="cost">${price}k</div>
        </div>`)

        let fEHtml = `
            <div class="edit op">Sửa</div>
            <div class="delete op">Xóa</div>
        `

        let jElem = $(itemHtml)
        api.getUserInfo(userId, {
            onDone: (user) => {
                jElem.find('.info .user-bought').text(user.fullname + ' - ' + transactionDate)
            }
        })

        if (editable) addFloatElement(jElem.find('.more-operation')[0], fEHtml, {
            displayCondition: 'hover',
            relativePosition: 'left-middle',
            style: {
                zIndex: 3
            },
            script: (fE) => {
                // Adjust float element position when item
                // is first or last item
                $(parent)
                .on('mouseenter', () => {
                    let isFirst = (jElem.prev().length == 0)
                    let isLast = (jElem.next().length == 0)
                    if (isFirst) {
                        $(fE).css({
                            top: '12px',
                            bottom: 'unset',
                            transform: 'unset'
                        })
                    }

                    else if (isLast) {
                        $(fE).css({
                            top: 'unset',
                            bottom: '12px',
                            transform: 'unset'
                        })
                    }
                })
                .on('mouseout', function () {
                    $(fE).css({
                        top: 'unset',
                        bottom: '50%',
                        transform: 'translateY(50%)'
                    })
                })

                // Css float element
                $(fE).find('.op')
                .css({
                    width: '120px',
                    padding: '12px',
                    cursor: 'pointer'
                })
                .on('mouseenter', function () {
                    $(this).css({
                        'background-color': '#ccc'
                    })
                })
                .on('mouseout', function () {
                    $(this).css({
                        'background-color': 'white'
                    })
                })

                // Operations
                $(fE).find('.edit').click(function () {
                    fE.style.display = 'none'
                    setTimeout(() => fE.style.display = 'block', 100)

                    let popupHtml = `
                        <input type="text" placeholder="@productname" class="primary" name="name">
                        <input type="text" placeholder="@price" class="primary" name="price">
                        <input type="text" placeholder="@dd/mm/yy" class="primary" name="date">
                        <span class="errors"></span>
                    `

                    popUp(popupHtml, {
                        hideCloseButton: true,
                        style: {
                            'width': 'min-content'
                        },
                        script: (jPopUp) => {
                            jPopUp.find('input[name="name"]').val(itemName)
                            jPopUp.find('input[name="price"]').val(price)
                            jPopUp.find('input[name="date"]').val(transactionDate)
                            jPopUp.find('.errors').css('color', 'red')
                            jPopUp.find('input').css({
                                'border': '2px solid',
                                'width': '400px'
                            })
                        },
                        buttonHtmls: ['Hủy thay đổi', 'Lưu thay đổi'],
                        buttonClickHandlers: [
                            (jPopUp) => jPopUp.remove(),
                            (jPopUp) => {
                                let name = jPopUp.find('input[name="name"]').val()
                                let price = jPopUp.find('input[name="price"]').val()
                                let date = jPopUp.find('input[name="date"]').val()

                                let errors = errorsOfSMTransactionInput(name, price, date)
                                if (errors.length == 0) {
                                    api.updateSmallTransaction(id, itemName, price, date, {
                                        onDone: (newItem) => {
                                            jPopUp.find('input').val('')
                                            jPopUp.remove()
                                            jElem.remove()
                                            appendNewItemToListItem(newItem)
                                            reloadQuickInfo()
                                        }
                                    })
                                } else {
                                    jPopUp.find('.errors').html(
                                        '<br>' + errors.map(err => `* <span class="errors">${err}</span>`).join('<br>')
                                    )
                                }
                            }
                        ]
                    })
                })

                $(fE).find('.delete').click(function () {
                    api.deleteSmallTransaction(id, {
                        onDone: () => {
                            jElem.remove()
                            reloadQuickInfo()
                        }
                    })
                })
            }
        })

        return jElem
    }

    let currMonth = new Date().getMonth() + 1
    let currYear = new Date().getFullYear()

    let jTimeControl = $('#input-transaction #list-transactions .time-control')
    let jTimeDisplay = jTimeControl.find('.time')
    jTimeControl.find('.prev-month').click(() => {
        if (currMonth == 1) {
            currMonth = 12
            currYear--
        } else {
            currMonth--
        }
        loadListTransaction()
    })
    jTimeControl.find('.next-month').click(() => {
        if (currMonth == 12) {
            currMonth = 1
            currYear++
        } else {
            currMonth++
        }
        loadListTransaction()
    })

    function loadListTransaction() {
        jTimeDisplay.html(`${currMonth}/${currYear}`)
        jCont.find('#transactions').html('')
        let ofUserId = jCont.find('.user-selection').val()
        if (ofUserId == '') ofUserId = null

        api.getSmallTransaction(currentRoom.id, currMonth, currYear, ofUserId, {
            onDone: (items) => {
                items.sort((i1, i2) => {
                    return CustomDateManager.d1SmallerThanD2(i1.transactionDate, i2.transactionDate) ? 1 : -1
                })
                for (let itemElement of items.map(item => createItemInListTransaction(item))) {
                    jCont.find('#transactions').append(itemElement)
                }
            }
        })
    }
    loadListTransaction()
    reloadQuickInfo()
}

function loadListRoomMembersView() {
    let jCont = $('#room-members')
    jCont.find('.list-members > .item').remove()

    function createMemberAsLine({fullname, avatarUrl, phoneNumber, bankNumber, bankName}) {
        let html = `
            <div class="item">
                <img src="${avatarUrl}" alt="">
                <div class="name">${fullname}</div>
                <div class="phone">${phoneNumber}</div>
                <div class="bank">
                    ${bankName}: ${bankNumber}
                    <div class="more-info">
                        Chi tiết
                    </div>
                </div>
            </div>
        `

        let jItem = $(html)
        jItem.find('.bank .more-info').click(function () {

        })

        return jItem
    }

    api.getUsersOfRoomId(currentRoom.id, {
        onDone: (users) => {
            let jList = jCont.find('.list-members')
            users.map(user => createMemberAsLine(user)).forEach(j => jList.append(j))
            let jImgs = jList.find('.item > img')
            jImgs.width(jImgs.height())
        }
    })
}

function loadFixedCostsView() {
    let isAdmin = (user.id == currentRoom.adminUserId)
    let jCont = $('#fixed-costs')

    jCont.find('#list-fixed-costs-admin').toggle(isAdmin)
    jCont.find('#list-fixed-costs').toggle(!isAdmin)

    function loadMemberView() {
        
    }

    function loadAdminView() {

    }

    if (isAdmin) loadAdminView()
    else loadMemberView()
}

function loadRequestPaymentsView() {
    let jCont = $('#request-payments')
    let jItems = jCont.find('#list-request-payments .items').html('')

    api.getFeesWithDeadline(currentRoom.id, {
        onDone: (fees) => {
            fees.sort((f1, f2) => {
                return CustomDateManager.d1SmallerThanD2(f1.deadline, f2.deadline) ? 1 : -1
            })
            // padding view
            while (fees.length < 6) {
                fees.push({})
            }

            fees.forEach(({name, deadline, cost}, i) => {
                name = name ? `${i + 1}. ${name}` : ''
                cost = cost ? cost + 'k' : ''
                let itemHtml = `<div class="row">
                    <div class="field"><div class="wrap">${name}</div></div>
                    <div class="field"><div class="wrap">${cost}</div></div>
                    <div class="field"><div class="wrap">${deadline}</div></div>
                </div>`
                jItems.append(itemHtml)
            })
        }
    })
}

$('#left-side-bar .item[tab-id="input-transaction"]').click(loadInputTransactionView)
$('#left-side-bar .item[tab-id="room-members"]').click(loadListRoomMembersView)
$('#left-side-bar .item[tab-id="fixed-costs"]').click(loadFixedCostsView)
$('#left-side-bar .item[tab-id="request-payments"]').click(loadRequestPaymentsView)
