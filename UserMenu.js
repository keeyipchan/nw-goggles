function makeActionLink(action) {
	return createEl('a', {'class':'Action icon_' + action.icon}, action.title)
}

function UserMenuTpl() {
	var root = createEl('UserMenu')
	var actions = [
		{name: 'view_profile', title:'Who is this?'},
		{name: 'poke', title:'Poke'},
		{name: 'ignore', title:'Ignore'},
	]
	var items = createSubEls(root, 'MenuItem', actions.length)
	each(actions, function(i) {
		pushEl(items[i], makeActionLink(this))
	})
	return root
}
