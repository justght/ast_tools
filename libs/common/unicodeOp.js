

const traverse_unicode = {
    Literal(path) {
        fix(path)
    }
}



function fix(path) {
    let node = path.node;
    if (node.extra === undefined)
        return;
    delete node.extra;
}

exports.fix = traverse_unicode