
function loadInputTransactionView() {
    let jContainer = $('#input-transaction')

    function reloadQuickInfo({mySpent, roomAverage}) {
        mySpent = Number(mySpent), roomAverage = Number(roomAverage)
        let jElem = jContainer.find('.left #money-spent')
        jElem.find('#my-spent .value')
            .text(mySpent + 'k')
            .toggleClass('value-green', mySpent <= roomAverage)
            .toggleClass('value-red', mySpent > roomAverage)
        jElem.find('.room-average .value')
            .text(roomAverage + 'k')
    }

    function createItemInListTransaction({productName, userBought, cost}) {
        let itemHtml = (`<div class="item">
            <div class="info">
                <div class="product-name">${productName}</div>
                <div class="user-bought">${userBought}</div>
            </div>

            <div class="more-operation">
                <img class="icon" src="./resources/three-dot.png">
                <button class="save-changes">Lưu thay đổi</button>
            </div>

            <div class="cost">${cost}</div>
        </div>`)

        let fEHtml = `
            <div class="edit op">Sửa</div>
            <div class="delete op">Xóa</div>
            <div class="info op">Thông tin</div>
        `

        let jElem = $(itemHtml)
        addFloatElement(jElem.find('.more-operation')[0], fEHtml, {
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

                let jMoreOp= jElem.find('.more-operation img')
                let jButton = jElem.find('.more-operation button')

                jButton.click(function () {
                    let cacheName = jElem.find('.product-name input').val()
                    jElem.find('.product-name').html(cacheName)
                    let cacheCost = jElem.find('.cost input').val()
                    jElem.find('.cost').html(cacheCost + 'k')
                    jButton.hide()
                    jMoreOp.show()
                    reloadQuickInfo({
                        mySpent: Math.round(Math.random()*1000),
                        roomAverage: Math.round(Math.random()*800)
                    })
                    setTimeout(() => $(fE).show(), 1000)
                })

                // Operations
                $(fE).find('.edit').click(function () {
                    $(fE).hide()
                    jMoreOp.hide()
                    jButton.show()

                    let cacheName = jElem.find('.product-name').html()
                    let cacheCost = jElem.find('.cost').html()

                    // Product name
                    jElem.find('.product-name')
                    .html('<input/>')
                    .find('input').val(cacheName)

                    jElem.find('.cost')
                    .html('<input/>k')
                    .find('input').val(cacheCost.replace('k', ''))
                })

                if (DEV_MODE) {
                    $(fE).find('.delete').click(function () {
                        jElem.remove()
                        reloadQuickInfo({
                            mySpent: Math.round(Math.random()*1000),
                            roomAverage: Math.round(Math.random()*800)
                        })
                    })
                }
            }
        })

        return jElem[0]
    }

    // Init test data in dev mode
    if (DEV_MODE) {
        let item = {
            productName: 'Kem đánh răng',
            userBought: 'Nguyễn Văn Hùng',
            cost: '49k'
        }
        let items = []
        for (let i = 0; i < 20; i++) items.push(item)
        for (let itemElement of items.map(item => createItemInListTransaction(item))) {
            jContainer.find('#transactions').append(itemElement)
        }
    }
}

loadInputTransactionView()
