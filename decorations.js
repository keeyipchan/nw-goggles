// Make MenuButtons look like triangles
createEl_After.push(function(orig, config, el) {
	if (orig.tag === 'MenuButton') {
		pushEl(el, createEl('TrianglePointingDown'))
	}
});
