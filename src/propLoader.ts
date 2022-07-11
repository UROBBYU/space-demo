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
        const slashIndex = v.src.lastIndexOf('/')
        const dotIndex = v.src.lastIndexOf('.')
        name = v.src.substring(slashIndex + 1, dotIndex)
    }
    props.img[name] = v
})

export default props