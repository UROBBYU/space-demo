const container = document.getElementById('props');
const props = {
    img: {}
};
container.querySelectorAll('[name=img] > img')
    .forEach((v) => {
    let name = v.getAttribute('name');
    if (!name) {
        const slshi = v.src.lastIndexOf('/');
        const doti = v.src.lastIndexOf('.');
        name = v.src.substring(slshi + 1, doti);
    }
    props.img[name] = v;
});
export default props;
