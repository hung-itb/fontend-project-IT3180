
let addTransactionFormLoaded = false
function loadInputTransactionView() {
    let jCont = $('#input-transaction')

    function reloadQuickInfo() {
        api.getQuickStatisticInfo(currentRoom.id, {
            onDone: ({ mySpent, roomAverage }) => {
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

    function checkSmallTransactionDate(date) {
        let error = null
        let [d, m, y] = date.split('/').map(x => Number(x))
        let now = new Date()
        let nowMonth = now.getMonth() + 1
        let nowYear = now.getFullYear()

        let weekDistance = y * 12 + m - nowYear * 12 - nowMonth
        if (weekDistance < 0) {
            error = 'Không thể thêm giao dịch vào các tháng trước đó, vui lòng sửa lại ngày giao dịch'
        }
        else if (weekDistance > 3) {
            error = 'Chỉ được thêm giao dịch vào tối đa 3 tháng tương lai, vui lòng sửa lại ngày giao dịch'
        }
        return error
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
    jAddItemForm.find('.errors').html('')
    if (!addTransactionFormLoaded) {
        addTransactionFormLoaded = true
        FormManager(jAddItemForm, {
            fieldNamesAndRequires: [
                { name: 'name', requires: 'notEmpty', vnName: 'Tên giao dịch' },
                { name: 'price', requires: ['notEmpty', 'isNonNegativeInt'], vnName: 'Số tiền' },
                {
                    name: 'date', requires: ['notEmpty', 'isMyCustomDate', (val, errors) => {
                        let error = checkSmallTransactionDate(val)
                        if (!error) return true
                        errors.push(error)
                        return false
                    }],
                    vnName: 'Ngày giao dịch'
                }
            ],
            onSubmit: (formData) => {
                let newItemInListTrasnView = false
                let newItemInThisMonth = false
                let [d, m, y] = formData['date'].split('/').map(x => Number(x))
                if (m == currMonth && y == currYear) {
                    newItemInListTrasnView = true
                }
                let now = new Date()
                let nowMonth = now.getMonth() + 1
                let nowYear = now.getFullYear()
                if (m == nowMonth && y == nowYear) {
                    newItemInThisMonth = true
                }
    
                let name = formData.name
                let price = formData.price
                let date = formData.date
    
                api.createSmallTransaction(name, price, date, currentRoom.id, {
                    onDone: (newItem) => {
                        jAddItemForm.find('.errors').html('')
                        jAddItemForm.find('input').val('')
                        if (newItemInThisMonth) reloadQuickInfo()
                        if (!newItemInListTrasnView) return
    
                        appendNewItemToListItem(newItem)
                    }
                })
            }
        })
    }

    jCont.find('.user-selection').html('')
    api.getUsersOfRoomId(currentRoom.id, {
        onDone: (users) => {
            jCont.find('.user-selection')
                .html(
                    `<option value="">Mọi người</option>`
                    + users.map(({ fullname, id }) => `<option value="${id}">${fullname}</option>`).join('')
                )
                .on('change', loadListTransaction)
        }
    })

    function createItemInListTransaction({ id, itemName, userId, price, transactionDate }) {
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

                    let popupHtml = `<form>
                        <input type="text" placeholder="@productname" class="primary" name="name">
                        <input type="text" placeholder="@price" class="primary" name="price">
                        <input type="text" placeholder="@dd/mm/yy" class="primary" name="date">
                        <span class="errors"></span>
                        <button class="submit" style="display: none;"></button>
                    </form>`

                    popUp(popupHtml, {
                        hideCloseButton: true,
                        style: {
                            'width': 'min-content'
                        },
                        script: (jPopUp) => {
                            jPopUp.find('input[name="name"]').val(itemName)
                            jPopUp.find('input[name="price"]').val(price)
                            jPopUp.find('input[name="date"]').val(transactionDate)

                            FormManager(jPopUp.find('form'), {
                                fieldNamesAndRequires: [
                                    { name: 'name', requires: 'notEmpty', vnName: 'Tên giao dịch' },
                                    { name: 'price', requires: ['notEmpty', 'isNonNegativeInt'], vnName: 'Số tiền' },
                                    {
                                        name: 'date', requires: ['notEmpty', 'isMyCustomDate', (val, errors) => {
                                            let error = checkSmallTransactionDate(val)
                                            if (!error) return true
                                            errors.push(error)
                                            return false
                                        }],
                                        vnName: 'Ngày giao dịch'
                                    }
                                ],
                                onSubmit: (formData) => {
                                    let name = formData.name
                                    let price = formData.price
                                    let date = formData.date
                                    
                                    api.updateSmallTransaction(id, name, price, date, {
                                        onDone: (newItem) => {
                                            jPopUp.find('input').val('')
                                            jPopUp.remove()
                                            jElem.remove()
                                            appendNewItemToListItem(newItem)
                                            reloadQuickInfo()
                                        }
                                    })
                                }
                            })
                        },
                        buttonHtmls: ['Hủy thay đổi', 'Lưu thay đổi'],
                        buttonClickHandlers: [
                            (jPopUp) => jPopUp.remove(),
                            (jPopUp) => jPopUp.find('form button.submit').click()
                        ],
                        style: {
                            'background-color': '#79E0EE'
                        }
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
    $('#view-join-room-req-of-room').toggle(user.id == currentRoom.adminUserId)
    let countReqs = $('#view-join-room-req-of-room .count').hide()
    api.getJoinRoomRequestOfRoom(currentRoom.id, {
        onDone: (joinReqs) => {
            countReqs.text(joinReqs.length)
            countReqs.toggle(joinReqs.length != 0)
        }
    })
    let jCont = $('#room-members')
    jCont.find('.list-members > .item').remove()

    function createMemberAsLine({ fullname, avatarUrl, phoneNumber, bankNumber, bankName }) {
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
        function load() {

        }
        api.getFees
    }

    if (isAdmin) loadAdminView()
    else loadMemberView()
}

let addFeeFormLoaded = false
function loadRequestPaymentsView() {
    let jCont = $('#request-payments')
    let jItems = jCont.find('#list-request-payments .items').html('')
    let limit = 15

    function createItemInListFees({ name, deadline, price, id }, i) {
        let nameInHtml = name ? `${i + 1}. ${name}` : ''
        let priceInHtml = price ? price + 'k' : ''
        let itemHtml = `<div class="row">
            <div class="field"><div class="wrap">${nameInHtml}</div></div>
            <div class="field"><div class="wrap">${priceInHtml}</div></div>
            <div class="field"><div class="wrap">${deadline || ''}</div></div>
        </div>`
        let jItem = $(itemHtml)

        let editable = (nameInHtml.length != 0) && true
        if (!editable) return jItem

        let fEHtml = `<div class="fee-with-deadline-ops">
            <button class="primary edit">Sửa</button>
            <button class="primary delete">Xóa</button>
        </div>`
        addFloatElement(jItem[0], fEHtml, {
            displayCondition: 'hover',
            script: (fE) => {
                let style =  {
                    padding: '12px',
                    width: '260px',
                    display: 'flex',
                    justifyContent: 'space-around'
                }
                Object.assign(fE.querySelector('.fee-with-deadline-ops').style, style)
            
                // Adjust float element position when item is first or last item
                jItem
                .on('mouseenter', () => {
                    let isFirst = (jItem.prev().length == 0)
                    if (isFirst) {
                        $(fE).css({
                            top: '100%',
                            bottom: 'unset',
                            'z-index': 10
                        })
                    }
                })
                .on('onmouseleave', function () {
                    $(fE).css({
                        top: 'unset',
                        bottom: '100%',
                        'z-index': null
                    })
                })

                $(fE).find('button.delete').click(() => {
                    api.deleteFeeWithDeadline(id, {
                        onDone: () => loadRequestPaymentsView()
                    })
                })

                $(fE).find('button.edit').click(() => {
                    $(fE).hide()
                    setTimeout(() => $(fE).show(), 100)
                    let popupHtml = `
                        <form>
                            <input type="text" class="primary" name="name">
                            <input type="text" class="primary" name="price">
                            <input type="text" class="primary" name="deadline">
                            <span class="errors"></span>
                            <button class="submit" style="display: none;"></button>
                        </form>
                    `
                    popUp(popupHtml, {
                        hideCloseButton: true,
                        buttonHtmls: ['Thoát', 'Lưu cập nhật'],
                        buttonClickHandlers: [
                            (jPopUp) => jPopUp.remove(),
                            (jPopUp) => jPopUp.find('form button.submit').click()
                        ],
                        script: (jPopUp) => {
                            jPopUp.find('input[name="name"]').val(name)
                            jPopUp.find('input[name="price"]').val(price)
                            jPopUp.find('input[name="deadline"]').val(deadline)
                            FormManager(jPopUp.find('form'), {
                                fieldNamesAndRequires: [
                                    {name: 'name', requires: 'notEmpty', vnName: 'Tên chi phí'},
                                    {name: 'price', requires: ['notEmpty', 'isNonNegativeInt'], vnName: 'Số tiền'},
                                    {name: 'deadline', requires: ['notEmpty', 'isMyCustomDate'], vnName: 'Thời hạn'}
                                ],
                                onSubmit: (formData) => {
                                    let {name, price, deadline} = formData
                                    api.updateFeeWithDeadline(id, name, price, deadline, {
                                        onDone: (fee) => {
                                            jPopUp.remove()
                                            loadRequestPaymentsView()
                                        }
                                    })
                                }
                            })
                        }
                    })
                })
            }
        })
        return jItem
    }
    if (!addFeeFormLoaded) {
        addFeeFormLoaded = true
        FormManager(jCont.find('form'), {
            fieldNamesAndRequires: [
                {name: 'name', requires: 'notEmpty', vnName: 'Tên chi phí'},
                {name: 'price', requires: ['notEmpty', 'isNonNegativeInt'], vnName: 'Số tiền'},
                {name: 'deadline', requires: ['notEmpty', 'isMyCustomDate'], vnName: 'Thời hạn'}
            ],
            onSubmit: (formData) => {
                let {name, price, deadline} = formData
                api.createFeesWithDeadline(currentRoom.id, name, price, deadline, {
                    onDone: () => loadRequestPaymentsView()
                })
            },
            ipPlaceHolderSameVnName: false
        })
        jCont.find('.operations .add-fee-with-dealine').click(() => jCont.find('form button.submit').click())
    }

    let fees
    function displayFees(startIdx, endIdx) {
        jItems.find('.more-results').remove()
        for (var i = startIdx; i <= endIdx && i < fees.length; i++) {
            jItems.append(createItemInListFees(fees[i], i))
        }
        let remain = (i != fees.length) && (Object.keys(fees[i]).length != 0)
        if (remain) {
            jItems.append(`<div class="more-results text-clickable">Xem thêm ${limit} chi phí có thời hạn</div>`)
            jItems.find('.more-results').click(() => {
                displayFees(endIdx + 1, endIdx + limit)
            })
        }
    }
    api.getFeesWithDeadline(currentRoom.id, {
        onDone: (result) => {
            fees = result
            fees.sort((f1, f2) => {
                return CustomDateManager.d1SmallerThanD2(f1.deadline, f2.deadline) ? 1 : -1
            })
            // padding view
            while (fees.length < 6) {
                fees.push({})
            }
            displayFees(0, limit - 1)
        }
    })
}

$('#left-side-bar .item[tab-id="input-transaction"]').click(loadInputTransactionView)
$('#left-side-bar .item[tab-id="room-members"]').click(loadListRoomMembersView)
$('#left-side-bar .item[tab-id="fixed-costs"]').click(loadFixedCostsView)
$('#left-side-bar .item[tab-id="request-payments"]').click(loadRequestPaymentsView)
