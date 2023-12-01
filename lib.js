
function addFloatElement(e, html, option = null) {
    let defaultOption = {
        script: null, // Fuction do to after insert html to float element, pass float element to first parameters
        style: null, // Additional style css for float element
        relativePosition: 'middle-top',
        definePositionProp: true,
        displayCondition: 'always'
    }
    if (option) {
        for (let key in option) {
            defaultOption[key] = option[key]
        }
    }
    option = defaultOption

    let floatElement = document.createElement('div')
    floatElement.innerHTML = html

    let mapRelativePositionToStyle = {
        'middle-top': {
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)'
        },
        'left-middle': {
            bottom: '50%',
            right: '100%',
            transform: 'translateY(50%)'
        }
    }

    if (option.definePositionProp) {
        e.style.position = 'relative'
    }

    Object.assign(floatElement.style, mapRelativePositionToStyle[option.relativePosition], option.style || {}, {
        position: 'absolute',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        overflow: 'hidden',
        boxShadow: '0px 5px 20px 1px #ccc'
    })

    if (option.script) {
        option.script(floatElement)
    }

    if (option.displayCondition == 'always') {   
        e.appendChild(floatElement)
    }
    if (option.displayCondition == 'hover') {   
        e.onmouseenter = () => {
            e.appendChild(floatElement)
        }
        e.onmouseleave = () => {
            e.removeChild(floatElement)
        }
    }

    function removeFloatElement() {
        if (option.displayCondition == 'hover') {
            e.onmouseenter = null
            e.onmouseleave = null
        }
        floatElement.remove()
    }
    
    return removeFloatElement
}
