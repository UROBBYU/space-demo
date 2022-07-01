const container = document.getElementById('props')

interface Props {
    img: { [key: string]: HTMLImageElement }
}

/**
 * Map, containing all props found under #props element.
 */
const props: Props = {
    img: {}
}

container.querySelectorAll('[name=img] > img')
.forEach((v: HTMLImageElement) => {
    let name = v.getAttribute('name')
    if (!name) {
        const slshi = v.src.lastIndexOf('/')
        const doti = v.src.lastIndexOf('.')
        name = v.src.substring(slshi + 1, doti)
    }
    props.img[name] = v
})

export default props