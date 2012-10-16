function anchorTopRight(parent, child) {
	if (!parent.classList.contains('Absolute') && !parent.classList.contains('Relative')) {
		addClass(parent, 'Relative')
	}

	addClass(child, 'Absolute TopRight')

	pushEl(parent, child)
}
