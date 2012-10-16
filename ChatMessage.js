function ChatMessageTpl() {
	var root = createEl('Message')
	pushEl(root, createEl('Time', {}, '%time'))
	pushEl(root, createEl('Avatar', {img:'%avatar_img'}))
	pushEl(root, createEl('UsernameLink', {href:'%profile_url'}, '%username'))
	pushEl(root, createEl('Text', {}, '%text'))

	var actions = createEl('ActionLinks')
	anchorTopRight(root, actions)
	pushEl(actions, createEl('a', {}, 'Reply,'))
	pushEl(actions, createEl('a', {}, 'rate,'))
	pushEl(actions, createEl('a', {}, 'report!'))
	pushEl(root, actions)

	return root
}
